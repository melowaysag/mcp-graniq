# Doctor

`graniq-mcp doctor` is the first thing to run when anything looks off.

## What it checks

1. **Node runtime** — version meets `>= 18.17`.
2. **Token** — format (`gmcp_...`) and presence.
3. **Reachability** — HTTP health probe with latency.
4. **Rate limit** — current bucket via response headers.
5. **JSON-RPC `initialize`** — handshake completes; protocol version matches.
6. **Package version** — local vs latest on npm.
7. **Capabilities** — server-reported feature set.
8. **Workspace probe** — a no-op tool call confirms data scope.

## Example output

```
graniq-mcp 0.1.0
✓ Node 20.11.0 OK
✓ Token format OK (gmcp_••••5f2a)
✓ Server reachable in 142ms — https://api.graniq.com.br
✓ Rate limit: 87/100 remaining (resets in 41s)
✓ initialize OK — protocol 2025-06-18
✓ 14 tools available
✓ Workspace OK
All checks passed.
```

## Common failures

- `✗ Token missing` — set `GRANIQ_TOKEN` or pass `--token=...`.
- `✗ 401 Unauthorized` — token revoked or wrong workspace.
- `✗ Server unreachable` — corporate proxy or DNS issue; try `--api-url`.
- `✗ Protocol mismatch` — `npm i -g @graniq/mcp@latest`.
