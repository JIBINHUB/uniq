'use client';
import {selectionWhatsAppHref as buildSelection,type FlooringSelection} from '@/lib/business/whatsapp';
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {products,categories,type Product,type Category} from '@/lib/data';
import {manufacturerProducts as ranges} from '@/lib/catalogue/data';
import type {ManufacturerProduct} from '@/lib/catalogue/types';
import {defaultContent,type Row} from '@/lib/owner/model';
export type StoreData={products:Product[];categories:Category[];ranges:ManufacturerProduct[];content:Record<string,Row>};
const Context=createContext<StoreData>({products,categories,ranges,content:defaultContent});
let liveSnapshot:StoreData|null=null;
let snapshotTime=0;
let liveRequest:Promise<StoreData|null>|null=null;
function refreshStoreData(){
 if(liveSnapshot&&Date.now()-snapshotTime<15000)return Promise.resolve(liveSnapshot);
 if(!liveRequest)liveRequest=fetch('/api/storefront-data').then(async response=>{
  if(!response.ok)throw Error('Storefront data unavailable');
  const next=await response.json() as StoreData;
  if(!Array.isArray(next.products)||!Array.isArray(next.categories)||!Array.isArray(next.ranges)||!next.content)throw Error('Invalid storefront data');
  liveSnapshot=next;snapshotTime=Date.now();return next;
 }).catch(()=>null).finally(()=>{liveRequest=null;});
 return liveRequest;
}
export function StoreDataProvider({data,children,live=false}:{data:StoreData;children:ReactNode;live?:boolean}){
 const [current,setCurrent]=useState(data);
 useEffect(()=>{
  setCurrent(data);
  if(!live)return;
  let active=true;
  void refreshStoreData().then(next=>{if(active&&next)setCurrent(next);});
  return()=>{active=false;};
 },[data,live]);
 return <Context.Provider value={current}>{children}</Context.Provider>;
}
export function useStoreData(){const data=useContext(Context);const business=data.content.business||{};
 const number=/^\d{8,15}$/.test(String(business.whatsapp_number))?String(business.whatsapp_number):'447938373500';
 const contacts={whatsappHref:`https://wa.me/${number}?text=${encodeURIComponent('Hello UNIQ FLOORS, I would like help choosing a floor.')}`,whatsappVideoHref:`https://wa.me/${number}?text=${encodeURIComponent('Hello UNIQ FLOORS, I would like a video call to discuss flooring.')}`,storeMapHref:business.address?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(business.address))}`:'https://maps.app.goo.gl/9UGg8bqyL8oJ6SocA'};
 return {...data,...contacts,selectionWhatsAppHref:(channel:'customer'|'retailer',items:FlooringSelection[],businessName?:string)=>buildSelection(channel,items,businessName,number),productBySlug:(slug?:string)=>data.products.find(p=>p.slug===slug)||data.products[0]||products[0],categoryById:(id?:string)=>data.categories.find(c=>c.id===id)||data.categories[0]||categories[0],productsByCategory:(id:string)=>data.products.filter(p=>p.category===id)};}
