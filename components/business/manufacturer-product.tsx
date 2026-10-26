"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, MessageCircle, Package, Ruler, ShieldCheck, SwatchBook } from "lucide-react";
import type { ManufacturerProduct } from "@/lib/catalogue/types";
import { materialIllustration } from "@/lib/catalogue/types";
import { catalogueStoreBrand, manufacturerProducts } from "@/lib/catalogue/data";
import { useStoreData } from "./store-data";
import { parseMaterialSelection, selectionStorageKey } from "@/lib/catalogue/selection";
import { selectionWhatsAppHref } from "@/lib/business/whatsapp";
import { RetailerHeader, RetailerFooter } from "./retailer-shell";



export function ManufacturerProductView({ product: initialProduct, initialColour, channel = "customer", businessName }: { product: ManufacturerProduct; initialColour?: string; channel?: "customer" | "retailer"; businessName?: string }) {
  const { products, ranges, selectionWhatsAppHref } = useStoreData();
  const product = ranges.find(item => item.slug === initialProduct.slug) || initialProduct;
  const validIds = new Set(ranges.flatMap(product => product.variants.map(variant => variant.id)));
  const [colourId, setColourId] = useState(initialColour || product.variants[0].id);
  const [area, setArea] = useState("20");
  const [width, setWidth] = useState("");
  const [message, setMessage] = useState("");
  const variant = product.variants.find(item => item.id === colourId) || product.variants[0];
  const currentIndex = product.variants.findIndex(item => item.id === variant.id);
  const validArea = Number.isFinite(Number(area)) && Number(area) > 0 && Number(area) <= 10000;
  const widthText = variant.widths.includes(Number(width)) ? ` · ${width} m width` : "";
  const name = `${catalogueStoreBrand} ${product.collection} ${product.name}${widthText}`.replace(/\s+/g, " ");
  const whatsapp = selectionWhatsAppHref(channel, [{ name, colour: `${variant.name} (${variant.colourCode})`, quantity: Number(area), unit: "m²" }], businessName);
  const sample = selectionWhatsAppHref(channel, [{ name, colour: `${variant.name} (${variant.colourCode})`, quantity: 1, unit: "samples" }], businessName);
  const feedbackHref = `https://api.whatsapp.com/send/?phone=447938373500&text=${encodeURIComponent(`Hello UNIQ FLOORS, I'd like to share feedback about ${product.name}.`)}&type=phone_number&app_absent=0`;
  const relatedProducts = channel === "customer" ? products.slice(0, 4) : [];

  function chooseColour(id: string) {
    setColourId(id);
    setWidth("");
    setMessage("");
  }

  function addToSelection() {
    if (!validArea) return;
    try {
      const key = selectionStorageKey(channel);
      const current = parseMaterialSelection(localStorage.getItem(key), validIds);
      const next = current.filter(item => item.id !== variant.id);
      if (next.length >= 30) {
        setMessage("Your selection already has 30 floors. Review it before adding another.");
        return;
      }
      next.push({ id: variant.id, area: Number(area), ...(variant.widths.includes(Number(width)) ? { width: Number(width) } : {}) });
      localStorage.setItem(key, JSON.stringify(next));
      setMessage("Added to your selection. Review it in the catalogue before sending your WhatsApp enquiry.");
    } catch {
      setMessage("This browser could not save your selection. You can still contact the team using WhatsApp below.");
    }
  }

  return <main className="retailer-page manufacturer-product-page frido-inspired-product">
    <RetailerHeader active={channel === "retailer" ? "retailers" : "shop"} compact />
    <div className="manufacturer-product-container">
      <div className="manufacturer-product-layout">
        <div className="manufacturer-product-gallery" aria-label="Flooring colour gallery">
          <div className="manufacturer-product-gallery-thumbs" role="group" aria-label="Preview colours">
            {product.variants.slice(0, 7).map(item => <button key={item.id} type="button" className={item.id === variant.id ? "active" : ""} onClick={() => chooseColour(item.id)} aria-label={`Preview ${item.name}`} aria-pressed={item.id === variant.id}>
              <img src={materialIllustration(product, item.name)} alt="" />
            </button>)}
          </div>
          <div className="manufacturer-product-visual">
            <img key={variant.id} src={materialIllustration(product, variant.name)} alt={`Original ${product.category === "carpet" ? "carpet" : "vinyl flooring"} material illustration for ${variant.name}; not an exact product photograph`} />
            <span className="manufacturer-visual-label">Illustrative material image · request a genuine sample</span>
            {product.variants.length > 1 && <div className="manufacturer-gallery-arrows">
              <button type="button" aria-label="Previous colour" onClick={() => chooseColour(product.variants[(currentIndex - 1 + product.variants.length) % product.variants.length].id)}><ArrowLeft size={19} /></button>
              <button type="button" aria-label="Next colour" onClick={() => chooseColour(product.variants[(currentIndex + 1) % product.variants.length].id)}><ArrowRight size={19} /></button>
            </div>}
          </div>
        </div>
        <section className="manufacturer-product-details" aria-labelledby="flooring-product-title">
          <p className="manufacturer-product-badge">{product.category === "carpet" ? "Carpet collection" : "Luxury vinyl flooring"}</p>
          <p className="manufacturer-product-brand">{catalogueStoreBrand} · {product.collection}</p>
          <h1 id="flooring-product-title">{product.name}</h1>
          <div className="manufacturer-price-panel"><span>Price on request</span><strong>Talk to our flooring team</strong><small>We confirm the current {channel === "retailer" ? "trade " : ""}price, stock and delivery for your chosen colour.</small></div>
          <div className="manufacturer-variant-picker">
            <div className="manufacturer-control-heading"><strong>Choose colour: <span>{variant.name}</span></strong><small>Code {variant.colourCode}</small></div>
            <div className="manufacturer-colour-swatches" role="group" aria-label="Choose a colour">
              {product.variants.map(item => <button type="button" key={item.id} className={item.id === variant.id ? "active" : ""} onClick={() => chooseColour(item.id)} aria-label={`${item.name}, colour ${item.colourCode}`} aria-pressed={item.id === variant.id} title={item.name}><img src={materialIllustration(product, item.name)} alt="" /></button>)}
            </div>
          </div>
          <div className="manufacturer-area-picker">
            <label htmlFor="manufacturer-floor-area">Floor area <span>m²</span></label>
            <div className="manufacturer-area-input"><Ruler size={18} /><input id="manufacturer-floor-area" type="number" min="0.1" max="10000" step="0.1" value={area} onChange={event => setArea(event.target.value)} aria-describedby="manufacturer-area-help" /><span>m²</span></div>
            <small id="manufacturer-area-help">An approximate measurement is enough to start your enquiry.</small>
          </div>
          {variant.widths.length > 0 && <div className="manufacturer-width-picker"><strong>Preferred carpet width</strong><div role="group" aria-label="Preferred carpet width"><button className={!width ? "active" : ""} type="button" onClick={() => setWidth("")}>Let us advise</button>{variant.widths.map(value => <button className={width === String(value) ? "active" : ""} type="button" onClick={() => setWidth(String(value))} key={value}>{value} m</button>)}</div></div>}
          <div className="manufacturer-order-actions">
            {validArea ? <a className="retailer-button manufacturer-main-cta" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={20} /><span>Enquire on WhatsApp<small>Get a confirmed quote from our team</small></span></a> : <span className="trade-disabled">Enter a valid floor area to continue</span>}
            <button className="retailer-outline" disabled={!validArea} onClick={addToSelection}><Package size={18} /> Add to selection</button>
          </div>
          <p className="retailer-form-message" role="status">{message}</p>
          <div className="manufacturer-service-row"><span><SwatchBook size={20} /> Genuine samples</span><span><Ruler size={20} /> Measuring advice</span><span><ShieldCheck size={20} /> Warranty details</span></div>
          <a className="manufacturer-sample" href={sample} target="_blank" rel="noopener noreferrer">Ask for a genuine colour sample <ArrowRight size={17} /></a>
          <p className="manufacturer-confirmation-note">Your WhatsApp message is an enquiry. The team confirms final quantities, price, stock, delivery and payment before you order.</p>
          <details className="manufacturer-detail-disclosure"><summary>Product information</summary><p>{product.category === "carpet" ? "Explore the carpet colour and width options, then ask for a genuine sample before ordering." : "Explore the available flooring colours, then ask for a genuine sample before ordering."}</p></details>
          <details className="manufacturer-detail-disclosure"><summary>Image and colour guidance</summary><p>The picture is an original AI material illustration. It does not represent this manufacturer&apos;s exact shade, grain, texture or backing.</p></details>
        </section>
      </div>
      <section className="manufacturer-specifications"><p className="eyebrow">PRODUCT DETAILS</p><h2>Everything you need to know.</h2><div className="manufacturer-spec-grid">{variant.specifications.map(item => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}{variant.warrantyYears.map(value => <div key={value}><span>Manufacturer warranty</span><strong>{value}</strong></div>)}{variant.bleachCleanable && <div><span>Manufacturer care claim</span><strong>Bleach cleanable · follow manufacturer instructions</strong></div>}</div>{product.category === "lvt" && <p className="manufacturer-source-note">The manufacturer describes this luxury vinyl material as waterproof. Confirm installation, subfloor and use requirements with our team; this does not guarantee waterproof installation.</p>}<p className="manufacturer-source-note">Warranty durations are manufacturer-stated and subject to their conditions and registration requirements. Our team will confirm the terms for your purchase.</p><a className="manufacturer-source-link" href={variant.sourceUrl} target="_blank" rel="noopener noreferrer">View manufacturer&apos;s product information <ArrowRight size={16} /></a></section>
      <section className="manufacturer-lower-section manufacturer-review-section" id="reviews"><div><p className="eyebrow">CUSTOMER REVIEWS</p><h2>What customers say</h2><p>Feedback helps others choose a floor with confidence.</p></div><div className="manufacturer-review-empty"><span aria-hidden="true">☆</span><div><h3>No published reviews yet</h3><p>Have this floor at home? Share your experience with our team. We review feedback before it appears here.</p></div><a href={feedbackHref} target="_blank" rel="noopener noreferrer">Share your review <ArrowRight size={16} /></a></div></section>
      <section className="manufacturer-lower-section manufacturer-faq-section"><div><p className="eyebrow">FLOORING HELP</p><h2>Questions before you order?</h2><p>Ask our team for a genuine sample and product-specific advice.</p></div><div className="manufacturer-faq-list"><details><summary>How do I confirm the colour?<span>+</span></summary><p>Request a genuine sample and compare it in your room in daylight and evening light. The illustration above is only a material preview.</p></details><details><summary>Is the price shown online?<span>+</span></summary><p>Our team confirms current price, stock and delivery after you send an enquiry with your colour and approximate area.</p></details><details><summary>What does the warranty cover?<span>+</span></summary><p>Warranty coverage depends on the chosen product and the manufacturer&apos;s terms. Ask us for the applicable documentation before ordering.</p></details></div></section>
      {relatedProducts.length > 0 && <section className="manufacturer-lower-section manufacturer-related-section"><p className="eyebrow">EXPLORE MORE FLOORS</p><h2>You may also like</h2><div className="manufacturer-related-grid">{relatedProducts.map(item => <a key={item.slug} href={`/product/${item.slug}`}><img src={item.image} alt={item.name} loading="lazy" /><span>{item.colour}</span><h3>{item.name}</h3><small>{item.finish} · {item.thickness}</small><b>View floor <ArrowRight size={16} /></b></a>)}</div></section>}
    </div>
    <RetailerFooter />
    {validArea && <a className="manufacturer-mobile-order" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Enquire on WhatsApp <ArrowRight size={18} /></a>}
  </main>;
}
