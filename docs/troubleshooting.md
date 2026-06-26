# Troubleshooting

Run this first:

```bash
graniq-mcp doctor
```

## `401 Unauthorized`

Token is missing, malformed, or revoked.

```bash
echo $GRANIQ_TOKEN          # confirm it's set
graniq-mcp doctor           # re-validate
```

Regenerate at Settings → **Conectar IA**.

## `429 Too Many Requests`

You hit the rate limit. The server returns `Retry-After` in seconds.

- Reduce polling in your client.
- Wait the indicated cooldown.

## `ETIMEDOUT` / `ECONNRESET` / `ENOTFOUND`

Network, DNS, or proxy issue.

- Check the firewall allows outbound HTTPS to `api.graniq.com.br`.
- Behind a corporate proxy: set `HTTPS_PROXY=...`.
- Try a different network to isolate.

## Claude Desktop doesn't list the Graniq tools

1. Fully quit Claude (not just close the window).
2. Reopen and check **Settings → Developer → MCP** for `graniq`.
3. Inspect the log file referenced there.
4. Confirm your config file has valid JSON (`jq . < ~/Library/Application\ Support/Claude/claude_desktop_config.json`).

## Cursor / VS Code / Windsurf doesn't connect

- Confirm the binary path: `which graniq-mcp` or use the `npx` form.
- Run `graniq-mcp stdio` manually — it should wait silently for input.
- Set `GRANIQ_DEBUG=1` in the client env to see `rpc.in`/`rpc.out` logs.

## Protocol version mismatch

```bash
npm i -g @graniq/mcp@latest
```

If the client itself is outdated, update it too.

## Still stuck

```bash
graniq-mcp diagnose --out=bundle.json
```

Open a GitHub issue with `bundle.json` attached, or email
**support@graniq.com.br**.
