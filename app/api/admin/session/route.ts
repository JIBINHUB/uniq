import {createHash} from 'node:crypto';
import {cookies} from 'next/headers';
import {ownerCookie,ownerSessionSeconds,verifyPin,signOwnerSession,verifyOwnerSession} from '@/lib/owner/pin';
import {hasOwnerService,ownerService,checkOwnerSession} from '@/lib/owner/service';
import {privateHeaders as headers,readBody,HttpError,failure} from '@/lib/owner/http';
import {storefrontData} from '@/lib/owner/catalogue';
export const dynamic='force-dynamic';
const attempts={count:0,expires:0};
function local(request:Request){return process.env.NODE_ENV==='development'&&['localhost','127.0.0.1','[::1]'].includes(new URL('http://'+(request.headers.get('host')||new URL(request.url).host)).hostname);}
export async function GET(request:Request){try{
 const mode=verifyOwnerSession((await cookies()).get(ownerCookie)?.value,process.env.OWNER_ACCESS_SECRET||'');if(!mode)throw new HttpError('Enter your owner PIN.',401);
 if(mode==='preview'){if(!local(request))throw new HttpError('Local preview unavailable.',403);const data=await storefrontData();return Response.json({mode,catalogue:data},{headers});}
 if(!await checkOwnerSession((await cookies()).get(ownerCookie)!.value))throw new HttpError('Your session has expired. Enter your PIN again.',401);
 return Response.json({mode},{headers});
 }catch(error){return failure(error);}}
export async function POST(request:Request){try{
 const body=await readBody(request,200);const hash=process.env.OWNER_ACCESS_PIN_HASH,secret=process.env.OWNER_ACCESS_SECRET;
 if(!hash||!secret)throw new HttpError('Owner access needs to be configured.',503);
 const live=hasOwnerService();
 if(!live&&!local(request))throw new HttpError('Owner backend setup is incomplete.',503);
 if(live){const{data,error}=await ownerService().rpc('owner_pin_attempt');if(error)throw new HttpError('Owner sign-in is unavailable until the database setup is complete.',503);if(data!==true)throw new HttpError('Too many attempts. Try again in ten minutes.',429);}
 else{if(attempts.expires<=Date.now()){attempts.count=0;attempts.expires=Date.now()+600000;}if(attempts.count>=5)throw new HttpError('Too many attempts. Try again in ten minutes.',429);attempts.count++;}
 if(!verifyPin(body.pin,hash))throw new HttpError('Incorrect PIN. Please try again.',401);
 if(live){const{error}=await ownerService().rpc('owner_pin_reset');if(error)throw error;}else attempts.count=0;
 const mode=live?'live':'preview';
 const token=signOwnerSession(secret,mode);
 if(live){const {data,error}=await ownerService().rpc('owner_session',{action:'create',session_hash:createHash('sha256').update(token).digest('hex'),expires:new Date(Date.now()+ownerSessionSeconds*1000).toISOString()});if(error||data!==true)throw new HttpError('Unable to create a secure session.',503);}
 (await cookies()).set(ownerCookie,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:ownerSessionSeconds});
 return Response.json({mode},{headers});
 }catch(error){return failure(error);}}
export async function DELETE(request:Request){try{await readBody(request,200);const token=(await cookies()).get(ownerCookie)?.value;if(token&&hasOwnerService()){const {error}=await ownerService().rpc('owner_session',{action:'revoke',session_hash:createHash('sha256').update(token).digest('hex')});if(error)throw error;}(await cookies()).set(ownerCookie,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:0});return Response.json({locked:true},{headers});}catch(error){return failure(error);}}
