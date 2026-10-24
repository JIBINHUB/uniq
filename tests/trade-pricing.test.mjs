import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTradeLine, estimatePiecesPerPack, nextTradeTier, tradeTierForPacks } from '../lib/business/trade-pricing.ts';

test('trade tiers reduce the unit price as pack volume increases', () => {
  const one = calculateTradeLine(44.99, 2.2, 1, '190 x 1900 mm');
  const ten = calculateTradeLine(44.99, 2.2, 10, '190 x 1900 mm');
  const twentyFive = calculateTradeLine(44.99, 2.2, 25, '190 x 1900 mm');
  assert.equal(tradeTierForPacks(1).discount, 0.15);
  assert.equal(tradeTierForPacks(10).discount, 0.2);
  assert.equal(tradeTierForPacks(25).discount, 0.25);
  assert.ok(one.piecePricePence > ten.piecePricePence);
  assert.ok(ten.piecePricePence > twentyFive.piecePricePence);
});

test('trade line reports packs, pieces, coverage, VAT and a payable total', () => {
  const line = calculateTradeLine(39.99, 2.2, 12, '120 x 600 mm');
  assert.equal(line.packs, 12);
  assert.equal(line.totalCoverage, 26.4);
  assert.equal(line.totalPieces, line.piecesPerPack * 12);
  assert.equal(line.totalPence, line.subtotalPence + line.vatPence);
  assert.equal(estimatePiecesPerPack('120 x 600 mm', 2.2), 31);
  assert.equal(nextTradeTier(12)?.minimumPacks, 25);
});
