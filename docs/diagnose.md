# Diagnose

`graniq-mcp diagnose` produces a JSON support bundle. Designed for support
tickets and GitHub issues.

## Usage

```bash
graniq-mcp diagnose                     # print to stdout
graniq-mcp diagnose --out=bundle.json   # write to file
```

## What's inside

```json
{
  "package": { "name": "@graniq/mcp", "version": "0.1.0" },
  "runtime": { "node": "20.11.0", "platform": "darwin", "arch": "arm64" },
  "server": { "url": "https://api.graniq.com.br", "latencyMs": 142, "reachable": true },
  "rateLimit": { "limit": 100, "remaining": 87, "resetSeconds": 41 },
  "handshake": { "protocolVersion": "2025-06-18", "capabilities": { "tools": {} } },
  "tools": [{ "name": "get_balance", "description": "..." }],
  "errors": []
}
```

## Privacy

- Token values are **stripped** before write — only a masked prefix/suffix appears.
- No prompts, tool arguments, or response bodies are captured.
- Only metadata about the environment and the handshake is included.

## When to use

- Before opening any GitHub issue tagged `bug`.
- When emailing **support@graniq.com.br**.
- When debugging a flaky MCP client integration.
