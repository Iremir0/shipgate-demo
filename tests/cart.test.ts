import { test } from 'node:test'
import assert from 'node:assert/strict'
import { applyVat, lineTotal, subtotal } from '../src/cart.ts'

test('lineTotal multiplies unit price by quantity', () => {
  assert.equal(lineTotal({ sku: 'MUG', unitPriceMinor: 1250, qty: 3 }), 3750)
})

test('lineTotal rejects a negative quantity', () => {
  assert.throws(
    () => lineTotal({ sku: 'MUG', unitPriceMinor: 1250, qty: -1 }),
    { message: 'Quantity must be a non-negative integer (got -1) for SKU MUG' },
  )
})

test('lineTotal rejects a non-integer quantity', () => {
  assert.throws(
    () => lineTotal({ sku: 'MUG', unitPriceMinor: 1250, qty: 1.5 }),
    { message: 'Quantity must be a non-negative integer (got 1.5) for SKU MUG' },
  )
})

test('subtotal of an empty cart is 0', () => {
  assert.equal(subtotal([]), 0)
})

test('subtotal adds line totals', () => {
  assert.equal(subtotal([
    { sku: 'MUG', unitPriceMinor: 1250, qty: 2 },
    { sku: 'TEE', unitPriceMinor: 4000, qty: 1 },
  ]), 6500)
})

test('subtotal multiplies the last item by its quantity (regression #3)', () => {
  assert.equal(subtotal([
    { sku: 'MUG', unitPriceMinor: 1250, qty: 1 },
    { sku: 'TEE', unitPriceMinor: 4000, qty: 3 },
  ]), 13250)
})

test('subtotal of a single-item cart uses its quantity', () => {
  assert.equal(subtotal([{ sku: 'TEE', unitPriceMinor: 4000, qty: 3 }]), 12000)
})

test('subtotal rejects a negative quantity on the last item', () => {
  assert.throws(
    () => subtotal([
      { sku: 'MUG', unitPriceMinor: 1250, qty: 1 },
      { sku: 'TEE', unitPriceMinor: 4000, qty: -1 },
    ]),
    { message: 'Quantity must be a non-negative integer (got -1) for SKU TEE' },
  )
})

test('applyVat adds VAT and rounds half up to a whole minor unit', () => {
  assert.equal(applyVat(1000, 20), 1200)
  assert.equal(applyVat(999, 20), 1199) // 1198.8 -> 1199
  assert.equal(applyVat(1, 50), 2) // 1.5 -> 2
})
