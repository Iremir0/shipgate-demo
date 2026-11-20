#!/usr/bin/env node
// Creates the pipeline labels and three demo issues in the current GitHub repo.
// Safe to re-run: labels are upserted, issues with an existing title are skipped.
import { spawnSync } from 'node:child_process'

function gh(args, input) {
  const opts = { encoding: 'utf8', input }
  let r = spawnSync('gh', args, opts)
  if (r.status !== 0 && process.env.GITHUB_TOKEN && /GITHUB_TOKEN|401|Bad credentials|authentication/i.test(r.stderr)) {
    const env = { ...process.env }
    delete env.GITHUB_TOKEN
    r = spawnSync('gh', args, { ...opts, env })
  }
  if (r.status !== 0) throw new Error(`gh ${args.join(' ')}\n${r.stderr}`)
  return r.stdout
}

const LABELS = [
  ['status:todo', 'ededed', 'Pipeline: ready to pick up'],
  ['status:in-progress', 'fbca04', 'Pipeline: tests and implementation'],
  ['status:code-review', '1d76db', 'Pipeline: PR under review'],
  ['status:testing', '5319e7', 'Pipeline: single testing queue'],
  ['status:ready-for-release', '0e8a16', 'Pipeline: merged, waiting for a human release'],
  ['blocked', 'b60205', 'Pipeline skips this until a human removes the label'],
  ['priority:high', 'd93f0b', 'Picked first'],
]

const ISSUES = [
  {
    title: 'Improve the error message for an invalid quantity',
    labels: ['status:todo'],
    body: `## Context
\`lineTotal\` throws \`invalid qty\`, which tells a caller nothing about which line was wrong.

## Acceptance criteria
- [ ] **Given** an item with SKU \`MUG\` and qty \`-1\`, **when** \`lineTotal\` is called, **then** it throws an \`Error\` whose message is exactly \`Quantity must be a non-negative integer (got -1) for SKU MUG\`.
- [ ] The same message format is used for a non-integer quantity (e.g. \`1.5\`).

## Out of scope
- Validating \`unitPriceMinor\`.

## Security and data notes
None.`,
  },
  {
    title: 'Add percentage discount codes',
    labels: ['status:todo', 'priority:high'],
    body: `## Context
Marketing wants two discount codes. This touches money, so it must follow the invariants in \`CLAUDE.md\`.

## Acceptance criteria
- [ ] New \`applyDiscount(subtotalMinor: number, code: string): number\` in \`src/pricing/discount.ts\`.
- [ ] Known codes: \`WELCOME10\` = 10 %, \`VIP25\` = 25 %. Codes are case-insensitive and surrounding whitespace is ignored.
- [ ] The discount is subtracted from the subtotal (before VAT) and the discount amount is rounded **half up** to a whole minor unit. Example: subtotal \`1005\` with \`WELCOME10\` → discount \`101\` (100.5 → 101) → result \`904\`.
- [ ] An unknown code throws \`Error('Unknown discount code: <code as given>')\`.
- [ ] The result is never negative and is always an integer.

## Test plan
- Unit: both codes, case/whitespace, the rounding example above, unknown code, zero subtotal.

## Out of scope
- Stacking several codes, expiry dates, fixed-amount codes.

## Security and data notes
Money calculation: integer minor units only, single rounding step.`,
  },
  {
    title: 'Bug: subtotal ignores the quantity of the last item',
    labels: ['status:todo'],
    body: `## Steps to reproduce
\`\`\`ts
subtotal([
  { sku: 'MUG', unitPriceMinor: 1250, qty: 1 },
  { sku: 'TEE', unitPriceMinor: 4000, qty: 3 },
])
\`\`\`
**Expected:** \`13250\` · **Actual:** \`5250\`

## Acceptance criteria
- [ ] A regression test reproduces the case above and passes after the fix.
- [ ] The last item's quantity is validated like every other item (a negative qty on the last line throws).

## Security and data notes
Money calculation; no other impact.`,
  },
]

for (const [name, color, description] of LABELS) {
  gh(['label', 'create', name, '--color', color, '--description', description, '--force'])
  console.log(`label  ${name}`)
}

const existing = new Set(JSON.parse(gh(['issue', 'list', '--state', 'all', '--limit', '200', '--json', 'title'])).map((i) => i.title))
for (const issue of ISSUES) {
  if (existing.has(issue.title)) { console.log(`skip   ${issue.title}`); continue }
  const url = gh(['issue', 'create', '--title', issue.title, '--body-file', '-', ...issue.labels.flatMap((l) => ['--label', l])], issue.body).trim()
  console.log(`issue  ${url}`)
}
