# Authentication

`@graniq/mcp` uses a bearer token issued by your Graniq workspace.

## Generate a token

1. Sign in at <https://graniq.com.br>.
2. Go to **Settings → Conectar IA**.
3. Click **Generate token**.
4. Copy it once — it's shown only at creation.

Tokens look like `gmcp_` followed by an opaque string.

## Provide the token

Two equivalent options:

```bash
export GRANIQ_TOKEN=gmcp_xxx
graniq-mcp doctor
```

```bash
graniq-mcp doctor --token=gmcp_xxx
```

In MCP client configs, pass it via `env`:

```json
{
  "command": "npx",
  "args": ["-y", "@graniq/mcp@latest", "stdio"],
  "env": { "GRANIQ_TOKEN": "gmcp_xxx" }
}
```

## Scopes

Tokens inherit the scopes you select at creation (read-only, transactions
write, full workspace, etc). See `list-tools` to confirm what a token can do.

## Rotate / revoke

Settings → **Conectar IA** → **Revoke**. Revoked tokens fail immediately with
`401`.

## Security notes

- Never commit tokens. Add to `.gitignore` or use a secret manager.
- `graniq-mcp diagnose` strips token values from the bundle.
- The bridge sends the token only over HTTPS to the configured `--api-url`.
