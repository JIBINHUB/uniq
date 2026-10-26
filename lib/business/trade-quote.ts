import { calculateTradeLine } from './trade-pricing';
import type { Product } from '@/lib/data';

export type QuoteSelection = { slug: string; packs: number };

export function buildTradeQuote(items: unknown, products: Product[]) {
  if (!Array.isArray(items) || items.length < 1 || items.length > 30) throw new Error('Choose between 1 and 30 products.');
  const seen = new Set<string>();
  const lines = items.map((value: unknown) => {
    if (!value || typeof value !== 'object') throw new Error('Invalid product selection.');
    const { slug, packs } = value as Record<string, unknown>;
    if (typeof slug !== 'string' || !/^[a-z0-9-]{1,120}$/.test(slug) || seen.has(slug) || !Number.isInteger(packs) || Number(packs) < 1 || Number(packs) > 999) throw new Error('Invalid product or pack quantity.');
    seen.add(slug);
    const product = products.find(item => item.slug === slug);
    if (!product || !Number.isFinite(product.price) || product.price <= 0) throw new Error('A selected product is unavailable for quotation.');
    const price = calculateTradeLine(product.price, product.packCoverage || 2.2, Number(packs), product.size);
    return {
      slug,
      name: product.name,
      packs: Number(packs),
      coverage_sqm: price.totalCoverage,
      subtotal_pence: price.subtotalPence,
      vat_pence: price.vatPence,
      estimated_total_pence: price.totalPence,
      tier: price.tier.label,
    };
  });
  if (lines.reduce((sum, line) => sum + line.packs, 0) > 5000) throw new Error('The request is too large. Contact our team for a project quotation.');
  return {
    lines,
    subtotal_pence: lines.reduce((sum, line) => sum + line.subtotal_pence, 0),
    vat_pence: lines.reduce((sum, line) => sum + line.vat_pence, 0),
    estimated_total_pence: lines.reduce((sum, line) => sum + line.estimated_total_pence, 0),
  };
}
