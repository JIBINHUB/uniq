import Link from "next/link";
import { UserRound } from "lucide-react";
export function RetailerHeader({ active = "retailers", compact = false }: { active?: "shop" | "retailers"; compact?: boolean }) {
  if (compact) return <header className="manufacturer-detail-header"><Link className="manufacturer-back" href={active==="retailers"?"/retailers/catalogue":"/shop"}>← Back to {active==="retailers"?"trade catalogue":"shop"}</Link><Link className="retailer-outline" href="/account" aria-label="Account"><UserRound size={17}/> Account</Link></header>;
  return <header><Link className="retailer-brand" href="/"><img src="/assets/brand/uniq-header-logo.png" alt="UNIQ FLOORS"/></Link><nav aria-label="Flooring navigation"><Link href="/">Home</Link><Link className={active==="shop"?"active":""} href="/shop">Shop</Link><Link className={active==="retailers"?"active":""} href="/retailers">Retailers</Link><Link href="/guides">Guides</Link><Link href="/account" aria-label="Account"><UserRound size={19}/></Link></nav></header>;
}
export function RetailerFooter() {
  return <footer><Link className="retailer-brand" href="/">UNIQ FLOORS</Link><p>Floors for your home. A dedicated space for your business.</p><Link href="/shop">Customer shop</Link><Link href="/retailers">Retailer access</Link></footer>;
}
