'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Clock3, FileText, PackageCheck } from 'lucide-react';
import { RetailerHeader, RetailerFooter } from './retailer-shell';

type RequestRow = { id: string; created_at: string; status: string; estimated_total_pence: number; review_notes: string; items: { name: string; packs: number }[] };
const money = (pence: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100);

export function RetailerAccount({ businessName }: { businessName: string }) {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/retailer/quotes', { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Unable to load requests.');
        setRows(body.requests || []);
      }).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Unable to load requests.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return <main className="retailer-page trade-account-page"><RetailerHeader />
    <section className="trade-account-intro"><p className="retailer-kicker">MY UNIQ FLOORS · TRADE</p><h1>Your projects,<br />clearly in view.</h1><p>Welcome back, {businessName}. Keep track of the flooring selections you have sent to our team.</p><Link className="retailer-button" href="/retailers/shop">Build a new request <ArrowUpRight size={17}/></Link></section>
    <section className="trade-account-content" aria-label="Quotation request history"><div className="trade-account-heading"><div><p className="retailer-kicker">YOUR REQUESTS</p><h2>Quotation history.</h2></div><span><FileText size={18}/>{rows.length} requests</span></div>
      {loading ? <p role="status">Loading your requests…</p> : error ? <p role="alert">{error}</p> : rows.length ? <div className="trade-account-list">{rows.map(row => <article key={row.id} className="trade-account-row"><div className="trade-account-row-icon"><PackageCheck size={24}/></div><div><small>REQUEST {row.id.slice(0,8).toUpperCase()} · {new Date(row.created_at).toLocaleDateString('en-GB')}</small><h3>{row.items.map(item => item.name).join(', ')}</h3><p>{row.items.reduce((sum, item) => sum + item.packs, 0)} packs · Estimate {money(row.estimated_total_pence)} inc VAT</p>{row.review_notes && <p className="trade-account-note">Team note: {row.review_notes}</p>}</div><span className={`trade-account-status status-${row.status}`}>{row.status}</span></article>)}</div> : <div className="trade-account-empty"><Clock3 size={36}/><h3>Ready when you are.</h3><p>Your saved quotation requests will appear here once you select floors and send a request.</p><Link className="retailer-outline" href="/retailers/shop">Explore wholesale floors <ArrowUpRight size={16}/></Link></div>}
      <p className="trade-account-disclaimer">A quotation request is not an order. Final stock, delivery and price are confirmed by the UNIQ FLOORS team.</p>
    </section><RetailerFooter /></main>;
}
