# Release Process — @graniq/mcp

End-to-end checklist for cutting a release. Nothing is automated outside of
CI; the maintainer runs the commands below locally and pushes a tag, which
triggers the publish workflow.

## 0. Prerequisites

- Push access to `github.com/graniq/mcp`.
- `NPM_TOKEN` (publish scope `@graniq`) configured as a GitHub Actions secret.
- Logged into npm locally for the smoke test: `npm whoami`.
- Clean working tree (`git status` shows no changes).

## 1. Update CHANGELOG

Move entries from `## [Unreleased]` into a new dated section following
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/):

```md
## [0.1.0] - 2026-07-01
### Added
- ...
### Fixed
- ...
```

## 2. Bump version

```bash
npm version patch   # or minor / major / prerelease --preid=rc
```

This rewrites `package.json` and creates a git tag like `v0.1.0`.

## 3. Local validation

```bash
npm run typecheck
npm run test
npm run build
npm pack --dry-run     # confirm only dist/, README, CHANGELOG, LICENSE, package.json
npm pack               # produce graniq-mcp-<version>.tgz
```

### Smoke test the tarball

```bash
npm i -g ./graniq-mcp-*.tgz
graniq-mcp --version
GRANIQ_TOKEN=gmcp_xxx graniq-mcp doctor
GRANIQ_TOKEN=gmcp_xxx graniq-mcp diagnose --out=/tmp/bundle.json
```

If anything fails, fix it, amend the commit, and restart from step 2.

## 4. Push

```bash
git push origin main --follow-tags
```

## 5. Automated publish

The `release.yml` workflow fires on tag `v*`:

1. Checks out the tag
2. `npm ci`
3. `npm run typecheck && npm run test && npm run build`
4. `npm publish --provenance --access public`
5. Creates a GitHub Release using the matching CHANGELOG section

## 6. Verify

```bash
npm view @graniq/mcp version
npx -y @graniq/mcp@latest --version
```

Open the GitHub Release page and double-check the notes.

## 7. Rollback

If a release is broken:

```bash
npm deprecate @graniq/mcp@<version> "Use <other-version>"
```

Never `npm unpublish` a version older than 72 hours — deprecation is the
correct path for the ecosystem.

## Versioning policy

Strict [SemVer](https://semver.org/):

- `MAJOR` — breaking API change (client method signatures, CLI flags removed)
- `MINOR` — new tool support, new CLI command, new config generator
- `PATCH` — bug fix, doc-only, internal refactor

Pre-releases use `-rc.N` (`0.2.0-rc.1`) and publish to npm under the `next`
dist-tag — never `latest`.
