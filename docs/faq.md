# FAQ

### Does Graniq see my prompts?

No. The bridge forwards only the tool calls the assistant chooses to make,
plus their JSON arguments. Conversation text never leaves the MCP client.

### What data is transmitted?

Tool requests and responses over HTTPS to `api.graniq.com.br` (or your
`--api-url`). Nothing else.

### Which Node versions are supported?

`>= 18.17`. CI runs on 18.17, 20, and 22.

### Can I use this without installing globally?

Yes — `npx -y @graniq/mcp@latest stdio` works everywhere. Most client configs
use this form so updates are automatic.

### Why JSON-RPC over HTTPS instead of stdio all the way down?

So multiple MCP clients can share one Graniq workspace concurrently and so the
server can enforce rate limits, payload caps, and observability centrally.

### How do I rotate a token?

Settings → **Conectar IA** → **Revoke**, then **Generate token**.

### Can I self-host the server?

Not yet. This SDK targets the hosted Graniq MCP endpoint.

### How do I report a bug?

Run `graniq-mcp diagnose --out=bundle.json`, then open a GitHub issue with the
bundle attached.

### How do I report a vulnerability?

Email **security@graniq.com.br**. See [SECURITY.md](../SECURITY.md).
