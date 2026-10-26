import { storefrontData } from "@/lib/owner/catalogue";
import { StoreDataProvider } from "@/components/business/store-data";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ManufacturerCatalogue } from "@/components/business/manufacturer-catalogue";

export const metadata: Metadata = {
  title: "Carpets | UNIQ FLOORS",
  description: "Explore UNIQ FLOORS carpet ranges and find the right colour for your home.",
};

export default async function CarpetsPage() {
  return (
    <main className="carpets-page">
      <header className="carpets-page-header">
        <Link href="/shop"><ArrowLeft size={17} aria-hidden="true" /> Back to shop</Link>
        <img src="/assets/brand/uniq-header-logo.png" alt="UNIQ FLOORS" width={720} height={279} />
        <span>CARPET COLLECTION</span>
      </header>
      <StoreDataProvider live data={await storefrontData()}><ManufacturerCatalogue materialOnly="carpet" /></StoreDataProvider>
    </main>
  );
}
