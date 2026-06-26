# @graniq/mcp

[![npm version](https://img.shields.io/npm/v/@graniq/mcp.svg?style=flat-square)](https://www.npmjs.com/package/@graniq/mcp)
[![npm downloads](https://img.shields.io/npm/dm/@graniq/mcp.svg?style=flat-square)](https://www.npmjs.com/package/@graniq/mcp)
[![license](https://img.shields.io/npm/l/@graniq/mcp.svg?style=flat-square)](./LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/graniq/mcp/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/graniq/mcp/actions/workflows/ci.yml)
[![node](https://img.shields.io/node/v/@graniq/mcp.svg?style=flat-square)](https://nodejs.org)

> Official **Graniq** client for any **MCP** (Model Context Protocol) compatible environment.
> Connect Claude Desktop, Cursor, Windsurf, VS Code, ChatGPT and any stdio MCP host
> to your Graniq financial data in a single command.

```bash
npx -y @graniq/mcp@latest doctor
```

---

## Table of contents

- [What is it](#what-is-it)
- [How it works](#how-it-works)
- [Installation](#installation)
- [CLI](#cli)
- [Clients](#clients)
  - [Claude Desktop](#claude-desktop)
  - [Cursor](#cursor)
  - [VS Code](#vs-code)
  - [Windsurf](#windsurf)
  - [ChatGPT](#chatgpt)
- [Programmatic use](#programmatic-use)
- [Doctor & Diagnose](#doctor--diagnose)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## What is it

`@graniq/mcp` is the official SDK and CLI to expose your **Graniq** financial
workspace (transactions, balances, budgets, goals, investments, Open Finance
data) to any AI assistant that speaks MCP.

It ships:

- **Client API** — `createGraniqMCP({ token })` with `.connect()`, `.listTools()`, `.callTool()`.
- **stdio bridge** — `graniq-mcp stdio` for Claude Desktop, Cursor, Windsurf, VS Code.
- **CLI** — `doctor`, `diagnose`, `list-tools`, `config <target>`, `test <tool>`.
- **Config generators** — copy-paste JSON for each supported client. No manual editing.
- **Diagnostics** — token check, reachability, latency, rate-limit, capabilities, protocol.

No external runtime dependencies. **Node 18.17+**.

## How it works

```text
MCP client  ⇄  graniq-mcp stdio (bridge)  ⇄  Graniq MCP server (HTTPS JSON-RPC)
                                                       │
                                                       ▼
                                            Graniq platform + database
```

All MCP business logic lives on the server. This package only transports
JSON-RPC and abstracts client-specific config formats.

## Installation

```bash
# CLI globally
npm i -g @graniq/mcp

# or one-off via npx (recommended in client configs)
npx -y @graniq/mcp@latest doctor
```

Get your token at <https://graniq.com.br/settings> → **Conectar IA** → **Generate token**.

```bash
export GRANIQ_TOKEN=gmcp_xxx
```

## CLI

| Command | Description |
| --- | --- |
| `graniq-mcp stdio` | Bridge stdio ↔ Graniq MCP server (used by MCP clients) |
| `graniq-mcp doctor` | Verify token, server, capabilities, latency, protocol |
| `graniq-mcp diagnose [--out=bundle.json]` | Produce a JSON support bundle |
| `graniq-mcp list-tools` | List tools available for your token |
| `graniq-mcp config <target>` | Generate config snippet for a client |
| `graniq-mcp test <tool> [json-args]` | Invoke a tool and print the result |
| `graniq-mcp version` | Print package version |

Token via `--token=gmcp_...` or `GRANIQ_TOKEN`.
Endpoint via `--api-url=...` or `GRANIQ_API_URL` (default: Graniq production).

## Clients

### Claude Desktop

```bash
graniq-mcp config claude-desktop --token=$GRANIQ_TOKEN
```

Paste the output into:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%/Claude/claude_desktop_config.json`

Restart Claude. See [`examples/claude-desktop/`](./examples/claude-desktop/).

### Cursor

```bash
graniq-mcp config cursor --token=$GRANIQ_TOKEN
```

See [`examples/cursor/`](./examples/cursor/).

### VS Code

```bash
graniq-mcp config vscode --token=$GRANIQ_TOKEN
```

See [`examples/vscode/`](./examples/vscode/).

### Windsurf

```bash
graniq-mcp config windsurf --token=$GRANIQ_TOKEN
```

See [`examples/windsurf/`](./examples/windsurf/).

### ChatGPT

Use any MCP-compatible ChatGPT bridge with:

```bash
npx -y @graniq/mcp@latest stdio
```

See [`examples/chatgpt/`](./examples/chatgpt/).

## Programmatic use

```ts
import { createGraniqMCP } from "@graniq/mcp";

const client = createGraniqMCP({ token: process.env.GRANIQ_TOKEN! });
await client.connect();

const tools = await client.listTools();
const res = await client.callTool("get_balance", {});
console.log(res.content[0]?.text);
```

## Doctor & Diagnose

```bash
graniq-mcp doctor
# ✓ Node 20.11.0 OK
# ✓ Token format OK
# ✓ Server reachable (142ms)
# ✓ initialize OK (protocol 2025-06-18)
# ✓ 14 tools available

graniq-mcp diagnose --out=bundle.json
# Bundle written. Attach this file when contacting support@graniq.com.br
```

`diagnose` strips token values before writing the bundle.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `401 Unauthorized` | Invalid or revoked token | Re-generate at Settings → Conectar IA |
| `429 Too Many Requests` | Rate limit hit | Wait `Retry-After` seconds; reduce polling |
| `ETIMEDOUT` / `ECONNRESET` | Network/proxy | Check firewall; try `--api-url` |
| Client shows no tools | Bridge not running | Run `graniq-mcp doctor` |
| Claude doesn't see the server | Config not reloaded | Fully quit and reopen Claude |

For anything else, run `graniq-mcp diagnose --out=bundle.json` and open an issue.

## FAQ

**Does Graniq see my prompts?**
No. The bridge only forwards tool calls the assistant decides to make.

**Does my data leave my machine?**
Only tool requests and responses, over HTTPS, to the Graniq API.

**Can I self-host the server?**
Not yet. This SDK targets the hosted Graniq MCP endpoint.

**Which protocol version?**
MCP `2025-06-18`. See [`docs/mcp.md`](./docs/mcp.md).

## Security

Report vulnerabilities to **security@graniq.com.br**. See [SECURITY.md](./SECURITY.md).

## Contributing

We welcome PRs! See [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## License

[MIT](./LICENSE) © Graniq
