import { requireAdmin } from '@/lib/supabase/server';
import {privateHeaders as headers,readBody,HttpError,failure,validation} from '@/lib/owner/http';
import { validateProduct } from '@/lib/owner/validation';
export async function GET(request:Request){try{
 const {supabase,authorized,status}=await requireAdmin();if(!authorized)throw new HttpError('Owner access required.',status);
 const url=new URL(request.url),page=Math.max(0,Number(url.searchParams.get('page'))||0),search=(url.searchParams.get('search')||'').replace(/[%_(),]/g,'').slice(0,100);
 let query=supabase.from('products').select('*,categories(name,slug),product_images(*),product_prices(*)',{count:'exact'}).order('updated_at',{ascending:false}).range(page*30,page*30+29);
 if(search)query=query.ilike('name',`%${search}%`);
 const {data,error,count}=await query;if(error)throw error;
 return Response.json({rows:data,count},{headers});
 }catch(error){return failure(error);}}
async function save(request:Request){try{
 const body=await readBody(request);const {supabase,authorized,status}=await requireAdmin();if(!authorized)throw new HttpError('Owner access required.',status);
 const payload=validation(()=>validateProduct(body));
 const {data,error}=await supabase.rpc('save_owner_product',{payload});
 if(error){if(error.code==='23505')throw new HttpError('That SKU or URL slug already exists.',409);throw error;}
 return Response.json({id:data},{headers});
 }catch(error){return failure(error);}}
export const POST=save;export const PATCH=save;
