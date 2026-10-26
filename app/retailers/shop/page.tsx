import { storefrontData } from "@/lib/owner/catalogue";
import { StoreDataProvider } from "@/components/business/store-data";
import type { Metadata } from "next";
import { RetailerCatalogue } from "@/components/business/retailer-catalogue";
import { retailerAccess } from "@/lib/supabase/retailer";
import "../retailers.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wholesale flooring shop | UNIQ FLOORS", robots: { index: false, follow: false } };

export default async function RetailerShopPage() {
  const quoteEnabled = process.env.TRADE_QUOTES_ENABLED === 'true';
  const data = await storefrontData();
  if (!quoteEnabled) return <StoreDataProvider live data={data}><RetailerCatalogue businessName="Guest trade customer" guest/></StoreDataProvider>;
  const access = await retailerAccess();
  const approved = access.state === 'approved' && access.quoteEligible;
  return <StoreDataProvider live data={data}><RetailerCatalogue businessName={approved ? access.businessName : "Guest trade customer"} guest={!approved} canRequestQuote={approved}/></StoreDataProvider>;
}
