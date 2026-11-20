# shipgate · demo

A deliberately tiny TypeScript cart calculator with **three ready-made issues**, so you can watch
[shipgate](https://github.com/Iremir0/shipgate) take tickets from *To Do* to
*Ready for Release* in about five minutes.

| Issue | What it exercises |
|---|---|
| Improve the error message for an invalid quantity | `dev-standard`, a one-sentence change: test-first may be skipped |
| Add percentage discount codes | risk keyword → `dev-critical`, test-first is mandatory, `security-reviewer` joins the review |
| Bug: subtotal ignores the quantity of the last item | bug flow: a failing regression test is written before the fix |

## Try it

1. Click **Use this template** (or fork) and clone your copy.
2. Install and seed:
   ```bash
   npm ci
   npm run seed        # creates status labels + the three issues with gh
   ```
3. Open Claude Code in the repo and trust the folder. `.claude/settings.json` already enables the plugin from its
   marketplace; accept the install prompt (or run `/plugin marketplace add Iremir0/shipgate` and
   `/plugin install shipgate@shipgate`).
4. Run:
   ```
   /pipeline
   ```
   Watch the issue labels move `status:todo → in-progress → code-review → testing → ready-for-release`, with the plan,
   review decisions and a release note posted as comments, and one merged PR per issue.

The pipeline never closes issues: closing is your "release".

## What's inside
- `src/cart.ts` — `lineTotal`, `subtotal`, `applyVat` (integer minor units, half-up rounding)
- `src/pricing/discount.ts` — `applyDiscount` (percentage codes `WELCOME10`, `VIP25`; discount rounded half up, before VAT)
- `CLAUDE.md` — the invariants reviewers enforce
- `.claude/pipeline.json` — the pipeline configuration for this repo
- `scripts/seed-issues.mjs` — labels + issues

MIT licensed.
