"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Boxes, LogOut, MessageCircle, Minus, PackageCheck, Plus, Search, ShoppingCart } from "lucide-react";
import { useStoreData } from "./store-data";
import { browserSupabase } from "@/lib/supabase/client";
import { calculateTradeLine, nextTradeTier, tradeTiers } from "@/lib/business/trade-pricing";
import { RetailerHeader, RetailerFooter } from "./retailer-shell";

const money = (pence: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);

export function RetailerCatalogue({ businessName, designPreview = false, guest = false, canRequestQuote = false }: { businessName: string; designPreview?: boolean; guest?: boolean; canRequestQuote?: boolean }) {
  const { products, categories, selectionWhatsAppHref } = useStoreData();
  const [category, setCategory] = useState("all");
  const [colour, setColour] = useState("all");
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [savedQuote, setSavedQuote] = useState<{ id: string; status: string } | null>(null);
  const quoteKey = useRef<string | null>(null);
  const colours = [...new Set(products.map(product => product.colour))];
  const visible = useMemo(() => products.filter(product => (category === "all" || product.category === category) && (colour === "all" || product.colour === colour) && `${product.name} ${product.colour} ${product.finish}`.toLowerCase().includes(search.toLowerCase())), [products, category, colour, search]);
  const selected = products.filter(product => selection[product.slug] > 0);
  const cartLines = selected.map(product => ({ product, pricing: calculateTradeLine(product.price, product.packCoverage || 2.2, selection[product.slug], product.size) }));
  const totals = cartLines.reduce((sum, line) => ({
    packs: sum.packs + line.pricing.packs,
    pieces: sum.pieces + (line.pricing.totalPieces || 0),
    hasMixedLengths: sum.hasMixedLengths || line.pricing.totalPieces === null,
    coverage: sum.coverage + line.pricing.totalCoverage,
    subtotal: sum.subtotal + line.pricing.subtotalPence,
    vat: sum.vat + line.pricing.vatPence,
    total: sum.total + line.pricing.totalPence,
  }), { packs: 0, pieces: 0, hasMixedLengths: false, coverage: 0, subtotal: 0, vat: 0, total: 0 });
  const whatsapp = selectionWhatsAppHref("retailer", cartLines.map(({ product, pricing }) => ({ name: `${product.name} · estimated ${money(pricing.totalPence)} inc VAT`, colour: product.colour, quantity: pricing.packs, unit: "packs" })), businessName);

  function change(slug: string, next: number) {
    setSavedQuote(null);
    quoteKey.current = null;
    setSelection(current => ({ ...current, [slug]: Math.min(999, Math.max(0, Math.floor(next) || 0)) }));
  }

  async function submitQuote() {
    if (!canRequestQuote || !cartLines.length || quoteBusy) return;
    setQuoteBusy(true);
    setMessage("");
    try {
      quoteKey.current ||= crypto.randomUUID();
      const response = await fetch('/api/retailer/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idempotency_key: quoteKey.current, items: cartLines.map(({ product, pricing }) => ({ slug: product.slug, packs: pricing.packs })) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Your request could not be saved.');
      setSavedQuote(result.request);
      setMessage('Quotation request saved. You can now share the selection on WhatsApp.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Please try again.'); }
    finally { setQuoteBusy(false); }
  }

  async function signOut() {
    setMessage("");
    const { error } = await browserSupabase().auth.signOut();
    if (error) { setMessage("Unable to sign out. Please try again."); return; }
    window.location.assign("/retailers");
  }

  return (
    <main className="retailer-page retailer-trade-shop">
      <RetailerHeader />
      {designPreview && <p className="trade-preview-label">Staff preview · wholesale shop · account records are hidden</p>}

      <section className="retailer-intro trade-intro">
        <p className="retailer-kicker">UNIQ FLOORS · WHOLESALE SHOP</p>
        <h1>Buy in bulk.<br />Pay less per piece.</h1>
        <p>{guest ? "Browse without an account." : `Welcome, ${businessName}.`} Build a project order with pack totals and automatic volume pricing. Every order is reviewed by our flooring team before payment.</p>
        {designPreview ? <Link className="retailer-outline" href="/retailers">Back to retailer entrance</Link> : guest ? <div className="trade-guest-actions"><Link className="retailer-outline" href="/retailers#retailer-access">Retailer sign in</Link><Link className="retailer-outline" href="/retailers/register">Open a free account</Link></div> : <div className="trade-guest-actions"><Link className="retailer-outline" href="/retailers/account">My requests</Link><button className="retailer-outline" onClick={signOut}><LogOut size={16} />Sign out</button></div>}
        <p role="status">{message}</p>
      </section>

      <section className="trade-impact-strip" aria-label="Wholesale price levels">
        {tradeTiers.map(tier => <article key={tier.label}><span>{tier.label.toUpperCase()} PRICE</span><strong>{tier.minimumPacks}+</strong><small>packs · save {Math.round(tier.discount * 100)}% before VAT</small></article>)}
      </section>

      <section className="trade-catalogue">
        <div className="trade-catalogue-heading">
          <div><p className="retailer-kicker">TRADE &amp; VOLUME PRICING</p><h2>Your wholesale floor shop.</h2></div>
          <span><PackageCheck size={17} /> {visible.length} products ready to order</span>
        </div>

        <div className="trade-filters">
          <label><Search size={17} /><input aria-label="Search wholesale flooring" placeholder="Search floors, colours or finishes" value={search} onChange={event => setSearch(event.target.value)} /></label>
          <label>Material<select value={category} onChange={event => setCategory(event.target.value)}><option value="all">All materials</option>{categories.map(item => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label>
          <label>Colour<select value={colour} onChange={event => setColour(event.target.value)}><option value="all">All colours</option>{colours.map(item => <option key={item}>{item}</option>)}</select></label>
        </div>

        <div className="trade-products">
          {visible.map(product => {
            const packs = selection[product.slug] || 0;
            const pricing = calculateTradeLine(product.price, product.packCoverage || 2.2, packs || 1, product.size);
            const nextTier = nextTradeTier(packs || 1);
            return <article className="trade-product wholesale-product" key={product.slug}>
              <div className="wholesale-product-image"><img src={product.image} alt={`${product.name} in ${product.colour}`} loading="lazy" /><span>{pricing.tier.label} · {Math.round(pricing.tier.discount * 100)}% off</span></div>
              <div>
                <p className="retailer-kicker">{categories.find(item => item.id === product.category)?.title}</p>
                <h3>{product.name}</h3>
                <p className="trade-colour">{product.colour} · {product.finish}</p>
                <div className="wholesale-price">
                  <strong>{money(pricing.piecePricePence ?? pricing.packPricePence)}<small>{pricing.piecePricePence === null ? " / pack ex VAT" : " / piece ex VAT"}</small></strong>
                  <span>{money(pricing.packPricePence)} per pack</span>
                </div>
                <dl className="wholesale-specs">
                  <div><dt>Pack</dt><dd>{pricing.piecesPerPack ? `${pricing.piecesPerPack} pieces` : "Mixed lengths"}</dd></div>
                  <div><dt>Coverage</dt><dd>{pricing.coverage.toFixed(2)} m²</dd></div>
                  <div><dt>Size</dt><dd>{product.size}</dd></div>
                </dl>
                <div className="wholesale-tiers">{tradeTiers.map(tier => <span className={pricing.tier.label === tier.label ? "active" : ""} key={tier.label}>{tier.minimumPacks}+ · -{Math.round(tier.discount * 100)}%</span>)}</div>
                <div className="trade-quantity">
                  <span><Boxes size={16} />Packs</span>
                  <button aria-label={`Remove a pack of ${product.name}`} onClick={() => change(product.slug, packs - 1)} disabled={!packs}><Minus size={16} /></button>
                  <output aria-label={`${product.name} selected packs`}>{packs}</output>
                  <button aria-label={`Add a pack of ${product.name}`} onClick={() => change(product.slug, packs + 1)} disabled={packs >= 999}><Plus size={16} /></button>
                </div>
                {packs > 0 && <div className="wholesale-line-total"><span>{pricing.totalCoverage.toFixed(2)} m² · {pricing.totalPieces ? `${pricing.totalPieces} pieces` : "mixed lengths"}</span><strong>{money(pricing.totalPence)} inc VAT</strong></div>}
                {nextTier && <p className="wholesale-next-tier">Add {nextTier.minimumPacks - (packs || 1)} more packs to unlock {nextTier.label.toLowerCase()} pricing.</p>}
              </div>
            </article>;
          })}
        </div>

        {!visible.length && <p className="trade-empty">No floors match those filters. Try another material or colour.</p>}

        <aside className="trade-selection wholesale-basket">
          <div className="wholesale-basket-heading"><span><ShoppingCart size={22} /></span><div><p className="retailer-kicker">YOUR WHOLESALE ORDER</p><h2>{selected.length ? `${selected.length} product${selected.length === 1 ? "" : "s"} selected` : "Your order starts here."}</h2></div></div>
          {cartLines.length > 0 ? <>
            <ul>{cartLines.map(({ product, pricing }) => <li key={product.slug}><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{pricing.packs} packs · {pricing.totalPieces ? `${pricing.totalPieces} pieces` : "mixed lengths"} · {pricing.totalCoverage.toFixed(2)} m²</small></span><b>{money(pricing.totalPence)}</b><button onClick={() => change(product.slug, 0)} aria-label={`Remove ${product.name} from wholesale order`}>Remove</button></li>)}</ul>
            <dl className="wholesale-totals"><div><dt>Products</dt><dd>{totals.packs} packs{totals.pieces ? ` · ${totals.pieces} fixed pieces${totals.hasMixedLengths ? " + mixed lengths" : ""}` : " · mixed lengths"}</dd></div><div><dt>Total coverage</dt><dd>{totals.coverage.toFixed(2)} m²</dd></div><div><dt>Subtotal</dt><dd>{money(totals.subtotal)}</dd></div><div><dt>VAT</dt><dd>{money(totals.vat)}</dd></div><div><dt>Estimated total</dt><dd>{money(totals.total)}</dd></div></dl>
            {canRequestQuote && !designPreview && <button className="retailer-button" type="button" disabled={quoteBusy || !!savedQuote} onClick={()=>void submitQuote()}><ShoppingCart size={19}/>{quoteBusy ? 'Saving request…' : savedQuote ? 'Request saved' : 'Save quotation request'}<ArrowUpRight size={17}/></button>}
            {savedQuote && <p className="wholesale-order-note">Request reference: <strong>{savedQuote.id.slice(0, 8).toUpperCase()}</strong> · {savedQuote.status}. <Link href="/retailers/account">Track this request</Link></p>}
            {(!canRequestQuote || savedQuote) && <a className="retailer-button" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={19} />Discuss selection on WhatsApp <ArrowUpRight size={17} /></a>}
            <p className="wholesale-order-note" role="status">{message}</p>
            <p className="wholesale-order-note">Stock, delivery and final trade pricing are confirmed by the team before payment. This estimate does not place or charge an order. Opening WhatsApp does not confirm that a message was sent.{guest ? " Sign in with an approved account to save and track a quotation request." : ""}</p>
          </> : <div className="wholesale-empty"><Boxes size={35} /><p>Add packs from the products above. Your piece price automatically drops when you reach a bulk tier.</p></div>}
        </aside>
      </section>
      <RetailerFooter />
    </main>
  );
}
