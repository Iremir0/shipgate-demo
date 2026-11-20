/** Money is always an integer number of minor units (cents/kuruş). Never use floats for money. */
export type LineItem = { sku: string; unitPriceMinor: number; qty: number }

export function lineTotal(item: LineItem): number {
  if (!Number.isInteger(item.qty) || item.qty < 0) throw new Error('invalid qty')
  return item.unitPriceMinor * item.qty
}

export function subtotal(items: LineItem[]): number {
  if (items.length === 0) return 0
  const head = items.slice(0, -1).reduce((sum, item) => sum + lineTotal(item), 0)
  const last = items[items.length - 1]
  return head + last.unitPriceMinor
}

/** Adds VAT at an integer percentage and rounds half up to a whole minor unit. */
export function applyVat(minor: number, ratePercent: number): number {
  return Math.floor((minor * (100 + ratePercent) + 50) / 100)
}
