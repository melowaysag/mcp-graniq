# Changelog — @graniq/mcp

## 0.1.0 (2026-06-26) — Sprint 3

Primeiro release público. Cliente oficial da plataforma Graniq para MCP.

### Adicionado
- `GraniqMCPClient` + factory `createGraniqMCP({ token })` com `.connect()`, `.listTools()`, `.callTool()`, `.rpc()`.
- `runStdioBridge()` — bridge stdio ↔ HTTP JSON-RPC.
- Geradores de configuração para Claude Desktop, Cursor, Windsurf, VS Code.
- Diagnóstico `runDoctor()` — token / reachability / protocol / capabilities.
- CLI `graniq-mcp` com comandos `stdio`, `doctor`, `list-tools`, `config`, `test`, `version`.
- Mapeamento de erros HTTP (401/429/413/5xx) para `GraniqMCPError` com códigos JSON-RPC canônicos.
- Cobertura de testes: unit (client), integration (doctor), compatibility (config), smoke (stdio bridge).

### Arquitetura
- Zero dependências externas. Node ≥ 18.17.
- Reutiliza contratos JSON-RPC do servidor MCP (`supabase/functions/_shared/mcp-jsonrpc.ts`); sem lógica paralela.
