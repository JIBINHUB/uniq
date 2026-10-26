import assert from 'node:assert/strict';
const origin=process.env.OWNER_TEST_ORIGIN||'http://localhost:4175';
const pin=process.env.OWNER_TEST_PIN;
if(!/^\d{4}$/.test(pin||''))throw Error('Set OWNER_TEST_PIN to the local testing PIN.');
for(const path of ['/api/admin/workspace','/api/admin/products','/api/admin/records?resource=retailer_applications']){
 const r=await fetch(origin+path);assert.equal(r.status,401);console.log(path+': anonymous denied');
}
let r=await fetch(origin+'/api/admin/session',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://invalid.example'},body:JSON.stringify({pin})});assert.equal(r.status,403);
r=await fetch(origin+'/api/admin/session',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({pin:pin==='0000'?'9999':'0000'})});assert.equal(r.status,401);
r=await fetch(origin+'/api/admin/session',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({pin})});assert.equal(r.status,200);
const cookie=r.headers.get('set-cookie').split(';')[0];assert.match(r.headers.get('set-cookie'),/HttpOnly/i);assert.match(r.headers.get('set-cookie'),/SameSite=strict/i);
r=await fetch(origin+'/api/admin/session',{headers:{Cookie:cookie}});const data=await r.json();assert.equal(data.mode,'preview','Run this check only against the local read-only preview.');assert.equal(data.catalogue.products.length,12);assert.equal(data.catalogue.ranges.length,80);
r=await fetch(origin+'/api/admin/products',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:'{}'});assert.equal(r.status,401);
r=await fetch(origin+'/api/admin/session',{method:'DELETE',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:'{}'});assert.equal(r.status,200);
console.log('PIN, cookie attributes, origin validation and preview privilege boundaries passed.');
