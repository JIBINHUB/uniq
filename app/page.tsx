import { storefrontData } from "@/lib/owner/catalogue";
import { Storefront } from "@/components/storefront";

export default async function HomePage() {
  return <Storefront data={await storefrontData()} view="home" />;
}
