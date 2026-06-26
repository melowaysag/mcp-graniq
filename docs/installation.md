# Installation

## Requirements

- Node.js **>= 18.17** (`node -v`)
- A Graniq account and an MCP token (Settings → **Conectar IA** → Generate token)

## Global install (recommended for daily use)

```bash
npm i -g @graniq/mcp
graniq-mcp --version
```

## One-off via npx (recommended in client configs)

```bash
npx -y @graniq/mcp@latest doctor
```

Using `npx` keeps the client config self-updating — every launch pulls the
latest patch release.

## Pin a version

```bash
npx -y @graniq/mcp@0.1.0 doctor
```

## Set credentials

```bash
export GRANIQ_TOKEN=gmcp_xxx                  # bash/zsh
setx GRANIQ_TOKEN gmcp_xxx                    # Windows PowerShell
```

Or pass per command: `graniq-mcp doctor --token=gmcp_xxx`.

## Uninstall

```bash
npm uninstall -g @graniq/mcp
```
