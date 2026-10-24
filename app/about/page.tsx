import { storefrontData } from "@/lib/owner/catalogue";
import { Storefront } from "@/components/storefront";

export default async function AboutPage() {
  return <Storefront data={await storefrontData()} view="about" />;
}
