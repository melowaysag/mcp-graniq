# MCP Protocol

`@graniq/mcp` implements [Model Context Protocol](https://modelcontextprotocol.io)
client-side, over JSON-RPC 2.0.

## Protocol version

The bridge negotiates protocol **`2025-06-18`**. Mismatch → `doctor` fails and
recommends upgrading the client or this SDK.

## Transport

- **Client → bridge:** stdio (one JSON-RPC message per line).
- **Bridge → server:** HTTPS POST, `application/json`, batched when possible.

## Supported methods

| Method | Direction | Notes |
| --- | --- | --- |
| `initialize` | client → server | handshake, capabilities exchange |
| `notifications/initialized` | client → server | post-handshake notification |
| `tools/list` | client → server | enumerate tools the token can call |
| `tools/call` | client → server | invoke a tool with arguments |
| `ping` | both | liveness |

Notifications (no `id`) are forwarded without expecting a response.

## Errors

Server errors map to canonical JSON-RPC codes:

| HTTP | JSON-RPC code | Meaning |
| --- | --- | --- |
| 400 | -32600 | Invalid Request |
| 401 | -32001 | Unauthorized |
| 404 | -32601 | Method not found |
| 413 | -32002 | Payload too large |
| 429 | -32003 | Rate limit |
| 5xx | -32603 | Internal error |

All errors are wrapped as `GraniqMCPError` in the programmatic client.

## Compatibility

See [`docs/MCP_COMPATIBILITY_MATRIX.md`](../../docs/MCP_COMPATIBILITY_MATRIX.md)
in the platform repo for the current client matrix.
