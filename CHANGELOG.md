# Changelog

All notable changes to `@graniq/mcp` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0-rc.1] - 2026-06-26

### Added
- `graniq-mcp diagnose [--out=path.json]` — JSON support bundle (runtime, server, latency,
  rate-limit, capabilities, tools, errors) for sharing with support.
- `runDiagnose()` exposed from the public API.
- Expanded `doctor` checks: Node runtime, token, health probe, latency, rate-limit headers,
  JSON-RPC `initialize`, protocol version, package version, capabilities, workspace probe.
- Structured stderr logging in the stdio bridge when `GRANIQ_DEBUG=1`
  (`rpc.in`, `rpc.out`, `rpc.notify`).

### Notes
- Release candidate — not published to npm yet. Install locally via:
  ```bash
  cd packages/mcp && npm pack && npm i -g ./graniq-mcp-0.1.0-rc.1.tgz
  ```

## [0.1.0] - Unreleased (Sprint 3 baseline)

### Added
- `GraniqMCPClient` + factory `createGraniqMCP({ token })` with
  `.connect()`, `.listTools()`, `.callTool()`, `.rpc()`.
- `runStdioBridge()` — stdio ↔ HTTP JSON-RPC bridge for MCP clients.
- Config generators for Claude Desktop, Cursor, Windsurf, VS Code.
- `runDoctor()` diagnostics — token / reachability / protocol / capabilities.
- CLI `graniq-mcp` with `stdio`, `doctor`, `list-tools`, `config`, `test`, `version`.
- HTTP error mapping (401/429/413/5xx) to `GraniqMCPError` with canonical JSON-RPC codes.
- Test coverage: unit (client), integration (doctor), compatibility (config),
  smoke (stdio bridge).

### Architecture
- Zero external runtime dependencies. Node `>= 18.17`.
- Reuses JSON-RPC contracts from the Graniq MCP server
  (`supabase/functions/_shared/mcp-jsonrpc.ts`) — no parallel implementation.

[Unreleased]: https://github.com/graniq/mcp/compare/v0.1.0-rc.1...HEAD
[0.1.0-rc.1]: https://github.com/graniq/mcp/releases/tag/v0.1.0-rc.1
