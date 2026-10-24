import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const bundle = await build({ entryPoints: ['lib/business/trade-quote.ts'], bundle: true, write: false, platform: 'node', format: 'esm', packages: 'external' });
const { buildTradeQuote } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const products = [
  { slug: 'oak', name: 'Natural Oak', price: 48, packCoverage: 2.2, size: '190 x 1900 mm' },
  { slug: 'stone', name: 'Pale Stone', price: 36, packCoverage: 1.8, size: '600 x 600 mm' },
];

test('a trade request uses catalogue products and calculates a complete estimate', () => {
  const quote = buildTradeQuote([{ slug: 'oak', packs: 10 }, { slug: 'stone', packs: 2 }], products);
  assert.equal(quote.lines.length, 2);
  assert.equal(quote.lines[0].tier, 'Project');
  assert.equal(quote.lines[0].coverage_sqm, 22);
  assert.equal(quote.subtotal_pence, quote.lines.reduce((sum, line) => sum + line.subtotal_pence, 0));
  assert.equal(quote.estimated_total_pence, quote.subtotal_pence + quote.vat_pence);
});

test('trade requests reject client prices, duplicate products and invalid quantities', () => {
  assert.throws(() => buildTradeQuote([{ slug: 'missing', packs: 1 }], products), /unavailable/);
  assert.throws(() => buildTradeQuote([{ slug: 'oak', packs: 1 }, { slug: 'oak', packs: 2 }], products), /Invalid/);
  assert.throws(() => buildTradeQuote([{ slug: 'oak', packs: 0 }], products), /Invalid/);
  const quote = buildTradeQuote([{ slug: 'oak', packs: 1, total: 1 }], products);
  assert.ok(quote.estimated_total_pence > 1);
  assert.equal('total' in quote.lines[0], false);
});
