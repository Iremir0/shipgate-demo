import { test } from 'node:test'
import assert from 'node:assert/strict'
import { applyDiscount } from '../src/pricing/discount.ts'

test('applyDiscount: WELCOME10 takes 10 % off the subtotal', () => {
  assert.equal(applyDiscount(1000, 'WELCOME10'), 900)
})

test('applyDiscount: VIP25 takes 25 % off the subtotal', () => {
  assert.equal(applyDiscount(1000, 'VIP25'), 750)
})

test('applyDiscount: codes are case-insensitive', () => {
  assert.equal(applyDiscount(1000, 'welcome10'), 900)
  assert.equal(applyDiscount(1000, 'Welcome10'), 900)
  assert.equal(applyDiscount(1000, 'vip25'), 750)
  assert.equal(applyDiscount(1000, 'ViP25'), 750)
})

test('applyDiscount: surrounding whitespace is ignored', () => {
  assert.equal(applyDiscount(1000, '  WELCOME10  '), 900)
  assert.equal(applyDiscount(1000, '\tvip25\n'), 750)
})

test('applyDiscount: discount amount is rounded half up (1005 WELCOME10 -> 100.5 -> 101 -> 904)', () => {
  assert.equal(applyDiscount(1005, 'WELCOME10'), 904)
})

test('applyDiscount: VIP25 discount is rounded half up (1002 -> 250.5 -> 251 -> 751)', () => {
  assert.equal(applyDiscount(1002, 'VIP25'), 751)
})

test('applyDiscount: discount below half a minor unit rounds down', () => {
  assert.equal(applyDiscount(1004, 'WELCOME10'), 904) // 100.4 -> 100
  assert.equal(applyDiscount(1, 'WELCOME10'), 1) // 0.1 -> 0
  assert.equal(applyDiscount(2, 'VIP25'), 1) // 0.5 -> 1
})

test('applyDiscount: zero subtotal stays 0', () => {
  assert.equal(applyDiscount(0, 'WELCOME10'), 0)
  assert.equal(applyDiscount(0, 'VIP25'), 0)
})

test('applyDiscount: result is always a non-negative integer', () => {
  for (const code of ['WELCOME10', 'VIP25']) {
    for (let subtotalMinor = 0; subtotalMinor <= 2000; subtotalMinor++) {
      const result = applyDiscount(subtotalMinor, code)
      assert.ok(Number.isInteger(result), `${code} ${subtotalMinor} -> ${result} is not an integer`)
      assert.ok(result >= 0, `${code} ${subtotalMinor} -> ${result} is negative`)
      assert.ok(result <= subtotalMinor, `${code} ${subtotalMinor} -> ${result} exceeds subtotal`)
    }
  }
})

test('applyDiscount: unknown code throws with the code as given', () => {
  assert.throws(() => applyDiscount(1000, 'SUMMER50'), {
    name: 'Error',
    message: 'Unknown discount code: SUMMER50',
  })
})

test('applyDiscount: unknown code message preserves original spelling and whitespace', () => {
  assert.throws(() => applyDiscount(1000, ' Summer50 '), {
    name: 'Error',
    message: 'Unknown discount code:  Summer50 ',
  })
})

test('applyDiscount: empty code is unknown', () => {
  assert.throws(() => applyDiscount(1000, ''), {
    name: 'Error',
    message: 'Unknown discount code: ',
  })
})

test('applyDiscount: rejects a negative subtotal', () => {
  assert.throws(() => applyDiscount(-1, 'WELCOME10'), /subtotal/i)
})

test('applyDiscount: rejects a non-integer subtotal', () => {
  assert.throws(() => applyDiscount(10.5, 'WELCOME10'), /subtotal/i)
})

test('applyDiscount: rejects NaN and Infinity subtotals instead of returning NaN', () => {
  assert.throws(() => applyDiscount(Number.NaN, 'WELCOME10'), /subtotal/i)
  assert.throws(() => applyDiscount(Number.POSITIVE_INFINITY, 'VIP25'), /subtotal/i)
})
