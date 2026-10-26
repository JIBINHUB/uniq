import { serverSupabase } from "@/lib/supabase/server";
const headers={"Cache-Control":"private, no-store"};
export async function POST(request:Request){
 try{
  const origin=request.headers.get("origin");
  if(!origin||new URL(origin).host!==(request.headers.get("host")||new URL(request.url).host))return Response.json({error:"Invalid request origin."},{status:403,headers});
  const supabase=await serverSupabase(true);
  const{data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user?.email||!user.email_confirmed_at)return Response.json({error:"Verify your email and sign in before submitting your application."},{status:401,headers});
  const text=await request.text();if(text.length>8000)return Response.json({error:"Request too large."},{status:413,headers});
  const body=JSON.parse(text);
  const required=["business_name","contact_name","phone","business_type","address","city","postcode"];
  for(const key of required)if(typeof body[key]!=="string"||body[key].trim().length<2||body[key].length>300)return Response.json({error:"Please complete all business details."},{status:400,headers});
  if(typeof body.idempotency_key!=="string"||!/^[a-f0-9-]{36}$/i.test(body.idempotency_key)||body.consent!==true)return Response.json({error:"Confirm your details and consent."},{status:400,headers});
  if(!/^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i.test(body.postcode.trim()))return Response.json({error:"Enter a valid UK postcode."},{status:400,headers});
  const{data:existing,error:lookupError}=await supabase.from("retailer_applications").select("id,status").eq("user_id",user.id).order("created_at",{ascending:false}).limit(1).maybeSingle();
  if(lookupError)throw lookupError;
  if(existing)return Response.json({application:existing,alreadySubmitted:true},{headers});
  const payload=Object.fromEntries(required.map(key=>[key,body[key].trim()]));
  const{data,error}=await supabase.from("retailer_applications").insert({...payload,user_id:user.id,email:user.email,status:"pending",vat_number:typeof body.vat_number==="string"?body.vat_number.trim().slice(0,40):null,idempotency_key:body.idempotency_key}).select("id,status").single();
  if(error)throw error;
  return Response.json({application:data},{status:201,headers});
 }catch{return Response.json({error:"Your application could not be saved. Please try again."},{status:503,headers});}
}
