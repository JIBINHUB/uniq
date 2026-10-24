import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseMaterialSelection, selectionStorageKey } from '../lib/catalogue/selection.ts';
const facts=JSON.parse(fs.readFileSync(new URL('../lib/catalogue/invictus-facts.json',import.meta.url)));
test('the complete public catalogue has all ranges and unique colour records with factual sources',()=>{
  assert.equal(facts.products.filter(product=>product.category==='lvt').length,65);
  assert.equal(facts.products.filter(product=>product.category==='carpet').length,15);
  assert.equal(facts.failures.length,0);
  const variants=facts.products.flatMap(product=>product.variants);
  assert.equal(variants.length,366);
  assert.equal(new Set(variants.map(variant=>variant.id)).size,366);
  for(const variant of variants){assert.ok(variant.specifications.length>0);assert.equal(new URL(variant.sourceUrl).hostname,'invictus.co.uk');assert.equal(variant.images,undefined);}
  const ultimus=facts.products.find(product=>product.slug==='invictus-w-dmaj7rp').variants[0];
  assert.equal(ultimus.specifications.find(item=>item.label==='Residential warranty').value,'40 years');
  const sirius=facts.products.find(product=>product.slug==='invictus-f-sinwta').variants[0];
  assert.ok(sirius.warrantyYears.includes('20-year wear warranty'));
  assert.ok(sirius.warrantyYears.includes('20-year stain warranty'));
});
test('selection parsing rejects corrupted, unknown and excessive quantities and separates channels',()=>{
  const ids=new Set(['floor-one']);
  assert.deepEqual(parseMaterialSelection('broken',ids),[]);
  assert.deepEqual(parseMaterialSelection(JSON.stringify([{id:'floor-one',area:20},{id:'unknown',area:10},{id:'floor-one',area:-1},{id:'floor-one',area:10001}]),ids),[{id:'floor-one',area:20}]);
  assert.notEqual(selectionStorageKey('customer'),selectionStorageKey('retailer'));
});
