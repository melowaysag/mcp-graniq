# Security Policy

## Supported Versions

Only the latest minor of `@graniq/mcp` receives security fixes.

| Version    | Supported |
| ---------- | --------- |
| 0.1.x      | ✅        |
| < 0.1.0    | ❌        |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security reports.**

Email **security@graniq.com.br** with:

1. A description of the vulnerability and potential impact.
2. Steps to reproduce or a proof of concept.
3. Affected version (`graniq-mcp --version`).
4. Your contact for follow-up.

We acknowledge reports within **72 hours** and aim to ship a fix or mitigation
within **14 days** for high-severity issues. Coordinated disclosure: please
allow us to release a patch before publishing details.

## Scope

In scope: this package (`@graniq/mcp`), its CLI, and the stdio bridge.

Out of scope: the Graniq MCP server itself (report via the same channel; we
route it internally), third-party clients (Claude Desktop, Cursor, etc.).

## Hardening Notes

- Tokens are read from `--token` or `GRANIQ_TOKEN`. Never commit tokens.
- The bridge sends only the configured token over HTTPS to the configured
  endpoint. No telemetry leaves your machine.
- `graniq-mcp diagnose` strips token values from the generated bundle.
