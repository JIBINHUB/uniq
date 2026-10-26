import { notFound } from "next/navigation";
import { storefrontData } from "@/lib/owner/catalogue";
import { Storefront } from "@/components/storefront";
import { products } from "@/lib/data";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let data = await storefrontData();
  if (!data.products.some(p => p.slug === slug)) data = await storefrontData('supabase');
  if (!data.products.some(p => p.slug === slug)) notFound();
  return <Storefront data={data} view="product" slug={slug} />;
}
