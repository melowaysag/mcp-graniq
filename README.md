# @graniq/mcp

> Cliente oficial da plataforma **Graniq** para qualquer ambiente compatível com **MCP** (Model Context Protocol).

Inclui:
- **Client API** — `createGraniqMCP({ token })` com `.connect()`, `.listTools()`, `.callTool()`.
- **stdio bridge** — `graniq-mcp stdio` para Claude Desktop, Cursor, Windsurf, VS Code.
- **CLI** — `doctor`, `list-tools`, `config <target>`, `test <tool>`.
- **Config generators** — gera o JSON pronto para cada cliente; sem JSON manual.
- **Diagnóstico** — verifica token, servidor, capabilities, versão de protocolo.

Sem dependências externas. Node 18.17+.

## Instalação

```bash
npm i -g @graniq/mcp        # CLI global
# ou use via npx:
npx -y @graniq/mcp@latest doctor
```

## Quickstart — uso programático

```ts
import { createGraniqMCP } from "@graniq/mcp";

const client = createGraniqMCP({ token: process.env.GRANIQ_TOKEN! });
await client.connect();
const tools = await client.listTools();
const res = await client.callTool("get_balance", {});
console.log(res.content[0]?.text);
```

## Quickstart — Claude Desktop

```bash
graniq-mcp config claude-desktop --token=gmcp_...
```

Cole o snippet em `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) ou `%APPDATA%/Claude/claude_desktop_config.json` (Windows) e reinicie o Claude.

## Comandos da CLI

| Comando                              | Descrição                                                   |
| ------------------------------------ | ----------------------------------------------------------- |
| `graniq-mcp stdio`                   | Bridge stdio ↔ Graniq MCP server (clientes MCP chamam isto) |
| `graniq-mcp doctor`                  | Verifica token, servidor, capabilities                      |
| `graniq-mcp list-tools`              | Lista tools disponíveis para o token                        |
| `graniq-mcp config <target>`         | Gera snippet de config (claude-desktop · cursor · windsurf · vscode) |
| `graniq-mcp test <tool> [json-args]` | Invoca um tool e imprime o resultado                        |
| `graniq-mcp version`                 | Versão do pacote                                            |

Token via `--token=gmcp_...` ou variável `GRANIQ_TOKEN`.
Endpoint via `--api-url=...` ou `GRANIQ_API_URL` (default: produção da Graniq).

## Compatibilidade

| Cliente          | Status      | Comando |
| ---------------- | ----------- | ------- |
| Claude Desktop   | ✅ suportado | `graniq-mcp config claude-desktop` |
| Cursor           | ✅ suportado | `graniq-mcp config cursor`         |
| Windsurf         | ✅ suportado | `graniq-mcp config windsurf`       |
| VS Code (MCP)    | ✅ suportado | `graniq-mcp config vscode`         |
| Outros (stdio)   | ✅ suportado | `npx -y @graniq/mcp@latest stdio`  |

## Arquitetura

```
MCP client  ⇄  graniq-mcp stdio (bridge)  ⇄  Graniq MCP server (HTTPS JSON-RPC)
                                                       │
                                                       ▼
                                          @graniq/foundation + infrastructure
                                                       │
                                                       ▼
                                                    Banco
```

Toda lógica MCP vive no servidor; este package só transporta JSON-RPC e abstrai detalhes.
