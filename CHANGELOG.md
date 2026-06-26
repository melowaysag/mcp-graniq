# Changelog — @graniq/mcp

## 0.1.0-rc.1 (2026-06-26) — Release Candidate

Primeira versão candidata. Sem publish no npm — validação E2E + tarball local antes do GA.

### Adicionado
- Comando `graniq-mcp diagnose [--out=path.json]` — bundle JSON com runtime, servidor, latência, rate-limit, capabilities, tools e erros — pronto para anexar em suporte.
- `runDiagnose()` exportado pela API pública.
- `doctor` expandido: Node runtime, token, health probe, latency, rate-limit headers, JSON-RPC initialize, protocol version, package version, capabilities, workspace/DB probe.
- Stdio bridge: logging estruturado em stderr quando `GRANIQ_DEBUG=1` (`rpc.in`, `rpc.out`, `rpc.notify`) — habilita observabilidade ponta a ponta.

### Como instalar este RC localmente
```bash
cd packages/mcp
npm pack                # gera graniq-mcp-0.1.0-rc.1.tgz
npm i -g ./graniq-mcp-0.1.0-rc.1.tgz
```

## 0.1.0 (não publicado) — Sprint 3


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
