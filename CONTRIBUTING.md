# Contributing to @graniq/mcp

Thanks for considering a contribution! This document describes the workflow.

## Development

```bash
git clone https://github.com/graniq/mcp.git graniq-mcp
cd graniq-mcp
pnpm install        # or npm install
pnpm test
pnpm build
```

Node `>=18.17` is required.

## Branching

- `main` — always releasable.
- Feature branches: `feat/<short-name>`.
- Fix branches: `fix/<short-name>`.

## Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(cli): add diagnose --out flag
fix(stdio): forward notifications when id is null
docs(readme): clarify Claude Desktop steps
chore(deps): bump tsup to 8.1
```

## Pull Requests

1. Fork the repo and create a topic branch.
2. Add/adjust tests — every PR runs `pnpm typecheck && pnpm test && pnpm build` in CI.
3. Update `CHANGELOG.md` under `## [Unreleased]`.
4. Open the PR against `main` describing **what** and **why**.
5. A maintainer reviews and merges with squash.

## Issues

Use the GitHub issue templates. Always include:

- `graniq-mcp --version`
- Node version (`node -v`)
- OS
- Output of `graniq-mcp diagnose --out=bundle.json` when reporting runtime bugs

## Code of Conduct

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md).
