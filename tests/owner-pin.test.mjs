import test from 'node:test';
import assert from 'node:assert/strict';
import {hashPin,verifyPin,signOwnerSession,verifyOwnerSession,ownerSessionSeconds} from '../lib/owner/pin.ts';
import {safeUrl,moneyToPence} from '../lib/owner/model.ts';
test('PINs use salted hashes and only exact four-digit values are accepted',()=>{
 const hash=hashPin('2468');assert.notEqual(hash,hashPin('2468'));assert.equal(verifyPin('2468',hash),true);
 for(const value of ['246',2468,'0000','24680',' 2468',null])assert.equal(verifyPin(value,hash),false);
});
test('owner sessions reject tampering, expired tokens, wrong signing keys and preview escalation',()=>{
 const secret='unit-test-signing-secret',now=Date.now(),token=signOwnerSession(secret,'live',now);
 assert.equal(verifyOwnerSession(token,secret,now+1),'live');assert.equal(verifyOwnerSession(token,'wrong-key',now+1),null);
 assert.equal(verifyOwnerSession(token,secret,now+ownerSessionSeconds*1000+1),null);
 const [payload,signature]=token.split('.');const data=JSON.parse(Buffer.from(payload,'base64url').toString());data.mode='live';
 const preview=signOwnerSession(secret,'preview',now);const edited=Buffer.from(JSON.stringify(data)).toString('base64url')+'.'+preview.split('.')[1];assert.equal(verifyOwnerSession(edited,secret,now+1),null);
 assert.equal(verifyOwnerSession(token+'.junk',secret,now+1),null);
});
test('media and destination validation rejects scripts, protocol-relative links and misleading paths',()=>{
 for(const value of ['javascript:alert(1)','//evil.test/image','http://unsafe.test/image','/\\evil.test','/hello\nworld'])assert.equal(safeUrl(value),false);
 assert.equal(safeUrl('/assets/product.webp'),true);assert.equal(safeUrl('https://example.test/image.webp'),true);assert.equal(safeUrl('https://example.test',false),false);
 assert.equal(moneyToPence('39.99'),3999);assert.throws(()=>moneyToPence('12.345'));assert.throws(()=>moneyToPence('-1'));
});
