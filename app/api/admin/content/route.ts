import {requireAdmin} from '@/lib/supabase/server';
import {privateHeaders as headers,readBody,HttpError,failure,validation} from '@/lib/owner/http';
import {validateContent} from '@/lib/owner/validation';
export async function POST(request:Request){try{
 const body=await readBody(request);const {supabase,authorized,status}=await requireAdmin();if(!authorized)throw new HttpError('Owner access required.',status);
 const key=String(body.key);if(!['hero','promotions'].includes(key))throw new HttpError('Unknown website section.');
 const content=validation(()=>validateContent(key,body.content as Record<string,unknown>));
 const record:Record<string,unknown>={key,draft:content};
 if(body.publish===true){record.published=content;record.published_at=new Date().toISOString();}
 const {error}=await supabase.from('site_content').upsert(record,{onConflict:'key'});if(error)throw error;
 return Response.json({saved:true,published:body.publish===true},{headers});
 }catch(error){return failure(error);}}
