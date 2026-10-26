import {createHmac,randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
export const ownerCookie='uniq-owner-session';
export const ownerSessionSeconds=2*60*60;
export function hashPin(pin:string,salt=randomBytes(16).toString('hex')){return `${salt}:${scryptSync(pin,salt,32).toString('hex')}`;}
export function verifyPin(pin:unknown,encoded:string){if(typeof pin!=='string'||!/^\d{4}$/.test(pin))return false;const[salt,hash]=encoded.split(':');if(!salt||!/^[a-f0-9]{64}$/.test(hash||''))return false;return timingSafeEqual(scryptSync(pin,salt,32),Buffer.from(hash,'hex'));}
export function signOwnerSession(secret:string,mode:'live'|'preview',now=Date.now()){
 const payload=Buffer.from(JSON.stringify({expires:now+ownerSessionSeconds*1000,mode,nonce:randomBytes(24).toString('hex')})).toString('base64url');
 return payload+'.'+createHmac('sha256',secret).update(payload).digest('hex');
}
export function verifyOwnerSession(token:string|undefined,secret:string,now=Date.now()):'live'|'preview'|null{
 if(!token||!secret||token.length>600||token.split('.').length!==2)return null;const[payload,signature]=token.split('.');if(!payload||!/^[a-f0-9]{64}$/.test(signature||''))return null;
 const actual=createHmac('sha256',secret).update(payload).digest();if(!timingSafeEqual(actual,Buffer.from(signature,'hex')))return null;
 try{const data=JSON.parse(Buffer.from(payload,'base64url').toString());return data.expires>now&&data.expires<=now+ownerSessionSeconds*1000&&['live','preview'].includes(data.mode)?data.mode:null;}catch{return null;}
}
