import {requireAdmin} from '@/lib/supabase/server';
import {privateHeaders as headers,HttpError,failure} from '@/lib/owner/http';
export async function POST(request:Request){try{
 if(!request.headers.get('origin')||new URL(request.headers.get('origin')!).host!==(request.headers.get('host')||new URL(request.url).host))throw new HttpError('Invalid request origin.',403);
 const {supabase,authorized,status}=await requireAdmin();if(!authorized)throw new HttpError('Owner access required.',status);
 if(Number(request.headers.get('content-length'))>10500000)throw new HttpError('Maximum upload size is 10 MB.',413);
 const form=await request.formData(),file=form.get('file');
 const extensions:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/avif':'avif','video/mp4':'mp4'};
 if(!(file instanceof File)||!extensions[file.type]||file.size>10485760||file.size===0)throw new HttpError('Upload a JPG, PNG, WebP, AVIF or MP4 up to 10 MB.');
 const path=`${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${extensions[file.type]}`;
 const {error}=await supabase.storage.from('storefront-media').upload(path,file,{contentType:file.type,upsert:false});if(error)throw error;
 return Response.json({url:supabase.storage.from('storefront-media').getPublicUrl(path).data.publicUrl},{headers});
 }catch(error){return failure(error);}}
