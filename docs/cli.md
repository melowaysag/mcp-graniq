# CLI Reference

All commands accept:

- `--token=<gmcp_...>` or env `GRANIQ_TOKEN`
- `--api-url=<url>` or env `GRANIQ_API_URL` (default: Graniq production)

## `graniq-mcp stdio`

Run the stdio ↔ HTTP JSON-RPC bridge. MCP clients spawn this; you rarely run
it by hand.

```bash
GRANIQ_DEBUG=1 graniq-mcp stdio   # verbose stderr logs
```

## `graniq-mcp doctor`

End-to-end health check: Node version, token format, server reachability,
latency, rate-limit headers, `initialize` handshake, protocol version, package
version, capabilities, workspace probe.

## `graniq-mcp diagnose [--out=bundle.json]`

Produce a JSON support bundle. Token values are stripped before write. Attach
the bundle to a support email or GitHub issue.

## `graniq-mcp list-tools`

Print every tool the token can call, with parameter schemas.

## `graniq-mcp config <target>`

Emit a copy-paste-ready config for a client.

```bash
graniq-mcp config claude-desktop
graniq-mcp config cursor
graniq-mcp config windsurf
graniq-mcp config vscode
```

## `graniq-mcp test <tool> [json-args]`

Invoke a tool directly and print the JSON-RPC result.

```bash
graniq-mcp test get_balance
graniq-mcp test list_transactions '{"limit":5}'
```

## `graniq-mcp version`

Print the installed `@graniq/mcp` version.
