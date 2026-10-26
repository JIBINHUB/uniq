import {serverSupabase} from '@/lib/supabase/server';
import {privateHeaders as headers,HttpError,readBody,failure} from '@/lib/owner/http';
export async function GET(){try{
 const client=await serverSupabase(true);const{data:{user},error}=await client.auth.getUser();if(error||!user?.email_confirmed_at)throw new HttpError('Verified sign-in required.',401);
 const[role,member]=await Promise.all([client.from('user_roles').select('role').eq('user_id',user.id).maybeSingle(),client.from('staff_members').select('access,enabled').eq('user_id',user.id).maybeSingle()]);
 const access=role.data?.role==='admin'?'owner':member.data?.enabled?member.data.access:null;
 if(!access)throw new HttpError('Staff approval required.',403);
 return Response.json({access},{headers});
 }catch(error){return failure(error);}}
export async function POST(request:Request){try{
 await readBody(request,1000);const client=await serverSupabase(true);const{data:{user},error}=await client.auth.getUser();if(error||!user?.email_confirmed_at)throw new HttpError('Verify your email before activating access.',401);
 const result=await client.rpc('claim_staff_access');if(result.error)throw new HttpError('This account has no active staff invitation.',403);
 return Response.json({access:result.data},{headers});
 }catch(error){return failure(error);}}
