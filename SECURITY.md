# Security Policy

## Reporting a vulnerability

Please use [GitHub Security Advisories](https://github.com/andymai/labcat-tui/security/advisories) (private disclosure) rather than public issues.

## Scope

`@labcat/tui` and siblings make **zero network requests**. The library is client-side only and trusts slotted HTML inside `<tui-md>` — consumers are responsible for sanitizing markdown input. See `SPEC.md` §17 for the full security posture.

## Supply Chain

In response to the 2025–2026 wave of npm and GitHub Actions supply-chain attacks (Shai-Hulud worm, chalk/debug compromise, tj-actions tag retag, prt-scan AI campaign), the build is configured to fail closed on the patterns those attacks exploited:

| Defense | Where | What it blocks |
|---|---|---|
| `minimumReleaseAge: 10080` (7d cooldown) | `pnpm-workspace.yaml` | Fresh malicious uploads. Would have blocked axios, chalk/debug, durabletask. |
| `ignoreScripts: true` + `allowBuilds` allowlist | `pnpm-workspace.yaml` | Postinstall lifecycle scripts — Shai-Hulud's primary spread vector. |
| All GitHub Actions pinned to commit SHA | `.github/workflows/*.yml` | Tag-retag attacks (tj-actions class). |
| OSV scan against `pnpm-lock.yaml` (PRs report-only, main blocking) | `.github/workflows/osv-scan.yml` | Known-CVE versions in the lockfile. |
| Dependabot cooldown (7d default / 14d major) for npm + github-actions | `.github/dependabot.yml` | Fresh malicious version proposals. |
