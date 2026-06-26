// ════════════════════════════════════════════════════════════════
// Diagnostics — expanded doctor + diagnose report.
//
// `runDoctor`   → structured CheckResult[] for humans (CLI renders it).
// `runDiagnose` → full JSON support bundle (Node, env, server, latency,
//                 capabilities, tools, rate-limit headers, versions).
//
// Both are pure — fetch is injectable so tests can stub the network.
// ════════════════════════════════════════════════════════════════
import { GraniqMCPClient, GraniqMCPError } from "./client.js";
import {
  DEFAULT_API_URL,
  PACKAGE_NAME,
  PACKAGE_VERSION,
  PROTOCOL_VERSION,
  type GraniqMCPConfig,
  type ToolDescriptor,
} from "./types.js";

export interface CheckResult {
  name: string;
  status: "ok" | "fail" | "warn";
  message: string;
  detail?: unknown;
}

export interface DoctorReport {
  apiUrl: string;
  checks: CheckResult[];
  ok: boolean;
}

const MIN_NODE_MAJOR = 18;
const MIN_NODE_MINOR_FOR_18 = 17;

function checkNode(): CheckResult {
  const v = typeof process !== "undefined" ? process.versions?.node : undefined;
  if (!v) return { name: "node_runtime", status: "warn", message: "non-Node runtime detected" };
  const [maj, min] = v.split(".").map(Number);
  const ok = maj > MIN_NODE_MAJOR || (maj === MIN_NODE_MAJOR && min >= MIN_NODE_MINOR_FOR_18);
  return {
    name: "node_runtime",
    status: ok ? "ok" : "fail",
    message: ok ? `Node ${v}` : `Node ${v} < required ${MIN_NODE_MAJOR}.${MIN_NODE_MINOR_FOR_18}`,
  };
}

function checkToken(token: string): CheckResult {
  if (!token) return { name: "token", status: "fail", message: "missing token" };
  if (!token.startsWith("gmcp_")) return { name: "token", status: "fail", message: "token must start with gmcp_" };
  if (token.length < 24) return { name: "token", status: "warn", message: "token seems too short" };
  return { name: "token", status: "ok", message: `token gmcp_…${token.slice(-4)} (${token.length} chars)` };
}

interface ProbeResult {
  reachable: boolean;
  status?: number;
  latencyMs?: number;
  rateLimit?: { limit?: string; remaining?: string; reset?: string };
  error?: string;
}

async function probeHealth(apiUrl: string, fetchImpl: typeof fetch, token: string): Promise<ProbeResult> {
  const t0 = Date.now();
  try {
    const res = await fetchImpl(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: "probe", method: "initialize", params: { protocolVersion: PROTOCOL_VERSION } }),
    });
    const latencyMs = Date.now() - t0;
    await res.text();
    return {
      reachable: true,
      status: res.status,
      latencyMs,
      rateLimit: {
        limit: res.headers.get("x-ratelimit-limit") ?? undefined,
        remaining: res.headers.get("x-ratelimit-remaining") ?? undefined,
        reset: res.headers.get("x-ratelimit-reset") ?? undefined,
      },
    };
  } catch (e) {
    return { reachable: false, error: (e as Error).message };
  }
}

export async function runDoctor(config: GraniqMCPConfig): Promise<DoctorReport> {
  const checks: CheckResult[] = [];
  checks.push(checkNode());
  checks.push(checkToken(config.token));

  const client = new GraniqMCPClient(config);
  const fetchImpl = config.fetch ?? globalThis.fetch;
  const apiUrl = client.getApiUrl();

  // Health probe (low-level fetch — measures latency + headers).
  const probe = await probeHealth(apiUrl, fetchImpl, config.token);
  if (!probe.reachable) {
    checks.push({ name: "health_probe", status: "fail", message: probe.error ?? "unreachable" });
    return { apiUrl, checks, ok: false };
  }
  checks.push({ name: "health_probe", status: "ok", message: `HTTP ${probe.status} in ${probe.latencyMs}ms` });
  checks.push({
    name: "latency",
    status: (probe.latencyMs ?? 0) < 1500 ? "ok" : "warn",
    message: `${probe.latencyMs}ms`,
  });
  if (probe.rateLimit?.remaining !== undefined) {
    const remaining = Number(probe.rateLimit.remaining);
    checks.push({
      name: "rate_limit",
      status: Number.isFinite(remaining) && remaining < 5 ? "warn" : "ok",
      message: `remaining=${probe.rateLimit.remaining ?? "?"}/${probe.rateLimit.limit ?? "?"}`,
    });
  }

  // JSON-RPC initialize via client (validates envelope + auth).
  try {
    const info = await client.connect();
    checks.push({ name: "jsonrpc_initialize", status: "ok", message: `${info.name} v${info.version}` });
    checks.push({
      name: "protocol_version",
      status: info.protocolVersion === PROTOCOL_VERSION ? "ok" : "warn",
      message: `server=${info.protocolVersion} client=${PROTOCOL_VERSION}`,
    });
    checks.push({
      name: "package_version",
      status: "ok",
      message: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
    });
  } catch (e) {
    const err = e as GraniqMCPError;
    checks.push({ name: "jsonrpc_initialize", status: "fail", message: err.message, detail: { code: err.code } });
    return { apiUrl, checks, ok: false };
  }

  // Capabilities / tools.
  let tools: ToolDescriptor[] = [];
  try {
    tools = await client.listTools();
    checks.push({
      name: "capabilities",
      status: tools.length > 0 ? "ok" : "warn",
      message: `${tools.length} tools exposed`,
      detail: tools.map((t) => t.name),
    });
  } catch (e) {
    const err = e as GraniqMCPError;
    checks.push({ name: "capabilities", status: "fail", message: err.message });
  }

  // Workspace / DB inference — if a `get_workspace` or `get_balance` tool exists, try it.
  const probeTool = tools.find((t) => t.name === "get_workspace") ?? tools.find((t) => t.name === "get_balance");
  if (probeTool) {
    try {
      await client.callTool(probeTool.name, {});
      checks.push({ name: "workspace_db", status: "ok", message: `tool ${probeTool.name} responded` });
    } catch (e) {
      const err = e as GraniqMCPError;
      checks.push({ name: "workspace_db", status: "warn", message: `${probeTool.name}: ${err.message}` });
    }
  } else {
    checks.push({ name: "workspace_db", status: "warn", message: "no probe tool (get_workspace/get_balance) exposed" });
  }

  const ok = checks.every((c) => c.status !== "fail");
  return { apiUrl, checks, ok };
}

// ─────────────────────────────────────────────────────────────────
// diagnose — full JSON support bundle.
// ─────────────────────────────────────────────────────────────────
export interface DiagnoseReport {
  generatedAt: string;
  package: { name: string; version: string; protocolVersion: string };
  runtime: { node?: string; platform?: string; arch?: string };
  apiUrl: string;
  doctor: DoctorReport;
  tools: ToolDescriptor[];
  rateLimit?: ProbeResult["rateLimit"];
  latencyMs?: number;
  errors: Array<{ stage: string; code?: number; message: string }>;
}

export async function runDiagnose(config: GraniqMCPConfig): Promise<DiagnoseReport> {
  const errors: DiagnoseReport["errors"] = [];
  const fetchImpl = config.fetch ?? globalThis.fetch;
  const client = new GraniqMCPClient(config);
  const apiUrl = client.getApiUrl();

  const probe = await probeHealth(apiUrl, fetchImpl, config.token);
  if (!probe.reachable) errors.push({ stage: "health_probe", message: probe.error ?? "unreachable" });

  let tools: ToolDescriptor[] = [];
  try {
    await client.connect();
    tools = await client.listTools();
  } catch (e) {
    const err = e as GraniqMCPError;
    errors.push({ stage: "client", code: err.code, message: err.message });
  }

  const doctor = await runDoctor(config).catch((e: Error) => {
    errors.push({ stage: "doctor", message: e.message });
    return { apiUrl, checks: [], ok: false } satisfies DoctorReport;
  });

  return {
    generatedAt: new Date().toISOString(),
    package: { name: PACKAGE_NAME, version: PACKAGE_VERSION, protocolVersion: PROTOCOL_VERSION },
    runtime: {
      node: typeof process !== "undefined" ? process.versions?.node : undefined,
      platform: typeof process !== "undefined" ? process.platform : undefined,
      arch: typeof process !== "undefined" ? process.arch : undefined,
    },
    apiUrl,
    doctor,
    tools,
    rateLimit: probe.rateLimit,
    latencyMs: probe.latencyMs,
    errors,
  };
}
