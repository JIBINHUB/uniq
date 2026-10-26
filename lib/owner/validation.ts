import { resourceFields, productFields, heroFields, promotionFields, safeUrl, moneyToPence, type Row, type Field, type Resource } from './model';
export const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function fields(input:Row, definitions:readonly Field[]):Row {
 const out:Row={};
 for(const field of definitions){let value=input[field.key];
  if(field.type==='checkbox'){out[field.key]=value===true;continue;}
  if(field.type==='number'){const n=Number(value);if(value===''||value===undefined){if(field.required)throw new Error(`${field.label} is required.`);out[field.key]=0;continue;}if(!Number.isFinite(n)||n<(field.min??0)||n>(field.max??10000000)||(field.step==='1'&&!Number.isInteger(n)))throw new Error(`Invalid ${field.label}.`);out[field.key]=n;continue;}
  if(value===null||value===undefined)value='';
  if(typeof value!=='string')throw new Error(`Invalid ${field.label}.`);
  value=value.trim();const text=value as string;
  if(text.length>(field.type==='textarea'?10000:2000)||(field.required&&!text))throw new Error(`Complete ${field.label}.`);
  if(field.options&&!field.options.includes(text))throw new Error(`Invalid ${field.label}.`);
  if(field.type==='email'&&text&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text))throw new Error('Enter a valid email address.');
  if((field.type==='date'||field.type==='datetime-local')&&text&&!Number.isFinite(Date.parse(text)))throw new Error(`Invalid ${field.label}.`);
  out[field.key]=field.type==='datetime-local'?(text?new Date(text).toISOString():null):text;
 }
 return out;
}
export function validateRecord(resource:Resource,input:Row){
 const out=fields(input,resourceFields[resource]);
 if(resource==='categories'){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(out.slug)))throw new Error('Use a lowercase URL slug.');if(out.image_url&&!safeUrl(out.image_url))throw new Error('Use a secure image URL.');}
 if(resource==='staff_invitations')out.email=String(out.email).toLowerCase();
 if(resource==='company_settings'&&out.whatsapp_number&&!/^\d{8,15}$/.test(String(out.whatsapp_number)))throw new Error('WhatsApp needs 8–15 digits including the country code.');
 return out;
}
export function validateProduct(input:Row){
 const out=fields(input,productFields);
 if(input.id&&!uuid.test(String(input.id)))throw new Error('Invalid product ID.');
 if(!uuid.test(String(out.category_id))||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(out.slug)))throw new Error('Choose a category and a lowercase product slug.');
 const images=['image','textureImage','roomImage'].map(key=>out[key]).filter(Boolean).map(url=>{if(!safeUrl(url))throw new Error('Use a local or HTTPS image URL.');return {url,alt:out.name};});
 const price=moneyToPence(input.price), compare=moneyToPence(input.compare_at||input.price);
 if(out.status==='published'&&price<=0)throw new Error('Published products need a selling price.');
 if(out.availability==='in_stock'&&out.stock_confirmed===true&&Number(out.stock_packs)<1)throw new Error('In-stock products need at least one confirmed pack.');
 if(compare<price)throw new Error('Previous price cannot be below the selling price.');
 for(const key of ['image','textureImage','roomImage','price','compare_at','vat','tags_text'])delete out[key];
 return {...out,id:input.id||null,price_pence:price,compare_at_pence:compare,vat_basis_points:Math.round(Number(input.vat)*100),images,tags:String(input.tags_text||'').split(',').map(x=>x.trim()).filter(Boolean).slice(0,30)};
}
export function validateContent(key:string,input:Row){
 if(key==='hero'){const out=fields(input,heroFields);if(!safeUrl(out.button_href,false)||!safeUrl(out.image)||(out.video&&!safeUrl(out.video)))throw new Error('Choose a site link and valid media URLs.');return out;}
 if(key==='promotions'){
  if(!Array.isArray(input.items)||input.items.length>12)throw new Error('Use up to 12 promotions.');
  return {items:input.items.map(item=>{const out=fields(item as Row,promotionFields);if(!safeUrl(out.href,false)||!safeUrl(out.image)||!/^#[0-9a-f]{6}$/i.test(String(out.colour)))throw new Error('Check promotion link, image and hex colour.');if(out.starts_at&&out.ends_at&&String(out.starts_at)>=String(out.ends_at))throw new Error('Promotion end must be after its start.');return out;})};
 }
 throw new Error('Unknown website section.');
}
export function validateRange(input:Row){
 const keys:Field[]=[{key:'name',label:'Range name',required:true},{key:'slug',label:'URL slug',required:true},{key:'brand',label:'Brand'},{key:'collection',label:'Collection'},{key:'category',label:'Material',type:'select',options:['carpet','lvt'],required:true},{key:'image',label:'Range image URL'},{key:'published',label:'Visible',type:'checkbox'}];
 const out=fields(input,keys);
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(out.slug))||(out.image&&!safeUrl(out.image)))throw new Error('Check the range slug and image URL.');
 if(!Array.isArray(input.variants)||input.variants.length<1||input.variants.length>150)throw new Error('Add between 1 and 150 colours.');
 const ids=new Set<string>();
 out.variants=input.variants.map((v:Row,index:number)=>{
 const name=String(v.name||'').trim(),id=String(v.id||`${out.slug}-${index+1}`);
 if(!name||name.length>150||!/^[a-zA-Z0-9_-]{1,180}$/.test(id)||ids.has(id))throw new Error('Every colour needs a unique ID and a name.');ids.add(id);
 const widths=Array.isArray(v.widths)?v.widths.map(Number):String(v.widths||'').split(',').filter(Boolean).map(Number);
 if(widths.some(n=>!Number.isFinite(n)||n<=0||n>20))throw new Error('Roll widths must be between 0 and 20 metres.');
 if(v.sourceUrl&&!safeUrl(v.sourceUrl))throw new Error('Colour source links must use HTTPS.');
 return {id,name,colourCode:String(v.colourCode||'').slice(0,80),sku:String(v.sku||'').slice(0,120),dimensions:String(v.dimensions||'').slice(0,200),widths,specifications:Array.isArray(v.specifications)?v.specifications.slice(0,30).map((s:Row)=>({label:String(s.label||'').slice(0,100),value:String(s.value||'').slice(0,500)})):[],warrantyYears:Array.isArray(v.warrantyYears)?v.warrantyYears.map(String).slice(0,10):[],bleachCleanable:v.bleachCleanable===true,sourceUrl:String(v.sourceUrl||'')};
 });return out;
}
