import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (p: string) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'))

test('pipeline config is valid JSON with verifyOnStop rules', () => {
  const c = read('.claude/pipeline.json')
  assert.equal(c.tracker.type, 'github')
  for (const r of c.verifyOnStop) assert.doesNotThrow(() => new RegExp(r.paths))
})

test('only the discount issue matches a risk keyword', () => {
  const c = read('.claude/pipeline.json')
  const seed = readFileSync(new URL('../scripts/seed-issues.mjs', import.meta.url), 'utf8')
  const blocks = seed.split(/\{\s*title: '/).slice(1)
  const risky = blocks.filter((b) => c.risk.keywords.some((k: string) => b.toLowerCase().includes(k))).map((b) => b.slice(0, 30))
  assert.deepEqual(risky.length, 1)
  assert.match(risky[0], /discount/)
})

test('claude settings are valid JSON', () => {
  assert.ok(read('.claude/settings.json').enabledPlugins['shipgate@shipgate'])
})
