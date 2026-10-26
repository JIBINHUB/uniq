import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {supabaseConfig} from '@/lib/supabase/config';
import {products as defaults,categories as defaultCategories,type Product,type Category} from '@/lib/data';
import {manufacturerProducts as defaultRanges} from '@/lib/catalogue/data';
import {defaultContent,type Row} from './model';
import type {ManufacturerProduct} from '@/lib/catalogue/types';
export type StoreData={products:Product[];categories:Category[];ranges:ManufacturerProduct[];content:Record<string,Row>};
export async function storefrontData(source: 'configured' | 'supabase' = 'configured',timings?:string[]):Promise<StoreData>{
 // The public catalogue remains available while the owner schema is being activated.
 // Opt in only after the migration has been applied and its data verified.
 if(source !== 'supabase' && process.env.STORE_CONTENT_SOURCE!=='supabase')return {products:defaults,categories:defaultCategories,ranges:defaultRanges,content:defaultContent};
 try{
 const{url,key}=supabaseConfig();const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const measure=async<T,>(name:string,request:PromiseLike<T>):Promise<T>=>{const start=Date.now();const result=await request;timings?.push(`${name};dur=${Date.now()-start}`);return result;};
 const [products,categories,ranges,content,business]=await Promise.all([
 measure('products',db.from('products').select('id,slug,name,category_id,description,colour,finish,thickness,dimensions,wear_layer,installation,warranty,pack_coverage,availability,status,badge,tags,compare_at_pence,product_images(*),product_prices(*)').eq('status','published').order('created_at')),
 measure('categories',db.from('categories').select('*').eq('published',true).order('created_at')),
 measure('ranges',db.from('manufacturer_ranges').select('*').eq('published',true).order('name')),
 measure('content',db.from('published_site_content').select('key,published')),
 measure('business',db.from('public_business_details').select('*').maybeSingle()),
 ]);
 if(products.error||categories.error||ranges.error||content.error)throw Error('Catalogue unavailable');
 const mappedCategories=(categories.data||[]).map(c=>({id:c.slug,title:c.name,short:c.description,intro:c.description,image:c.image_url||defaultCategories.find(x=>x.id===c.slug)?.image||'/assets/real/living-oak.jpg',hero:c.description}));
 const categoryMap=new Map((categories.data||[]).map(c=>[c.id,c.slug]));
 const mappedProducts=(products.data||[]).map(p=>{
 const previous=defaults.find(x=>x.slug===p.slug);const media=(p.product_images||[]).sort((a:Row,b:Row)=>Number(a.position)-Number(b.position));
 const price=(p.product_prices||[]).find((x:Row)=>x.active&&x.verified&&x.unit==='sqm');
 return {slug:p.slug,name:p.name,category:categoryMap.get(p.category_id)||'engineered',image:media[0]?.url||previous?.image||'/assets/real/living-oak.jpg',textureImage:media[1]?.url||media[0]?.url||previous?.textureImage||'',roomImage:media[2]?.url||media[0]?.url||previous?.roomImage||'',badge:p.badge,price:price?Number(price.amount_pence)/100:previous?.price||0,old:Number(p.compare_at_pence||0)/100||previous?.old||0,colour:p.colour||'',finish:p.finish||'',thickness:p.thickness||'',size:p.dimensions||'',wear:p.wear_layer||'',install:p.installation||'',warranty:p.warranty||'',rating:previous?.rating||'',tags:p.tags||[],details:p.description,packCoverage:Number(p.pack_coverage)||2.2,availability:p.availability};});
 const mappedContent={...defaultContent};if(business.data)mappedContent.business=business.data;for(const row of content.data||[])if(row.published)mappedContent[row.key]=row.published;
 return {products:mappedProducts,categories:mappedCategories,ranges:(ranges.data||[]) as ManufacturerProduct[],content:mappedContent};
 }catch(error){if(source==='supabase')throw error;return {products:defaults,categories:defaultCategories,ranges:defaultRanges,content:defaultContent};}
}
