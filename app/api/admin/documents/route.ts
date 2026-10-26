import {requireAdmin} from '@/lib/supabase/server';
import {privateHeaders as headers,readBody,HttpError,failure,validation} from '@/lib/owner/http';
import {moneyToPence,type Row} from '@/lib/owner/model';
import {uuid} from '@/lib/owner/validation';
export async function POST(request:Request){try{
 const body=await readBody(request);const{authorized,supabase,status}=await requireAdmin();if(!authorized)throw new HttpError('Owner access required.',status);
 if(body.action==='create_quote'){
 if(!uuid.test(String(body.customer_id))||!/^\d{4}-\d{2}-\d{2}$/.test(String(body.valid_until))||!Number.isFinite(Date.parse(String(body.valid_until)))||!Array.isArray(body.items)||body.items.length<1||body.items.length>100)throw new HttpError('Choose a customer, a valid date and quotation items.');
 const vat=Number(body.vat);if(body.vat===''||!Number.isFinite(vat)||vat<0||vat>100)throw new HttpError('Enter a VAT rate between 0 and 100.');
 const items=validation(()=> (body.items as Row[]).map(item=>{const quantity=Number(item.quantity);if(!Number.isFinite(quantity)||quantity<=0||quantity>1000000||typeof item.description!=='string'||!item.description.trim()||item.description.length>1000||!['sqm','pack','item'].includes(String(item.unit)))throw new Error('Check each item description, quantity and unit.');return {description:item.description.trim(),quantity,unit:item.unit,unit_price_pence:moneyToPence(item.price)};}));
 const delivery=validation(()=>moneyToPence(body.delivery||0)),discount=validation(()=>moneyToPence(body.discount||0));
 if(items.reduce((sum,i)=>sum+Math.round(i.quantity*i.unit_price_pence),0)+delivery<discount)throw new HttpError('Discount exceeds the quotation value.');
 const{data,error}=await supabase.rpc('create_owner_quote',{payload:{customer_id:body.customer_id,valid_until:body.valid_until,items,delivery_pence:delivery,discount_pence:discount,vat_basis_points:Math.round(vat*100),notes:String(body.notes||'').slice(0,10000)}});if(error)throw error;
 return Response.json({id:data},{headers});
 }
 if(!uuid.test(String(body.id)))throw new HttpError('Invalid document.');
 if(body.action==='create_invoice'){
 const{data,error}=await supabase.rpc('invoice_from_quote',{quote_id:body.id});if(error)throw error;return Response.json({id:data},{headers});}
 const actions:Record<string,{table:string;status:string;from:string[]}>={mark_sent:{table:'quotations',status:'sent',from:['draft']},accept_quote:{table:'quotations',status:'accepted',from:['draft','sent']},issue_invoice:{table:'invoices',status:'issued',from:['draft']}};
 const action=actions[String(body.action)];if(!action)throw new HttpError('Choose a valid document action.');
 const{data,error}=await supabase.from(action.table).update({status:action.status}).eq('id',body.id).in('status',action.from).select('id').single();if(error)throw error;
 return Response.json({id:data.id},{headers});
 }catch(error){return failure(error);}}
