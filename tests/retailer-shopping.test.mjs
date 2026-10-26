import test from 'node:test';
import assert from 'node:assert/strict';
import { isApprovedRetailer } from '../lib/business/retailer-access.ts';
import { selectionWhatsAppHref } from '../lib/business/whatsapp.ts';

test('trade access requires both trusted retailer role and active approved profile', () => {
  assert.equal(isApprovedRetailer('retailer','approved'),true);
  for (const [role,status] of [['customer','approved'],['retailer','suspended'],['retailer',undefined],[undefined,'approved'],['admin','approved']]) assert.equal(isApprovedRetailer(role,status),false);
});
test('WhatsApp separates individual and trade selections without confirming an order', () => {
  const items=[{name:'Oak & stone',colour:'Warm grey',quantity:12,unit:'packs'},{name:'Natural oak',colour:'Oak',quantity:1,unit:'samples'}];
  const customer=new URL(selectionWhatsAppHref('customer',items));
  assert.equal(customer.origin,'https://wa.me');
  assert.equal(customer.pathname,'/447938373500');
  assert.match(customer.searchParams.get('text'),/12 packs/);
  assert.match(customer.searchParams.get('text'),/1 samples/);
  assert.match(customer.searchParams.get('text'),/not a confirmed order/);
  assert.doesNotMatch(customer.searchParams.get('text'),/trade order/);
  const trade=new URL(selectionWhatsAppHref('retailer',items,'Test Flooring'));
  assert.match(trade.searchParams.get('text'),/trade order/);
  assert.match(trade.searchParams.get('text'),/Business: Test Flooring/);
});
