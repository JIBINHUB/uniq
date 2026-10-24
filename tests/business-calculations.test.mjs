import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePacks, lineTotalPence, documentTotals } from '../lib/business/calculations.ts';

test('pack boundary uses decimal arithmetic and never adds a floating-point extra pack', () => {
  assert.deepEqual(calculatePacks('20', '2.2', 10), { packs: 10, coveredArea: 22 });
  assert.deepEqual(calculatePacks('20', '2.2', 15), { packs: 11, coveredArea: 24.2 });
  assert.equal(calculatePacks('22.0001', '2.2', 0).packs, 11);
});
test('coverage is product-specific and invalid values fail safely', () => {
  assert.equal(calculatePacks(20, '1.8', 10).packs, 13);
  assert.throws(() => calculatePacks(20, 0, 10));
  assert.throws(() => calculatePacks(-1, '2.2', 10));
  assert.throws(() => calculatePacks(20, '2.2', 100));
});
test('prices round to pence and quotation VAT applies after discount and delivery', () => {
  assert.equal(lineTotalPence('2.2', 4795), 10549);
  assert.deepEqual(documentTotals([{ quantity: 10, unitPricePence: 10549 }], 5490, 5000, 2000), {
    subtotalPence: 105490, discountPence: 5490, deliveryPence: 5000, vatPence: 21000, totalPence: 126000,
  });
  assert.throws(() => documentTotals([{quantity: 1, unitPricePence: 10}], 11));
});
