/** Money is always an integer number of minor units (cents/kuruş). Never use floats for money. */

/** Known discount codes (upper-case key) mapped to an integer percentage. */
const DISCOUNT_PERCENT: ReadonlyMap<string, number> = new Map([
  ['WELCOME10', 10],
  ['VIP25', 25],
])

/**
 * Applies a percentage discount code to a subtotal (before VAT).
 *
 * The code is matched case-insensitively with surrounding whitespace ignored. The discount amount is
 * rounded half up to a whole minor unit in a single step, then subtracted from the subtotal.
 *
 * @throws Error if the subtotal is not a non-negative safe integer or the code is unknown.
 */
export function applyDiscount(subtotalMinor: number, code: string): number {
  if (!Number.isSafeInteger(subtotalMinor) || subtotalMinor < 0) {
    throw new Error(`Invalid subtotal: ${subtotalMinor} (must be a non-negative integer number of minor units)`)
  }
  if (typeof code !== 'string') {
    throw new Error(`Unknown discount code: ${String(code)}`)
  }
  const percent = DISCOUNT_PERCENT.get(code.trim().toUpperCase())
  if (percent === undefined) {
    throw new Error(`Unknown discount code: ${code}`)
  }
  // discount = round_half_up(subtotal * percent / 100), computed in integers. Splitting the subtotal into
  // whole hundreds and a remainder keeps every intermediate value a safe integer for any safe subtotal;
  // the single rounding step happens on the remainder term only (the hundreds term is exact).
  const hundreds = Math.floor(subtotalMinor / 100)
  const remainder = subtotalMinor % 100
  const discountMinor = hundreds * percent + Math.floor((remainder * percent + 50) / 100)
  return Math.max(0, subtotalMinor - discountMinor)
}
