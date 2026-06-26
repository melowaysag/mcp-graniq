// ════════════════════════════════════════════════════════════════
// @graniq/mcp — public types
// ════════════════════════════════════════════════════════════════

export const DEFAULT_API_URL = "https://izfwjyzpwewirrqeuzlu.functions.supabase.co/mcp-server";
export const PROTOCOL_VERSION = "2024-11-05";
export const PACKAGE_NAME = "@graniq/mcp";
export const PACKAGE_VERSION = "0.1.0-rc.1";

export interface GraniqMCPConfig {
  /** Personal Access Token gerado em Settings → Conectar IA (prefixo `gmcp_`). */
  token: string;
  /** Endpoint do servidor MCP. Default: produção da Graniq. */
  apiUrl?: string;
  /** Timeout por request, em ms. Default: 20_000. */
  timeoutMs?: number;
  /** Fetch customizado (testes). Default: globalThis.fetch. */
  fetch?: typeof fetch;
}

export interface ToolDescriptor {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ServerInfo {
  name: string;
  version: string;
  protocolVersion: string;
  capabilities?: Record<string, unknown>;
}

export interface CallToolResult {
  content: Array<{ type: string; text?: string; [k: string]: unknown }>;
  isError?: boolean;
}
