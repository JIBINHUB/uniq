import { storefrontData } from "@/lib/owner/catalogue";
import { StoreDataProvider } from "@/components/business/store-data";
import { notFound, redirect } from "next/navigation";
import { manufacturerProducts } from "@/lib/catalogue/data";
import { retailerAccess } from "@/lib/supabase/retailer";
import { ManufacturerProductView } from "@/components/business/manufacturer-product";
import "../../retailers.css";
export const dynamic="force-dynamic";
export const metadata={title:"Trade flooring | UNIQ FLOORS",robots:{index:false,follow:false}};
export default async function TradeManufacturerFloorPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{colour?:string}>}){
  const access=await retailerAccess();
  if(access.state!=="approved")redirect(access.state==="signin"?"/retailers":"/retailers/catalogue");
  const {slug}=await params;const query=await searchParams;
  let data=await storefrontData();
  if(!data.ranges.some(item=>item.slug===slug))data=await storefrontData('supabase');
  const product=data.ranges.find(item=>item.slug===slug);if(!product||!product.variants.length)notFound();
  return <StoreDataProvider live data={data}><ManufacturerProductView product={product} initialColour={query.colour} channel="retailer" businessName={access.businessName}/></StoreDataProvider>;
}
