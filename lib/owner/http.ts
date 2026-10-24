import 'server-only';
export const privateHeaders={'Cache-Control':'private, no-store','Vary':'Cookie','X-Content-Type-Options':'nosniff'};
export class HttpError extends Error {constructor(message:string,public status=400){super(message);}}
export async function readBody(request:Request,max=64000){
 const origin=request.headers.get('origin');
 if(!origin||new URL(origin).host!==(request.headers.get('host')||new URL(request.url).host))throw new HttpError('Invalid request origin.',403);
 if(!request.headers.get('content-type')?.includes('application/json'))throw new HttpError('JSON is required.',415);
 const body=await request.text();if(body.length>max)throw new HttpError('Request too large.',413);
 try{const data=JSON.parse(body);if(!data||Array.isArray(data)||typeof data!=='object')throw Error();return data as Record<string,unknown>;}catch{throw new HttpError('Invalid request body.');}
}
export function failure(error:unknown){return Response.json({error:error instanceof HttpError?error.message:'The change could not be completed. Please refresh and try again.'},{status:error instanceof HttpError?error.status:503,headers:privateHeaders});}
export function validation<T>(fn:()=>T):T {try{return fn();}catch(error){throw new HttpError(error instanceof Error?error.message:'Invalid details.');}}
