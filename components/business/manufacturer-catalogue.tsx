"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, MessageCircle, Search } from "lucide-react";
import { useStoreData } from "./store-data";
import { catalogueStoreBrand } from "@/lib/catalogue/data";
import { materialIllustration } from "@/lib/catalogue/types";
import { parseMaterialSelection, selectionStorageKey, type MaterialSelection } from "@/lib/catalogue/selection";
import { selectionWhatsAppHref } from "@/lib/business/whatsapp";


export function ManufacturerCatalogue({ channel = "customer", businessName, materialOnly }: { channel?: "customer" | "retailer"; businessName?: string; materialOnly?: "carpet" }) {
  const { ranges: manufacturerProducts, selectionWhatsAppHref } = useStoreData();
  const variants = new Map(manufacturerProducts.flatMap(product => product.variants.map(variant => [variant.id, { product, variant }] as const)));
  const [material, setMaterial] = useState(materialOnly || "all");
  const [collection, setCollection] = useState("all");
  const [search, setSearch] = useState("");
  const [colour, setColour] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedColours, setSelectedColours] = useState<Record<string,string>>({});
  const [selection, setSelection] = useState<MaterialSelection[]>([]);
  useEffect(() => { try { setSelection(parseMaterialSelection(localStorage.getItem(selectionStorageKey(channel)), new Set(variants.keys()))); } catch {} }, [channel]);
  const visible = manufacturerProducts.filter(product => (!materialOnly || product.category === materialOnly) && (material === "all" || product.category === material) && (collection === "all" || product.collection === collection) && product.variants.some(variant => (colour === "all" || variant.name === colour) && `${product.name} ${product.collection} ${variant.name}`.toLowerCase().includes(search.toLowerCase())));
  const pages = Math.ceil(visible.length / 12);
  const currentPage = Math.min(page, Math.max(0,pages-1));
  const scopedProducts = manufacturerProducts.filter(product => !materialOnly || product.category === materialOnly);
  const collections = [...new Set(scopedProducts.map(product=>product.collection).filter(Boolean))];
  const colours = [...new Set(scopedProducts.flatMap(product=>product.variants.map(variant=>variant.name)))].sort();
  const selected = selection.flatMap(item => { const record = variants.get(item.id); return record ? [{...record,area:item.area,width:item.width}] : []; });
  const whatsapp = selectionWhatsAppHref(channel, selected.map(item=>({name:`${catalogueStoreBrand} ${item.product.collection} ${item.product.name}${item.width && item.variant.widths.includes(item.width) ? ` · ${item.width} m width` : ""}`.replace(/\s+/g," "),colour:`${item.variant.name} (${item.variant.colourCode})`,quantity:item.area,unit:"m²"})), businessName);
  function remove(id: string) { const next=selection.filter(item=>item.id!==id);setSelection(next);try{localStorage.setItem(selectionStorageKey(channel),JSON.stringify(next));}catch{} }
  return <section className={`manufacturer-catalogue${channel === "customer" && !materialOnly ? " is-shop-collection" : ""}`} id="manufacturer-collection"><div className="manufacturer-heading"><div><p className="eyebrow">THE UNIQ FLOORS COLLECTION</p><h2>{materialOnly ? "Carpets with character." : <>More textures.<br/>More possibilities.</>}</h2><p>{materialOnly ? "Explore carpet ranges and choose the colour that feels right at home." : "Explore luxury vinyl and carpet ranges, then choose your colour."}</p></div><span>{scopedProducts.length} ranges · {scopedProducts.reduce((sum,product)=>sum+product.variants.length,0)} colour options</span></div>
    {!materialOnly && <div className="manufacturer-tabs" role="group" aria-label="Manufacturer material"><button className={material==="all"?"active":""} onClick={()=>{setMaterial("all");setPage(0);}}>All ranges</button><button className={material==="lvt"?"active":""} onClick={()=>{setMaterial("lvt");setPage(0);}}>Luxury vinyl</button><button className={material==="carpet"?"active":""} onClick={()=>{setMaterial("carpet");setPage(0);}}>Carpet</button></div>}
    <div className="manufacturer-filters"><label><Search size={17}/><input aria-label="Search manufacturer ranges" placeholder="Find a range or colour" value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}}/></label><label>Collection<select value={collection} onChange={e=>{setCollection(e.target.value);setPage(0);}}><option value="all">All collections</option>{collections.map(value=><option key={value}>{value}</option>)}</select></label><label>Colour<select value={colour} onChange={e=>{setColour(e.target.value);setPage(0);}}><option value="all">All colours</option>{colours.map(value=><option key={value}>{value}</option>)}</select></label></div>
    <p className="manufacturer-image-note">Original material illustrations, not photographs of the named products. Colours and textures must be checked with a genuine sample.</p><p className="manufacturer-count">{visible.length} matching ranges</p>
    <div className="manufacturer-grid">{visible.slice(currentPage*12,currentPage*12+12).map(product=>{ const choices=product.variants.filter(variant=>colour==="all"||variant.name===colour); const variant=choices.find(item=>item.id===selectedColours[product.slug])||choices[0]; return <article className="manufacturer-card" key={product.slug}><Link href={`${channel==="retailer"?"/retailers/flooring":"/flooring"}/${product.slug}?colour=${encodeURIComponent(variant.id)}`} className="manufacturer-image"><img src={materialIllustration(product,variant.name)} alt={`Illustrative ${product.category==="carpet"?"carpet":"luxury vinyl"} material; not a photograph of ${product.name}`} loading="lazy"/><span>{product.category==="carpet"?"Carpet":product.collection||"Luxury vinyl"}</span><small>Material illustration</small></Link><div><p className="eyebrow">{catalogueStoreBrand} {product.collection}</p><h3>{product.name}</h3><label>Choose colour<select aria-label={`${product.name} colour`} value={variant.id} onChange={e=>setSelectedColours(current=>({...current,[product.slug]:e.target.value}))}>{choices.map(item=><option value={item.id} key={item.id}>{item.name} · {item.colourCode}</option>)}</select></label><p className="manufacturer-card-spec">{variant.dimensions || (variant.widths.length?`${variant.widths.join(" / ")} m widths`:"Ask our team for sizing")}</p><Link className="manufacturer-view" href={`${channel==="retailer"?"/retailers/flooring":"/flooring"}/${product.slug}?colour=${encodeURIComponent(variant.id)}`}>View floor & specifications <ArrowUpRight size={17}/></Link></div></article>;})}</div>
    {!visible.length&&<p className="trade-empty">No matching ranges. Try another material, collection or colour.</p>}
    {pages>1&&<nav className="manufacturer-pagination" aria-label="Catalogue pages"><button disabled={currentPage===0} onClick={()=>setPage(currentPage-1)}>Previous</button><span>Page {currentPage+1} of {pages}</span><button disabled={currentPage>=pages-1} onClick={()=>setPage(currentPage+1)}>Next</button></nav>}
    {selected.length>0&&<aside className="manufacturer-selection"><p className="eyebrow">YOUR {channel==="retailer"?"TRADE ":""}SELECTION</p><h3>Ready for a conversation.</h3><ul>{selected.map(item=><li key={item.variant.id}><span>{item.product.name} · {item.variant.name}</span><strong>{item.area} m²</strong><button onClick={()=>remove(item.variant.id)}>Remove</button></li>)}</ul><a className="retailer-button" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={19}/> Discuss selection on WhatsApp</a><p>Review and send your message. Our team confirms stock, price, delivery and payment.</p></aside>}
  </section>;
}
