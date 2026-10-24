export type PricingUnit = "sqm" | "pack" | "item";
function scaled(value: number | string, scale = 10000): bigint {
  const text = String(value);
  if (!/^\d+(\.\d{1,4})?$/.test(text)) throw new Error("Use a positive number with at most four decimal places.");
  const [whole, fraction = ""] = text.split(".");
  return BigInt(whole) * BigInt(scale) + BigInt(fraction.padEnd(4, "0"));
}
function roundDivide(n: bigint, d: bigint) { return (n + d / 2n) / d; }
export function calculatePacks(area: number | string, coverage: number | string, wastePercent: number) {
  const a = scaled(area), c = scaled(coverage);
  if (a <= 0n || c <= 0n || !Number.isInteger(wastePercent) || wastePercent < 0 || wastePercent > 30)
    throw new Error("Enter a valid area, pack coverage and waste allowance.");
  const required = a * BigInt(100 + wastePercent);
  const divisor = c * 100n;
  const packs = (required + divisor - 1n) / divisor;
  if (packs > 100000n) throw new Error("The requested quantity is too large.");
  return { packs: Number(packs), coveredArea: Number(packs * c) / 10000 };
}
export function lineTotalPence(quantity: number | string, pricePence: number) {
  if (!Number.isSafeInteger(pricePence) || pricePence < 0) throw new Error("Invalid price.");
  const total = roundDivide(scaled(quantity) * BigInt(pricePence), 10000n);
  if (total > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("Total exceeds supported range.");
  return Number(total);
}
export function documentTotals(lines: { quantity: number | string; unitPricePence: number }[], discountPence = 0, deliveryPence = 0, vatBasisPoints = 0) {
  for (const value of [discountPence, deliveryPence, vatBasisPoints])
    if (!Number.isSafeInteger(value) || value < 0) throw new Error("Invalid adjustment.");
  if (vatBasisPoints > 10000) throw new Error("Invalid VAT rate.");
  const subtotalPence = lines.reduce((sum, line) => sum + lineTotalPence(line.quantity, line.unitPricePence), 0);
  if (!Number.isSafeInteger(subtotalPence) || discountPence > subtotalPence) throw new Error("Invalid subtotal or discount.");
  const net = BigInt(subtotalPence - discountPence) + BigInt(deliveryPence);
  const vat = roundDivide(net * BigInt(vatBasisPoints), 10000n);
  if (net + vat > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("Total exceeds supported range.");
  return { subtotalPence, discountPence, deliveryPence, vatPence: Number(vat), totalPence: Number(net + vat) };
}
