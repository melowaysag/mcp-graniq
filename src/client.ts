// ════════════════════════════════════════════════════════════════
// GraniqMCPClient — official Client API.
// Abstracts JSON-RPC completely: consumers call .connect/.listTools/.callTool.
// ════════════════════════════════════════════════════════════════
import {
  DEFAULT_API_URL,
  PROTOCOL_VERSION,
  PACKAGE_NAME,
  PACKAGE_VERSION,
  type GraniqMCPConfig,
  type ToolDescriptor,
  type ServerInfo,
  type CallToolResult,
} from "./types.js";
import {
  type JsonRpcResponse,
  type JsonRpcRequest,
  isError,
  nextId,
} from "./jsonrpc.js";

export class GraniqMCPError extends Error {
  constructor(public code: number, message: string, public data?: unknown) {
    super(message);
    this.name = "GraniqMCPError";
  }
}

export class GraniqMCPClient {
  private readonly apiUrl: string;
  private readonly token: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;
  private serverInfo: ServerInfo | null = null;
  private toolsCache: ToolDescriptor[] | null = null;

  constructor(config: GraniqMCPConfig) {
    if (!config.token || typeof config.token !== "string") {
      throw new GraniqMCPError(-32602, "token is required");
    }
    if (!config.token.startsWith("gmcp_")) {
      throw new GraniqMCPError(-32602, "token must start with gmcp_");
    }
    this.token = config.token;
    this.apiUrl = config.apiUrl ?? DEFAULT_API_URL;
    this.timeoutMs = config.timeoutMs ?? 20_000;
    this.fetchImpl = config.fetch ?? globalThis.fetch;
    if (!this.fetchImpl) {
      throw new GraniqMCPError(-32603, "fetch is not available in this runtime");
    }
  }

  /** Executes JSON-RPC `initialize` and caches server info. */
  async connect(): Promise<ServerInfo> {
    const result = await this.rpc<ServerInfo>("initialize", {
      protocolVersion: PROTOCOL_VERSION,
      clientInfo: { name: PACKAGE_NAME, version: PACKAGE_VERSION },
    });
    this.serverInfo = result;
    return result;
  }

  /** Lists tools available for the token. Cached after first call unless `refresh`. */
  async listTools(opts: { refresh?: boolean } = {}): Promise<ToolDescriptor[]> {
    if (this.toolsCache && !opts.refresh) return this.toolsCache;
    const result = await this.rpc<{ tools: ToolDescriptor[] }>("tools/list", {});
    this.toolsCache = result.tools ?? [];
    return this.toolsCache;
  }

  /** Invokes a tool by name. Arguments are forwarded as `params.arguments`. */
  async callTool(name: string, args: Record<string, unknown> = {}): Promise<CallToolResult> {
    return this.rpc<CallToolResult>("tools/call", { name, arguments: args });
  }

  /** Raw JSON-RPC dispatch — escape hatch; prefer the typed helpers above. */
  async rpc<T = unknown>(method: string, params: unknown): Promise<T> {
    const body: JsonRpcRequest = { jsonrpc: "2.0", id: nextId(), method, params };
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), this.timeoutMs);
    let res: Response;
    try {
      res = await this.fetchImpl(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${this.token}`,
          "User-Agent": `${PACKAGE_NAME}/${PACKAGE_VERSION}`,
        },
        body: JSON.stringify(body),
        signal: ctl.signal,
      });
    } catch (e) {
      clearTimeout(timer);
      const msg = (e as Error).name === "AbortError" ? "request timed out" : (e as Error).message;
      throw new GraniqMCPError(-32000, msg);
    } finally {
      clearTimeout(timer);
    }
    if (res.status === 401) throw new GraniqMCPError(-32001, "Unauthorized — verify your token");
    if (res.status === 429) throw new GraniqMCPError(-32029, "Rate limit exceeded");
    if (res.status === 413) throw new GraniqMCPError(-32600, "Payload too large");
    if (res.status >= 500) throw new GraniqMCPError(-32603, `Server error (HTTP ${res.status})`);

    const json = (await res.json()) as JsonRpcResponse<T>;
    if (isError(json)) throw new GraniqMCPError(json.error.code, json.error.message, json.error.data);
    return json.result;
  }

  getServerInfo(): ServerInfo | null { return this.serverInfo; }
  getApiUrl(): string { return this.apiUrl; }
}

/** Factory mirroring the public spec: `const client = createGraniqMCP({ token })`. */
export function createGraniqMCP(config: GraniqMCPConfig): GraniqMCPClient {
  return new GraniqMCPClient(config);
}
