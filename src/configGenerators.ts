// ════════════════════════════════════════════════════════════════
// Config generators — produce ready-to-paste config blocks
// for the major MCP clients so the user doesn't edit JSON by hand.
// All targets here use the stdio bridge (`graniq-mcp stdio`).
// ════════════════════════════════════════════════════════════════
import { DEFAULT_API_URL } from "./types.js";

export type ConfigTarget = "claude-desktop" | "cursor" | "windsurf" | "vscode";

export interface ConfigGenInput {
  /** PAT (`gmcp_...`). */
  token: string;
  /** Override the API URL (optional). */
  apiUrl?: string;
  /** Override the server name as seen by the MCP client. Default: "graniq". */
  serverName?: string;
}

export interface GeneratedConfig {
  target: ConfigTarget;
  /** Filesystem path where this config typically lives (informational). */
  configPath: string;
  /** Pretty-printed JSON snippet ready for the user to merge. */
  snippet: string;
  /** Notes shown to the user (where to paste, how to merge). */
  notes: string[];
}

function bridgeBlock(input: ConfigGenInput, name: string) {
  return {
    [name]: {
      command: "npx",
      args: ["-y", "@graniq/mcp@latest", "stdio"],
      env: {
        GRANIQ_TOKEN: input.token,
        GRANIQ_API_URL: input.apiUrl ?? DEFAULT_API_URL,
      },
    },
  };
}

export function generateConfig(target: ConfigTarget, input: ConfigGenInput): GeneratedConfig {
  if (!input.token?.startsWith("gmcp_")) {
    throw new Error("token must start with gmcp_");
  }
  const name = input.serverName ?? "graniq";
  const block = bridgeBlock(input, name);

  switch (target) {
    case "claude-desktop": {
      const wrapped = { mcpServers: block };
      return {
        target,
        configPath:
          "~/Library/Application Support/Claude/claude_desktop_config.json (macOS) · %APPDATA%/Claude/claude_desktop_config.json (Windows)",
        snippet: JSON.stringify(wrapped, null, 2),
        notes: [
          "Cole o conteúdo dentro do objeto raiz (faça merge com mcpServers existente).",
          "Reinicie o Claude Desktop após salvar.",
        ],
      };
    }
    case "cursor": {
      const wrapped = { mcpServers: block };
      return {
        target,
        configPath: "~/.cursor/mcp.json",
        snippet: JSON.stringify(wrapped, null, 2),
        notes: [
          "Crie o arquivo se não existir.",
          "Em Cursor → Settings → MCP, confirme que o servidor 'graniq' aparece como Ready.",
        ],
      };
    }
    case "windsurf": {
      const wrapped = { mcpServers: block };
      return {
        target,
        configPath: "~/.codeium/windsurf/mcp_config.json",
        snippet: JSON.stringify(wrapped, null, 2),
        notes: [
          "Reinicie o Windsurf após salvar.",
          "Os tools aparecem em Cascade → MCP.",
        ],
      };
    }
    case "vscode": {
      const wrapped = { servers: block };
      return {
        target,
        configPath: ".vscode/mcp.json (per-workspace) ou settings.json em mcp.servers",
        snippet: JSON.stringify(wrapped, null, 2),
        notes: [
          "Recomendado por workspace para não vazar o token entre projetos.",
          "A extensão oficial 'MCP' deve estar instalada.",
        ],
      };
    }
  }
}

export const ALL_TARGETS: ConfigTarget[] = ["claude-desktop", "cursor", "windsurf", "vscode"];
