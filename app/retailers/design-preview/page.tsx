import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { RetailerCatalogue } from "@/components/business/retailer-catalogue";
import "../retailers.css";
export const dynamic = "force-dynamic";
export const metadata = { title: "Local trade design preview | UNIQ FLOORS", robots: { index: false, follow: false } };
export default async function RetailerDesignPreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  const host = (await headers()).get("host")?.split(":")[0];
  if (host !== "localhost" && host !== "127.0.0.1") notFound();
  return <RetailerCatalogue businessName="Local design preview" designPreview/>;
}
