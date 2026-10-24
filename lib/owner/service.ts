import 'server-only';
import {createHash} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {supabaseConfig} from '@/lib/supabase/config';
export function hasOwnerService(){return !!(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY);}
export function ownerService(){const secret=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;if(!secret)throw new Error('Owner backend credential is not configured.');return createClient(supabaseConfig().url,secret,{auth:{persistSession:false,autoRefreshToken:false}});}

export async function checkOwnerSession(token:string){const {data,error}=await ownerService().rpc("owner_session",{action:"verify",session_hash:createHash("sha256").update(token).digest("hex")});return !error&&data===true;}
