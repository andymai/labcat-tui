# Security Policy

## Reporting a vulnerability

Please use [GitHub Security Advisories](https://github.com/andymai/labcat-tui/security/advisories) (private disclosure) rather than public issues.

## Scope

`@labcat/tui` and siblings make **zero network requests**. The library is client-side only and trusts slotted HTML inside `<tui-md>` — consumers are responsible for sanitizing markdown input. See `SPEC.md` §17 for the full security posture.
