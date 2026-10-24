import {requireAdmin} from '@/lib/supabase/server';
import {privateHeaders as headers,HttpError,failure} from '@/lib/owner/http';
export const dynamic='force-dynamic';
export async function GET(){try{
 const {supabase,authorized,status,user}=await requireAdmin();if(!authorized)throw new HttpError('Owner access required.',status);
 const tables=['products','retailer_applications','enquiries','sample_requests','quotations','invoices','work_orders','customers','support_tickets'] as const;
 const counts=await Promise.all(tables.map(async table=>{const{count,error}=await supabase.from(table).select('*',{count:'exact',head:true});if(error)throw error;return[table,count||0];}));
 const [categories,content,settings,activity,retailers,stock,jobs]=await Promise.all([
 supabase.from('categories').select('*').order('name'),supabase.rpc('owner_content'),supabase.from('company_settings').select('*').single(),
 supabase.from('audit_log').select('id,entity,action,record_id,created_at').order('created_at',{ascending:false}).limit(12),
 supabase.from('retailer_applications').select('id,business_name,created_at').eq('status','pending').order('created_at').limit(5),
 supabase.from('products').select('id,name,stock_packs,reorder_level').eq('stock_confirmed',true).neq('status','archived'),
 supabase.from('work_orders').select('*').in('status',['scheduled','confirmed','in_progress']).order('scheduled_at').limit(5),
 ]);
 for(const result of [categories,content,settings,activity,retailers,stock,jobs])if(result.error)throw result.error;
 return Response.json({counts:Object.fromEntries(counts),categories:categories.data,content:content.data,settings:settings.data,activity:activity.data,pendingRetailers:retailers.data,lowStock:stock.data?.filter(p=>p.stock_packs<=p.reorder_level),jobs:jobs.data,user:{email:user?.email}},{headers});
 }catch(error){return failure(error);}}
