import {requireAdmin} from '@/lib/supabase/server';
import {resourceFields,type Resource} from '@/lib/owner/model';
import {validateRecord,validateRange,uuid} from '@/lib/owner/validation';
import {privateHeaders as headers,readBody,HttpError,failure,validation} from '@/lib/owner/http';
const readOnly=['manufacturer_ranges','retailer_applications','audit_log','quotations','invoices'];
export async function GET(request:Request){try{
 const {supabase,authorized,status}=await requireAdmin();if(!authorized)throw new HttpError('Owner access required.',status);
 const params=new URL(request.url).searchParams,resource=params.get('resource')||'';
 if(!Object.hasOwn(resourceFields,resource)&&!readOnly.includes(resource))throw new HttpError('Unknown section.');
 const page=Math.max(0,Number(params.get('page'))||0);
 const select=resource==='retailer_applications'?'*,retailer_profiles(status)':resource==='quotations'?'*,customers(name,email),quotation_items(*)':resource==='invoices'?'*,customers(name,email),invoice_items(*)':'*';
 let query=supabase.from(resource).select(select,{count:'exact'}).order('created_at',{ascending:false}).range(page*30,page*30+29);
 const search=(params.get('search')||'').replace(/[%_(),]/g,'').slice(0,100);
 const searchKey=resource==='retailer_applications'?'business_name':resource==='manufacturer_ranges'?'name':['categories','customers'].includes(resource)?'name':['enquiries','sample_requests','work_orders'].includes(resource)?'contact_name':resource==='support_tickets'?'subject':resource==='staff_invitations'?'email':resource==='audit_log'?'entity':'number';
 if(search)query=query.ilike(searchKey,`%${search}%`);
 const {data,error,count}=await query;if(error)throw error;return Response.json({rows:data,count},{headers});
 }catch(error){return failure(error);}}
async function save(request:Request){try{
 const body=await readBody(request);const {supabase,authorized,status,user}=await requireAdmin();if(!authorized)throw new HttpError('Owner access required.',status);
 const resource=String(body.resource),input=body.record as Record<string,unknown>;
 if(!input||typeof input!=='object')throw new HttpError('Record details are required.');
 if(resource==='retailer_applications'){
  if(!uuid.test(String(input.id))||!['approved','rejected','suspended'].includes(String(input.decision)))throw new HttpError('Choose a valid retailer decision.');
  const{error}=await supabase.rpc('review_retailer',{application:input.id,decision:input.decision,notes:String(input.notes||'').slice(0,4000)});if(error)throw error;
  return Response.json({saved:true},{headers});
 }
 if(!Object.hasOwn(resourceFields,resource)&&resource!=='manufacturer_ranges')throw new HttpError('This section cannot be edited here.');
 if(input.id&&resource!=='company_settings'&&!uuid.test(String(input.id)))throw new HttpError('Invalid record ID.');
 const record=validation(()=>resource==='manufacturer_ranges'?validateRange(input):validateRecord(resource as Resource,input));
 if(resource==='staff_invitations')record.invited_by=user?.id||null;
 if(['enquiries','sample_requests'].includes(resource)&&!input.id)record.idempotency_key=crypto.randomUUID();
 if(resource==='sample_requests'&&record.status==='dispatched')record.dispatched_at=new Date().toISOString();
 const table=supabase.from(resource);
 const mutation=resource==='company_settings'?table.update(record).eq('id',true):input.id?table.update(record).eq('id',input.id):table.insert(record);
 const {data,error}=await mutation.select('id').single();
 if(error){if(error.code==='23505')throw new HttpError('This record already exists.',409);throw error;}
 return Response.json({id:data.id},{headers});
 }catch(error){return failure(error);}}
export const POST=save;export const PATCH=save;
