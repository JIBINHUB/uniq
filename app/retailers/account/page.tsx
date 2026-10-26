import type { Metadata } from 'next';
import Link from 'next/link';
import { retailerAccess } from '@/lib/supabase/retailer';
import { RetailerAccount } from '@/components/business/retailer-account';
import { RetailerHeader, RetailerFooter } from '@/components/business/retailer-shell';
import '../retailers.css';
import './retailer-account.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Retailer requests | UNIQ FLOORS', robots: { index: false, follow: false } };

export default async function RetailerAccountPage() {
  const quoteEnabled = process.env.TRADE_QUOTES_ENABLED === 'true';
  const access = await retailerAccess();
  if (quoteEnabled && access.state === 'approved' && access.quoteEligible) return <RetailerAccount businessName={access.businessName} />;
  const unavailable = !quoteEnabled && access.state === 'approved';
  return <main className="retailer-page trade-account-page"><RetailerHeader /><section className="trade-account-intro"><p className="retailer-kicker">PRIVATE RETAILER SPACE</p><h1>{unavailable ? 'Requests are coming soon.' : access.state === 'approval' ? 'Your application is under review.' : 'Your trade space awaits.'}</h1><p>{unavailable ? 'Browse the wholesale collection and discuss a selection with our team on WhatsApp. Saved quotation history will appear when the secure service is activated.' : access.state === 'approval' ? 'You can browse the flooring range while your business application is reviewed. Approved accounts can save and track quotation requests here.' : 'Sign in with an approved retailer account to view your quotation requests and their progress.'}</p>{!unavailable && <Link className="retailer-button" href="/retailers#retailer-access">Retailer sign in</Link>}<Link className="retailer-outline" href="/retailers/shop">Browse floors</Link></section><RetailerFooter /></main>;
}
