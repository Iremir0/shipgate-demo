# Cart calculator (claude-code-pipeline demo)

A tiny TypeScript library that prices a shopping cart. It exists to demo
[claude-code-pipeline](https://github.com/Iremir0/claude-code-pipeline).

## Commands
- `npm ci`, `npm run typecheck`, `npm test` (node:test via tsx). No services, no Docker.

## Invariants (reviewers treat a violation as Critical)
- Money is an **integer number of minor units** everywhere. No floats for money, no `toFixed` for money.
- Rounding of money is **half up to a whole minor unit**, done in exactly one place per calculation.
- Public functions validate their input and throw an `Error` with a human-readable message; they never return `NaN`.
- No runtime dependencies.

## Conventions
- Code, identifiers and commits in English. Conventional Commits with the issue: `feat: add discount codes (#2)`.
- Branch: `<issue>-<slug>`. No direct push to `main`.
