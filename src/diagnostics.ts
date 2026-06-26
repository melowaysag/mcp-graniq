// ════════════════════════════════════════════════════════════════
// Diagnostics — verify token, server, capabilities, compatibility.
// Returns a structured report; CLI renders it for humans.
// ════════════════════════════════════════════════════════════════
import { GraniqMCPClient, GraniqMCPError } from "./client.js";
import { PROTOCOL_VERSION, type GraniqMCPConfig } from "./types.js";

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

export async function runDoctor(config: GraniqMCPConfig): Promise<DoctorReport> {
  const client = new GraniqMCPClient(config);
  const checks: CheckResult[] = [];

  // 1. Token format (already validated by ctor reaching this point).
  checks.push({ name: "token_format", status: "ok", message: "token prefix gmcp_ valid" });

  // 2. Server reachability + initialize.
  try {
    const info = await client.connect();
    checks.push({ name: "server_reachable", status: "ok", message: `connected to ${info.name} v${info.version}` });
    checks.push({
      name: "protocol_version",
      status: info.protocolVersion === PROTOCOL_VERSION ? "ok" : "warn",
      message: `server=${info.protocolVersion} client=${PROTOCOL_VERSION}`,
    });
  } catch (e) {
    const err = e as GraniqMCPError;
    checks.push({ name: "server_reachable", status: "fail", message: err.message, detail: { code: err.code } });
    return { apiUrl: client.getApiUrl(), checks, ok: false };
  }

  // 3. Capabilities / tools.
  try {
    const tools = await client.listTools();
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

  const ok = checks.every((c) => c.status !== "fail");
  return { apiUrl: client.getApiUrl(), checks, ok };
}
