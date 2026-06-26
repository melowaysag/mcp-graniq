# ChatGPT (MCP bridge)

ChatGPT supports MCP via desktop apps and third-party bridges that speak stdio.
Point any of them at the Graniq SDK:

```bash
npx -y @graniq/mcp@latest stdio
```

With env:

```bash
GRANIQ_TOKEN=gmcp_xxx npx -y @graniq/mcp@latest stdio
```

## Example prompts

- "What was my biggest expense last month?"
- "Summarize my investment allocation."
- "List the last 10 PIX transactions."

## Verify

```bash
graniq-mcp doctor
```

See [`../../docs/troubleshooting.md`](../../docs/troubleshooting.md) if tools
don't appear.
