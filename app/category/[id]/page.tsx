import { storefrontData } from "@/lib/owner/catalogue";
import { Storefront } from "@/components/storefront";
import { categories } from "@/lib/data";

export function generateStaticParams() {
  return categories.map((category) => ({ id: category.id }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Storefront data={await storefrontData()} view="category" id={id} />;
}
