import { storefrontData } from "@/lib/owner/catalogue";
import { StoreDataProvider } from "@/components/business/store-data";
import { notFound } from "next/navigation";
import { manufacturerProducts } from "@/lib/catalogue/data";
import { ManufacturerProductView } from "@/components/business/manufacturer-product";
import "../../retailers/retailers.css";
export default async function ManufacturerFloorPage({ params, searchParams }: { params: Promise<{slug:string}>; searchParams: Promise<{colour?:string}> }) {
  const { slug } = await params; const query=await searchParams;
  let data=await storefrontData();
  if(!data.ranges.some(item=>item.slug===slug))data=await storefrontData('supabase');
  const product=data.ranges.find(item=>item.slug===slug);
  if(!product||!product.variants.length)notFound();
  return <StoreDataProvider live data={data}><ManufacturerProductView product={product} initialColour={query.colour}/></StoreDataProvider>;
}
