import { cookies } from "next/headers";
import { localPreviewAllowed, samePreviewOrigin, previewCookie, previewToken, validPreviewToken, validPin } from "@/lib/business/owner-preview";
import { ownerSnapshot } from "@/lib/business/preview-snapshot";
const headers = { "Cache-Control": "private, no-store" };
const attempts = new Map<string,{count:number;expires:number}>();
export async function GET(request: Request) {
  if (!localPreviewAllowed(request)) return Response.json({error:"Local preview is unavailable."},{status:404,headers});
  if (!validPreviewToken((await cookies()).get(previewCookie)?.value))
    return Response.json({error:"Unlock the owner preview."},{status:401,headers});
  return Response.json({counts:ownerSnapshot.counts,verifiedAt:ownerSnapshot.verified_at,preview:true,products:[]},{headers});
}
export async function POST(request: Request) {
  if (!localPreviewAllowed(request)) return Response.json({error:"Local preview is unavailable."},{status:404,headers});
  if (!samePreviewOrigin(request)) return Response.json({error:"Invalid origin."},{status:403,headers});
  const key = "local-preview";
  const current = attempts.get(key);
  if(current && current.expires>Date.now() && current.count>=5)
    return Response.json({error:"Too many attempts. Please try again in ten minutes."},{status:429,headers});
  try {
    const text=await request.text();
    if(text.length>128) return Response.json({error:"Invalid PIN."},{status:400,headers});
    const {pin}=JSON.parse(text);
    if(!validPin(pin)) {
      attempts.set(key,{count: current && current.expires>Date.now() ? current.count+1:1,expires:current && current.expires>Date.now()?current.expires:Date.now()+600000});
      return Response.json({error:"Incorrect PIN. Please try again."},{status:401,headers});
    }
    attempts.delete(key);
    (await cookies()).set(previewCookie,previewToken(),{httpOnly:true,sameSite:"strict",path:"/api/owner-preview",maxAge:7200});
    return Response.json({unlocked:true},{headers});
  } catch { return Response.json({error:"Enter a valid four-digit PIN."},{status:400,headers}); }
}
export async function DELETE(request: Request) {
  if(!localPreviewAllowed(request) || !samePreviewOrigin(request))
    return Response.json({error:"Invalid request."},{status:403,headers});
  (await cookies()).set(previewCookie,"",{httpOnly:true,sameSite:"strict",path:"/api/owner-preview",maxAge:0});
  return Response.json({unlocked:false},{headers});
}
