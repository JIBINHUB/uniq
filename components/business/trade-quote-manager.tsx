'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, FileText, RefreshCw } from 'lucide-react';

type Line = { name: string; packs: number; coverage_sqm: number; estimated_total_pence: number };
type RequestRow = { id: string; business_name: string; items: Line[]; estimated_total_pence: number; status: string; review_notes: string; created_at: string };
const money = (pence: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100);

export function TradeQuoteManager({ preview }: { preview: boolean }) {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [filter, setFilter] = useState('open');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const load = useCallback(async () => {
    if (preview) return;
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/trade-quotes', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load trade requests.');
      setRows(data.requests || []);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load trade requests.'); }
    finally { setLoading(false); }
  }, [preview]);
  useEffect(() => { void load(); }, [load]);

  async function review(id: string, status: 'pending' | 'approved' | 'rejected') {
    setBusy(id); setError(''); setMessage('');
    try {
      const response = await fetch('/api/admin/trade-quotes', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, notes: notes[id] ?? rows.find(row => row.id === id)?.review_notes ?? '' }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to update request.');
      setRows(current => current.map(row => row.id === id ? { ...row, status: data.request.status, review_notes: data.request.review_notes } : row));
      setMessage(`Request ${id.slice(0, 8).toUpperCase()} marked ${status}.`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to update request.'); }
    finally { setBusy(''); }
  }
  const visible = rows.filter(row => filter === 'all' || (filter === 'open' ? ['new', 'pending'].includes(row.status) : row.status === filter));

  return <section className="ow-card ow-trade-quotes" aria-label="Retailer quotation requests">
    <div className="ow-card-heading"><div><p className="ow-kicker">RETAILER TRADE</p><h2>Quotation requests</h2><p>Selections saved by approved retailers. Review the estimate before agreeing stock, delivery or final price.</p></div><button className="ow-secondary" type="button" onClick={()=>void load()} disabled={loading || preview}><RefreshCw size={16}/>Refresh</button></div>
    <div className="ow-trade-filters"><label>Show <select value={filter} onChange={event=>setFilter(event.target.value)}><option value="open">New & pending</option><option value="all">All requests</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></label><span>{visible.length} shown · {rows.length} total</span></div>
    {preview ? <p className="ow-muted">Live retailer requests appear when the owner backend is activated.</p> : loading ? <p role="status">Loading trade requests…</p> : error ? <p role="alert" className="ow-trade-error">{error}</p> : visible.length ? <div className="ow-trade-list">{visible.map(row => <details key={row.id} className="ow-trade-request"><summary><span><FileText size={20}/><span><strong>{row.business_name}</strong><small>{row.id.slice(0, 8).toUpperCase()} · {new Date(row.created_at).toLocaleDateString('en-GB')}</small></span></span><span><b>{money(row.estimated_total_pence)}</b><em className={`ow-status state-${row.status}`}>{row.status}</em><ArrowUpRight size={16}/></span></summary><div className="ow-trade-detail"><ul>{row.items.map(item => <li key={item.name}><span>{item.name}</span><span>{item.packs} packs · {item.coverage_sqm.toFixed(2)} m²</span><strong>{money(item.estimated_total_pence)}</strong></li>)}</ul><label>Private review notes<textarea maxLength={4000} value={notes[row.id] ?? row.review_notes} onChange={event=>setNotes(current=>({...current,[row.id]:event.target.value}))}/></label><div className="ow-trade-actions">{(['pending','approved','rejected'] as const).map(status => <button type="button" key={status} className={status === 'approved' ? 'ow-primary' : 'ow-secondary'} disabled={busy === row.id} onClick={()=>void review(row.id,status)}>{status === 'pending' ? 'Mark pending' : status === 'approved' ? 'Approve estimate' : 'Reject request'}</button>)}</div></div></details>)}</div> : <p className="ow-muted">No quotation requests match this view.</p>}
    {message && <p role="status" className="ow-trade-success">{message}</p>}
    <p className="ow-muted">WhatsApp opens separately; it does not confirm a message was sent.</p>
  </section>;
}
