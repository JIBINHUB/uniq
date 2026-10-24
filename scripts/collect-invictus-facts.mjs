// Collect factual attributes only. No photographs, marketing text, PDFs or warranty documents are copied.
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
const origin = 'https://invictus.co.uk';
const cache = '.local-tools/manufacturer-facts';
const refresh = process.argv.includes('--refresh');
await fs.mkdir(cache, { recursive: true });
const hash = text => createHash('sha256').update(text).digest('hex').slice(0, 20);
const clean = value => { const url = new URL(value.replaceAll('&amp;', '&'), origin); if (url.origin !== origin) throw Error('Unexpected origin'); url.searchParams.delete('sc_trk'); return url.href; };
async function html(url) {
  const filename = `${cache}/${hash(url)}.html`;
  if (!refresh) { try { return await fs.readFile(filename, 'utf8'); } catch {} }
  for (let attempt = 0; attempt < 3; attempt++) {
    try { const response = await fetch(url, { signal: AbortSignal.timeout(20000) }); if (!response.ok) throw Error(`HTTP ${response.status}`); const text = await response.text(); await fs.writeFile(filename, text); return text; } catch (error) { if (attempt === 2) throw error; }
  }
}
const attributeLabels = new Set(['Collection','Pattern','Dimensions','Thickness / Wear layer','Bevel','Installation method','Impact Sound Insulation','Residential warranty','Commercial warranty','Pieces in 1 carton','m² per pack','Widths (m)','Backing','Texture','Pile composition','TOG rating','Pile height (mm)','Total height','Areas of use','Aspect','Domestic use','Phtalate Free','Residual Indentation']);
const products = [], failures = [];
async function readRanges(kind) {
  const listingUrl = `${origin}/${kind === 'lvt' ? 'lvt/products' : 'carpet'}/product-search`;
  const page = await html(listingUrl), start = page.indexOf('id="list"');
  const attributes = Object.fromEntries([...page.slice(start,start+15000).matchAll(/data-([\w-]+)="([^"]*)"/g)].map(match=>[match[1],match[2].replaceAll('&quot;','"').replaceAll('&amp;','&')]));
  const query={sortProperty:0,skip:0,take:50,filterType:attributes['filter-type'],productSplitOption:attributes['product-split-option']||'',facetStatuses:JSON.parse(attributes['facet-statuses']),presets:JSON.parse(attributes['presets']),usps:[],isShopPage:false,dealerCode:null,isCorporate:false,isQsm:false,isList:true,facetCategories:[]};
  const ranges=[];let total=Infinity;
  while(ranges.length<total){
    const filename=`${cache}/${kind}-${query.skip}.json`;let result;
    if(!refresh){try{result=JSON.parse(await fs.readFile(filename,'utf8'));}catch{}}
    if(!result){const response=await fetch(`${origin}/api/productcatalog/filter/list`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(query),signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error(`Catalogue HTTP ${response.status}`);result=await response.json();await fs.writeFile(filename,JSON.stringify(result));}
    total=result.totalCount;if(!result.products.length&&ranges.length<total)throw Error('Incomplete catalogue pagination');ranges.push(...result.products);query.skip+=result.products.length;
  }
  return ranges;
}
for (const kind of ['lvt', 'carpet']) {
  const ranges = await readRanges(kind);
  for (const range of ranges) {
    const model = { slug: `invictus-${range.themeCode.toLowerCase().replaceAll('_','-')}`, name: range.name, brand: 'Invictus', collection: range.collection || '', category: kind, variants: [] };
    let next = 0;
    async function worker() {
      while (next < range.colors.length) {
        const index = next++, colour = range.colors[index], sourceUrl = clean(colour.url);
        try {
          const page = await html(sourceUrl);
          const blocks = [...page.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(match => JSON.parse(match[1])).flat();
          const data = blocks.find(item => item['@type'] === 'Product'); if (!data) throw Error('No factual product schema');
          const specifications = (data.additionalProperty || []).filter(item => attributeLabels.has(item.name)).map(item => ({ label: item.name, value: String(item.value) }));
          const warrantyYears = [...new Set([...page.matchAll(/alt="[^\"]*?\b(\d+)\s*year[ -]*(stain|wear)[^\"]*warranty[^\"]*"/gi)].map(match => `${match[1]}-year ${match[2].toLowerCase()} warranty`))];
          const bleachCleanable = /alt="[^\"]*bleach cleanable[^\"]*"/i.test(page);
          model.variants[index] = { id: `${range.themeCode}-${colour.colorCode}-${index}`, name: colour.colorName || colour.colorCode, colourCode: colour.colorCode, sku: data.sku || colour.productCode || '', dimensions: colour.size || '', widths: colour.widths || [], specifications, warrantyYears, bleachCleanable, sourceUrl };
        } catch (error) { failures.push({ range: range.name, colour: colour.colorName, error: error.message }); }
      }
    }
    await Promise.all([worker(),worker(),worker()]);
    model.variants = model.variants.filter(Boolean); products.push(model);
    console.log(`${kind}: ${range.name} — ${model.variants.length}/${range.colors.length} factual colour records`);
  }
}
await fs.mkdir('lib/catalogue', { recursive: true });
await fs.writeFile('lib/catalogue/invictus-facts.json', JSON.stringify({ collectedAt: new Date().toISOString(), source: origin, imagery: 'Original AI material illustrations; not manufacturer product photographs', waterproofClaimSource: `${origin}/lvt`, failures, products }, null, 2));
console.log(JSON.stringify({ ranges: products.length, variants: products.reduce((sum,product)=>sum+product.variants.length,0), failures }));
if (failures.length) process.exitCode = 1;
