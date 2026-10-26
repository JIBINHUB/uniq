"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Box,
  Briefcase,
  Camera,
  CircleCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Droplets,
  Hammer,
  Heart,
  Home,
  Layers3,
  MapPin,
  MessageCircle,
  Package,
  PackageCheck,
  Palette,
  Phone,
  PoundSterling,
  RotateCcw,
  Ruler,
  ScanSearch,
  Search,
  Send,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Sofa,
  Star,
  Tags,
  Truck,
  Video,
  UserRound,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type TouchEvent } from "react";
import { StoreDataProvider, useStoreData, type StoreData } from "@/components/business/store-data";
import { defaultContent, defaultPromotions } from "@/lib/owner/model";
import { products as defaultProducts, categories as defaultCategories } from "@/lib/data";
import { manufacturerProducts as defaultRanges } from "@/lib/catalogue/data";
import { LiveRoomVisualizer } from "@/components/live-room-visualizer";
import { calculatePacks, lineTotalPence } from "@/lib/business/calculations";
import { selectionWhatsAppHref } from "@/lib/business/whatsapp";
import { ManufacturerCatalogue } from "@/components/business/manufacturer-catalogue";
import { RealHomesEditorial } from "@/components/real-homes-editorial";
import {
  money,
  rooms,
  type Product,
} from "@/lib/data";

type StorefrontProps =
  | { view: "home" | "rooms" | "guides" | "delivery" | "about" }
  | { view: "shop" }
  | { view: "category"; id?: string }
  | { view: "product"; slug?: string };

const filters = ["all", "oak", "waterproof", "click", "premium"];
const filterIcons: Record<string, IconName> = {
  all: "layers",
  oak: "palette",
  waterproof: "droplets",
  click: "wrench",
  premium: "shield",
};
const trustItems = [
  [
    "Price Match Guarantee",
    "Found the same floor cheaper? We will match it before you order.",
  ],
  [
    "Free Next Day Samples",
    "Try colour, texture and finish at home before buying full packs.",
  ],
  [
    "30-Day Returns",
    "A calmer decision window for unopened packs and accessories.",
  ],
  [
    "Flooring Experts",
    "Practical help with rooms, subfloors, trims and installation choices.",
  ],
];

const icons = {
  arrow: ArrowUpRight,
  badge: BadgeCheck,
  book: BookOpen,
  box: Box,
  briefcase: Briefcase,
  camera: Camera,
  care: ShieldCheck,
  cart: ShoppingCart,
  check: CircleCheck,
  delivery: Truck,
  droplets: Droplets,
  expert: ClipboardCheck,
  fit: Hammer,
  guide: BookOpen,
  heart: Heart,
  home: Home,
  install: Wrench,
  layers: Layers3,
  map: MapPin,
  message: MessageCircle,
  package: Package,
  palette: Palette,
  phone: Phone,
  price: PoundSterling,
  return: RotateCcw,
  room: Sofa,
  ruler: Ruler,
  sample: PackageCheck,
  scan: ScanSearch,
  search: Search,
  send: Send,
  shopping: ShoppingCart,
  shield: ShieldCheck,
  sliders: SlidersHorizontal,
  sparkles: BadgeCheck,
  star: Star,
  tags: Tags,
  truck: Truck,
  video: Video,
  wrench: Wrench,
  x: X,
} satisfies Record<string, LucideIcon>;

type IconName = keyof typeof icons;

const materialShowcase = [
  {
    id: "engineered",
    title: "Engineered Wood Flooring",
    label: "Layered real oak",
    short: "Stable construction with a real wood wear layer.",
    detail: "14-20 mm board",
    finish: "Brushed matt",
    bestFor: "Living spaces",
    character: "Natural oak grain",
    href: "/category/engineered",
    sample: "/assets/featured-planks/engineered.webp",
    tone: "#b7773a",
  },
  {
    id: "lvt",
    title: "Luxury Vinyl Tile",
    label: "Waterproof vinyl plank",
    short: "Soft underfoot, wipe-clean and ideal for busy rooms.",
    detail: "0.55 mm wear",
    finish: "Embossed grain",
    bestFor: "Busy family rooms",
    character: "Warm and practical",
    href: "/category/lvt",
    sample: "/assets/featured-planks/lvt.webp",
    tone: "#c98a43",
  },
  {
    id: "laminate",
    title: "Laminate Flooring",
    label: "Textured oak surface",
    short: "Durable, practical and sharp value for family spaces.",
    detail: "AC5 rated",
    finish: "Matt texture",
    bestFor: "Everyday spaces",
    character: "Clean oak texture",
    href: "/category/laminate",
    sample: "/assets/featured-planks/laminate.webp",
    tone: "#8d8980",
  },
  {
    id: "solid",
    title: "Solid Wood Flooring",
    label: "Full-depth hardwood",
    short: "Real timber weight with refinishable long-life depth.",
    detail: "18 mm timber",
    finish: "Natural oiled",
    bestFor: "Character homes",
    character: "Full timber depth",
    href: "/category/solid",
    sample: "/assets/featured-planks/solid.webp",
    tone: "#7a3518",
  },
  {
    id: "herringbone",
    title: "Herringbone and Parquet",
    label: "Single parquet block",
    short: "A single block sample that previews the pattern finish.",
    detail: "Click pattern",
    finish: "Honey oak",
    bestFor: "Feature rooms",
    character: "Patterned detail",
    href: "/category/herringbone",
    sample: "/assets/featured-planks/herringbone.webp",
    tone: "#d09249",
  },
  {
    id: "spc",
    title: "SPC Stone Effect Flooring",
    label: "Rigid stone tile",
    short: "Waterproof mineral texture with a stable rigid core.",
    detail: "6.5 mm core",
    finish: "Mineral matt",
    bestFor: "Kitchens and baths",
    character: "Soft stone texture",
    href: "/category/spc",
    sample: "/assets/featured-planks/spc.webp",
    tone: "#b8b0a3",
  },
];

function PremiumIcon({ name }: { name: IconName | string }) {
  const Icon = icons[name as IconName] ?? icons.check;
  return <Icon className="icon-svg" aria-hidden="true" strokeWidth={2.1} />;
}

function AnimatedMetric({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const [display, setDisplay] = useState<number | null>(null);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    let started = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      observer.disconnect();
      const start = performance.now();
      const duration = 1250;
      const animate = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Number((value * eased).toFixed(decimals)));
        if (progress < 1) frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
    }, { threshold: 0.35 });

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, decimals]);

  return <strong ref={elementRef} aria-label={`${value.toFixed(decimals)}${suffix}`}>
    <span aria-hidden="true">{display === null ? value.toFixed(decimals) : display.toFixed(decimals)}{suffix}</span>
  </strong>;
}

function WhatsAppMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="whatsapp-mark">
      <path fill="currentColor" d="M16.05 3A12.8 12.8 0 0 0 5.1 22.42L3 29l6.78-2.02A12.9 12.9 0 1 0 16.05 3Zm0 23.55a10.65 10.65 0 0 1-5.42-1.48l-.39-.23-4.02 1.2 1.23-3.91-.25-.4a10.58 10.58 0 1 1 8.85 4.82Zm5.84-7.95c-.32-.16-1.9-.94-2.2-1.05-.29-.11-.5-.16-.71.16-.21.32-.82 1.05-1 1.26-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.58a9.62 9.62 0 0 1-1.78-2.22c-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.08-1.11 2.64s1.14 3.06 1.3 3.27c.16.21 2.23 3.4 5.41 4.77.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.9-.77 2.17-1.52.26-.74.26-1.38.18-1.51-.08-.14-.29-.22-.61-.38Z" />
    </svg>
  );
}

function FlooringAdvisorMark() {
  return (
    <svg className="contact-guide-advisor-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path className="contact-guide-headset" d="M7.2 16.8v-2.2a8.8 8.8 0 0 1 17.6 0v2.2M7.2 17.1v4.1c0 1 .7 1.8 1.7 1.8h1.2v-7.6H8.9c-1 0-1.7.8-1.7 1.7ZM24.8 17.1v4.1c0 1-.7 1.8-1.7 1.8h-1.2v-7.6h1.2c1 0 1.7.8 1.7 1.7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.4 16.8c0 2.4 1.5 4.3 3.6 4.3s3.6-1.9 3.6-4.3M10.7 27.2c1-2.6 2.8-3.8 5.3-3.8s4.3 1.2 5.3 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path className="contact-guide-voice" d="M27.2 12.1c1.3 1 1.3 3.4 0 4.4M29.1 10.4c2.1 1.8 2.1 5.5 0 7.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FloatingContactButton() {
  const { whatsappHref, whatsappVideoHref } = useStoreData();
  const [open, setOpen] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (guideRef.current && !guideRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [open]);

  return (
    <div className="contact-guide" ref={guideRef}>
      {open && (
        <div className="contact-guide-panel" id="contact-guide-panel">
          <div className="contact-guide-panel-head">
            <span className="contact-guide-avatar" aria-hidden="true"><FlooringAdvisorMark /></span>
            <div>
              <strong>Let&apos;s find your floor.</strong>
            </div>
            <button type="button" className="contact-guide-close" aria-label="Close contact options" onClick={() => setOpen(false)}><X size={18} /></button>
          </div>
          <p>Talk through colours and samples with a real person, or visit us in store.</p>
          <a className="contact-guide-option is-primary" href={whatsappVideoHref} target="_blank" rel="noreferrer"><span className="contact-guide-option-icon"><Video size={18} /></span> Request a video call <ArrowUpRight size={16} /></a>
          <a className="contact-guide-option" href={whatsappHref} target="_blank" rel="noreferrer"><span className="contact-guide-option-icon"><WhatsAppMark /></span> Chat on WhatsApp <ArrowUpRight size={16} /></a>
          <a className="contact-guide-option" href={storeMapHref} target="_blank" rel="noreferrer"><span className="contact-guide-option-icon"><MapPin size={18} /></span> Visit our store <ArrowUpRight size={16} /></a>
        </div>
      )}
      <button className="contact-guide-launcher" type="button" aria-label="Talk to the UNIQ flooring team" aria-expanded={open} aria-controls={open ? "contact-guide-panel" : undefined} onClick={() => setOpen((current) => !current)}>
        <span className="contact-guide-launcher-avatar" aria-hidden="true"><MessageCircle size={20} strokeWidth={1.8} /><span className="contact-guide-presence" /></span>
        <span className="contact-guide-launcher-copy"><strong>Flooring advice</strong><small>Talk to our team</small></span>
        <ArrowUpRight className="contact-guide-launcher-arrow" size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

const whatsappHref =
  "https://wa.me/447938373500?text=Hello%20UNIQ%20FLOORS%2C%20I%20would%20like%20quick%20help%20choosing%20a%20floor.";
const whatsappVideoHref =
  "https://wa.me/447938373500?text=Hello%20UNIQ%20FLOORS%2C%20I%20would%20like%20a%20WhatsApp%20video%20call%20to%20help%20me%20choose%20the%20right%20floor.";
const storeMapHref = "https://maps.app.goo.gl/9UGg8bqyL8oJ6SocA";

type CartItem = { slug: string; quantity: number };

export function Storefront(props: StorefrontProps & { data?: StoreData }) {
  return <StoreDataProvider live data={props.data || {products:defaultProducts,categories:defaultCategories,ranges:defaultRanges,content:defaultContent}}><StorefrontView {...props}/></StoreDataProvider>;
}

function StorefrontView(props: StorefrontProps) {
  const pathname = usePathname();
  const [samples, setSamples] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [cartLaunched, setCartLaunched] = useState(false);
  const [ghostCart, setGhostCart] = useState<{
    x: number; y: number; toX: number; toY: number;
  } | null>(null);
  const [navCartReceiving, setNavCartReceiving] = useState(false);
  const headerScrolledRef = useRef(false);
  const cartLaunchedRef = useRef(false);
  const headerCartRef = useRef<HTMLButtonElement>(null);
  const navCartRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 80;
      if (scrolled !== headerScrolledRef.current) {
        headerScrolledRef.current = scrolled;
        setHeaderScrolled(scrolled);

        // One-shot: fire ghost cart fly the first time we scroll past threshold
        if (scrolled && !cartLaunchedRef.current) {
          cartLaunchedRef.current = true;
          setCartLaunched(true);

          // Measure positions and launch ghost
          const fromEl = headerCartRef.current;
          const toEl = navCartRef.current;
          if (fromEl && toEl) {
            const from = fromEl.getBoundingClientRect();
            const to = toEl.getBoundingClientRect();
            setGhostCart({
              x: from.left + from.width / 2,
              y: from.top + from.height / 2,
              toX: to.left + to.width / 2,
              toY: to.top + to.height / 2,
            });
            // After ghost animation lands, fire receive pulse
            setTimeout(() => {
              setGhostCart(null);
              setNavCartReceiving(true);
              setTimeout(() => setNavCartReceiving(false), 700);
            }, 820);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    try {
      setSamples(JSON.parse(localStorage.getItem("uniqSamples") || "[]"));
      setCartItems(JSON.parse(localStorage.getItem("uniqCart") || "[]"));
    } catch {
      setSamples([]);
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("uniqSamples", JSON.stringify(samples));
  }, [samples]);

  useEffect(() => {
    localStorage.setItem("uniqCart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function addSample(slug: string) {
    setSamples((current) =>
      current.includes(slug) ? current : [...current, slug],
    );
    setDrawerOpen(true);
  }

  function removeSample(slug: string) {
    setSamples((current) => current.filter((item) => item !== slug));
  }

  function addToCart(slug: string, quantity: number) {
    setCartItems((current) => {
      const existing = current.find((item) => item.slug === slug);
      if (existing) {
        return current.map((item) =>
          item.slug === slug
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...current, { slug, quantity }];
    });
    setDrawerOpen(true);
  }

  function removeCartItem(slug: string) {
    setCartItems((current) => current.filter((item) => item.slug !== slug));
  }

  function changeCartQuantity(slug: string, change: number) {
    setCartItems((current) => current
      .map((item) => item.slug === slug ? { ...item, quantity: item.quantity + change } : item)
      .filter((item) => item.quantity > 0));
  }

  const basketCount =
    samples.length + cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <div
        className={`page-shell ${props.view === "home" ? "home-shell" : "inner-shell"}`}
      >
        {props.view !== "product" ? <CommerceHeader headerScrolled={headerScrolled} /> : null}

        {/* Ghost cart: flies from header to nav */}
        {ghostCart && (
          <div
            className="cart-ghost"
            aria-hidden="true"
            style={{
              '--ghost-x': `${ghostCart.x}px`,
              '--ghost-y': `${ghostCart.y}px`,
              '--ghost-tx': `${ghostCart.toX - ghostCart.x}px`,
              '--ghost-ty': `${ghostCart.toY - ghostCart.y}px`,
            } as React.CSSProperties}
          >
            <ShoppingCart strokeWidth={2.2} />
          </div>
        )}

        {props.view !== "product" ? <SiteNav
          pathname={pathname}
          samplesCount={basketCount}
          cartLaunched={cartLaunched}
          navCartReceiving={navCartReceiving}
          navCartRef={navCartRef}
          onOpenSamples={() => setDrawerOpen(true)}
        /> : null}

        <main id="app" tabIndex={-1}>
          {props.view === "home" ? <HomeView addSample={addSample} /> : null}
          {props.view === "shop" ? <ShopView addToCart={addToCart} /> : null}
          {props.view === "category" ? (
            <CategoryView id={props.id} addSample={addSample} />
          ) : null}
          {props.view === "product" ? (
            <ProductView
              slug={props.slug}
              addSample={addSample}
              addToCart={addToCart}
            />
          ) : null}
          {props.view === "rooms" ? (
            <RoomsView addToCart={addToCart} />
          ) : null}
          {props.view === "guides" ? <GuidesView /> : null}
          {props.view === "delivery" ? <DeliveryView /> : null}
          {props.view === "about" ? <AboutPageView /> : null}
        </main>

        <Footer />
      </div>

      <FloatingContactButton />

      <SampleDrawer
        open={drawerOpen}
        samples={samples}
        cartItems={cartItems}
        onClose={() => setDrawerOpen(false)}
        onRemove={removeSample}
        onRemoveCart={removeCartItem}
        onChangeCartQuantity={changeCartQuantity}
      />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function SiteNav({
  pathname,
  samplesCount,
  cartLaunched,
  navCartReceiving,
  navCartRef,
  onOpenSamples,
}: {
  pathname: string;
  samplesCount: number;
  cartLaunched: boolean;
  navCartReceiving: boolean;
  navCartRef: React.RefObject<HTMLButtonElement | null>;
  onOpenSamples: () => void;
}) {
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const shopActive =
    pathname.startsWith("/shop") ||
    pathname.startsWith("/category") ||
    pathname.startsWith("/product");
  const items = [
    { label: "Home", href: "/", icon: "home" },
    { label: "Shop", href: "/shop", icon: "layers" },
    { label: "Retailers", href: "/retailers", icon: "briefcase" },
    { label: "Guides", href: "/guides", icon: "book" },
  ] satisfies Array<{ label: string; href: string; icon: IconName }>;

  const navRef = useRef<HTMLElement>(null);
  const slotRefs = useRef<Array<HTMLElement | null>>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const activeIndex = items.findIndex((item) => item.label === "Shop" ? shopActive : isActive(item.href));
  const targetIndex = hoveredIndex ?? activeIndex;

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const slot = slotRefs.current[targetIndex];
      if (slot) setPill({ left: slot.offsetLeft, width: slot.offsetWidth });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [targetIndex]);

  return (
    <nav
      ref={navRef}
      className="site-pill-nav"
      aria-label="Site navigation"
      onPointerLeave={() => setHoveredIndex(null)}
    >
      <span className="site-pill-nav-glide" style={{ left: pill.left, width: pill.width, opacity: targetIndex >= 0 ? 1 : 0 }} aria-hidden="true" />
      {items.map((item, index) => {
        const active = index === activeIndex;
        return (
          <Link
            ref={(element) => { slotRefs.current[index] = element; }}
            className={`site-pill-nav-item${index === targetIndex ? " is-highlighted" : ""}`}
            href={item.href}
            aria-current={active ? "page" : undefined}
            key={item.label}
            onPointerEnter={(event) => { if (event.pointerType !== "touch") setHoveredIndex(index); }}
            onFocus={() => setHoveredIndex(index)}
            onBlur={() => setHoveredIndex(null)}
          >
            <PremiumIcon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
      <button
        ref={navCartRef}
        type="button"
        aria-label={samplesCount ? `Open cart, ${samplesCount} items` : "Open cart"}
        onClick={onOpenSamples}
        onPointerEnter={() => setHoveredIndex(null)}
        className={[
          'site-pill-nav-cart',
          cartLaunched ? 'cart-entered' : '',
          navCartReceiving ? 'cart-receiving' : '',
        ].filter(Boolean).join(' ')}
      >
        <span className="site-pill-nav-cart-icon">
          <PremiumIcon name="cart" />
          {samplesCount ? <i>{samplesCount}</i> : null}
        </span>
      </button>
    </nav>
  );
}

function HomeView({ addSample }: { addSample: (slug: string) => void }) {
  const { products, categories, productBySlug, categoryById, productsByCategory, content, selectionWhatsAppHref, whatsappHref, whatsappVideoHref, storeMapHref } = useStoreData();
  const heroRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [heroVideoNear, setHeroVideoNear] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroVideoNear(entry.isIntersecting),
      { rootMargin: "280px 0px", threshold: 0 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video || !heroVideoNear) return;

    void video.play().catch(() => {
      // Muted inline playback may still be deferred by a device in low-power mode.
    });
    return () => video.pause();
  }, [heroVideoNear]);

  const sampleProducts = products.slice(0, 3);
  const roomPills = [
    ["Living Room", "/category/herringbone", "/assets/real/living-walnut.jpg"],
    ["Dining Room", "/category/solid", "/assets/real/dining-oak.jpg"],
    ["Kitchen", "/category/spc", "/assets/real/kitchen-oak.jpg"],
    ["Hallway", "/category/laminate", "/assets/real/hallway-oak.jpg"],
    ["Conservatory", "/category/engineered", "/assets/real/living-oak.jpg"],
    ["Bathroom", "/category/spc", "/assets/real/bath-wood.jpg"],
    ["Home Office", "/category/lvt", "/assets/real/office-oak.jpg"],
  ];

  return (
    <>
      <section ref={heroRef} className="hero aeline-hero">
        <div className="hero-depth-plane" aria-hidden="true">
          <img className="hero-fallback-image" src={String(content.hero.image)} alt="" />
          {heroVideoNear && content.hero.video ? (
            <video
              ref={heroVideoRef}
              className="hero-motion-video"
              src={String(content.hero.video)}
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : null}
        </div>
        <div className="hero-content">
          <h1 style={{whiteSpace:"pre-line"}}>{String(content.hero.title)}</h1>
          <p>
            {String(content.hero.description)}
          </p>
          <div className="hero-actions">
            <a className="hero-review-proof" href="#homes-editorial-title" aria-label="Rated 4.8 out of 5 by customers. Read customer stories">
              <span className="hero-review-stars" aria-hidden="true">
                {Array.from({ length: 5 }, (_, index) => <span key={index} style={{ "--star-index": index } as CSSProperties}>★</span>)}
              </span>
              <span className="hero-review-copy"><strong>4.8 <small>/ 5</small></strong><span>Customer rating <ArrowUpRight size={14} aria-hidden="true" /></span></span>
            </a>
          </div>
        </div>
        <HeroCarousel active={heroVideoNear} />
      </section>

      <PostHeroReference />

      <MaterialFinishShowcase />

      <RealHomesEditorial />

      <BeforeAfterComparison />

      <section className="section customer-matched-section" aria-labelledby="customer-story-title">
        <div className="about-editorial-inner">
          <div className="about-editorial-top">
            <div>
              <h2 id="customer-story-title">Chosen with confidence. Lived on beautifully.</h2>
            </div>
            <Link className="about-editorial-link" href="/shop">
              Discover floors <ArrowUpRight size={20} aria-hidden="true" />
            </Link>
          </div>
          <p className="customer-matched-intro">
            Samples that arrive quickly, advice that stays clear and floors that feel right long after fitting.
          </p>
          <div className="about-editorial-principles customer-matched-principles" aria-label="UNIQ Floors customer proof">
            <article>
              <h3><AnimatedMetric value={18} suffix="k+" /></h3>
              <p>Real flooring samples requested by UK homes.</p>
            </article>
            <article>
              <h3><AnimatedMetric value={4.8} decimals={1} suffix="/5" /></h3>
              <p>Average customer rating for product and service.</p>
            </article>
            <article>
              <h3><AnimatedMetric value={30} suffix=" days" /></h3>
              <p>Easy returns on unopened flooring packs.</p>
            </article>
          </div>
        </div>
      </section>

      <SampleBoxSection />
    </>
  );
}

function AboutPageView() {
  return (
    <>
      <section className="about-page-hero">
        <div className="about-page-hero-copy">
          <h1>Flooring, clearly chosen.</h1>
          <p>We help homes find floors with lasting character. Discover distinctive materials, picture them in real rooms and get practical advice before making your choice.</p>
          <Link href="/shop">Explore floors <ArrowUpRight size={19} aria-hidden="true" /></Link>
        </div>
        <div className="about-page-hero-image">
          <Image src="/assets/real/living-oak.jpg" alt="A warm living room with natural oak flooring" fill sizes="(max-width: 760px) 100vw, 50vw" />
        </div>
      </section>
      <AboutScrollReveal />
      <section className="about-page-next">
        <h2>See the finish in your space.</h2>
        <p>Compare colour and texture at home, then ask our team about your room, measurements or fitting plan.</p>
        <Link href="/category/engineered">Explore free samples <ArrowUpRight size={19} aria-hidden="true" /></Link>
      </section>
    </>
  );
}

function AboutScrollReveal() {
  return (
    <section className="section about-editorial-section" aria-labelledby="about-story-title">
      <div className="about-editorial-inner">
        <div className="about-editorial-top">
          <div>
            <h2 id="about-story-title">Better floors begin with a clearer choice.</h2>
          </div>
          <Link className="about-editorial-link" href="/about">About us <ArrowUpRight size={20} aria-hidden="true" /></Link>
        </div>
        <div className="about-editorial-principles">
          <article>
            <Layers3 aria-hidden="true" strokeWidth={1.5} />
            <h3>Materials with character</h3>
            <p>Real wood, considered patterns and practical finishes chosen for the way a room feels and works.</p>
          </article>
          <article>
            <Sofa aria-hidden="true" strokeWidth={1.5} />
            <h3>Made for real rooms</h3>
            <p>See finishes in lived-in spaces and compare samples in your own light before you decide.</p>
          </article>
          <article>
            <MessageCircle aria-hidden="true" strokeWidth={1.5} />
            <h3>Guidance that stays</h3>
            <p>Practical help with colour, quantities, fitting and delivery from the first sample onward.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function HeroCarousel({ active }: { active: boolean }) {
  const [activeGroup, setActiveGroup] = useState(0);
  const [animating, setAnimating] = useState(true);

  const { content } = useStoreData();
  const allSlides = (content.promotions.items || defaultPromotions) as Record<string, unknown>[];
  const now = Date.now();
  const adSlides = allSlides.filter(slide => slide.enabled && (!slide.starts_at || Date.parse(String(slide.starts_at)) <= now) && (!slide.ends_at || Date.parse(String(slide.ends_at)) > now)).map(slide => ({...slide, brand:String(slide.brand||''),title:String(slide.title),sub:String(slide.sub||''),desc:String(slide.desc||''),image:String(slide.image),href:String(slide.href),badge:String(slide.badge||''),bg:String(slide.colour)}));

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!active || !adSlides.length) return;

    const timer = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % adSlides.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [active, adSlides.length]);

  if (!adSlides.length) return null;
  return (
    <div className="hero-carousel" aria-label="Flooring promotions carousel">
      <div className="hc-window">
        <div
          className="hc-track banner-track"
          style={{ transform: activeIndex === 0 ? "translateX(0)" : `translateX(calc(-${activeIndex} * var(--card-step, 33.333%)))` }}
        >
          {adSlides.map((slide, gi) => (
            <Link className="hc-card banner-style" href={slide.href} key={slide.title} aria-hidden={activeIndex > gi + 2 || activeIndex < gi} style={{ background: slide.bg }}>
              <div className="hc-banner-content">
                <div className="hc-banner-brand">{slide.brand}</div>
                <h3 className="hc-banner-title">{slide.title}</h3>
                <p className="hc-banner-sub">{slide.sub}</p>
                <div className="hc-banner-desc">{slide.desc}</div>
                <div className="hc-banner-bank">
                  <span className="bank-tag">10% Instant Discount*</span>
                </div>
              </div>
              <div className="hc-banner-image">
                <img src={slide.image} alt={slide.title} />
              </div>
              <div className="hc-banner-badge">{slide.badge}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="hc-footer">
        <div className="hc-dots" role="tablist" aria-label="Carousel pages">
          {adSlides.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={activeIndex === i}
              className={activeIndex === i ? "active" : ""}
              onClick={() => setActiveIndex(i)}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
        <div className="hc-nav">
          <button
            className="hc-arrow"
            aria-label="Previous"
            onClick={() =>
              setActiveIndex((g) => (g - 1 + adSlides.length) % adSlides.length)
            }
          >
            ‹
          </button>
          <button
            className="hc-arrow"
            aria-label="Next"
            onClick={() => setActiveIndex((g) => (g + 1) % adSlides.length)}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

function MaterialFinishShowcase() {
  const { products } = useStoreData();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const swipeStartX = useRef<number | null>(null);
  const suppressClickAfterSwipe = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const floors = materialShowcase
    .map((material) => ({
      material,
      product: products
        .filter((product) => product.category === material.id)
        .sort((first, second) => Number(second.rating) - Number(first.rating))[0],
    }))
    .filter((floor): floor is { material: (typeof materialShowcase)[number]; product: Product } => Boolean(floor.product));
  const active = floors[activeIndex] ?? floors[0];

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  if (!active) return null;

  const showFloor = (index: number) => {
    const nextIndex = (index + floors.length) % floors.length;
    if (nextIndex === activeIndex) return;
    setActiveIndex(nextIndex);
  };

  const finishSwipe = (endX: number) => {
    if (swipeStartX.current === null) return;
    const distance = endX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(distance) < 42) return;
    suppressClickAfterSwipe.current = true;
    showFloor(activeIndex + (distance < 0 ? 1 : -1));
  };

  return (
    <section className="section category-section floor-editorial-section" aria-labelledby="floor-editorial-title">
      <div
        ref={stageRef}
        className={`floor-editorial-stage${isVisible ? " is-visible" : ""}`}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured flooring"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          showFloor(activeIndex + (event.key === "ArrowRight" ? 1 : -1));
        }}
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("a, .floor-editorial-controls")) return;
          suppressClickAfterSwipe.current = false;
          swipeStartX.current = event.clientX;
        }}
        onPointerUp={(event) => finishSwipe(event.clientX)}
        onPointerCancel={() => { swipeStartX.current = null; }}
      >
        <div className="floor-editorial-heading">
          <span className="floor-editorial-overline">THE UNIQ FLOOR EDIT <i /> {String(activeIndex + 1).padStart(2, "0")} of {String(floors.length).padStart(2, "0")}</span>
          <h2 id="floor-editorial-title" key={active.product.slug}>{active.product.colour || active.material.title}</h2>
        </div>

        <div className="floor-editorial-gallery" aria-label="Choose a featured floor">
          {floors.map(({ material, product }, index) => {
            let offset = index - activeIndex;
            const halfway = Math.floor(floors.length / 2);
            if (offset > halfway) offset -= floors.length;
            if (offset < -halfway) offset += floors.length;
            const selected = index === activeIndex;
            const distance = Math.abs(offset);
            const angle = offset * 5;
            return (
              <button
                className={`floor-editorial-plank${selected ? " is-active" : ""}`}
                type="button"
                aria-label={`Show ${product.name}`}
                aria-pressed={selected}
                aria-hidden={distance > 1}
                tabIndex={selected ? 0 : -1}
                onClick={() => {
                  if (suppressClickAfterSwipe.current) {
                    suppressClickAfterSwipe.current = false;
                    return;
                  }
                  showFloor(index);
                }}
                data-offset={offset}
                style={{ "--floor-offset": offset, "--floor-distance": distance, "--floor-angle": `${angle}deg`, "--floor-scale": Math.max(0.4, 1 - distance * 0.24), "--floor-arrival": offset + 3, zIndex: floors.length - distance } as CSSProperties}
                key={material.id}
              >
                <span className="floor-editorial-visual" aria-hidden="true">
                  <Image src={product.textureImage} alt="" fill sizes="(max-width: 700px) 52vw, 18vw" draggable={false} />
                </span>
              </button>
            );
          })}
        </div>

        <div className="floor-editorial-details" key={`detail-${active.product.slug}`} aria-live="polite">
          <div className="floor-editorial-description">
            <h3>{active.product.name}</h3>
          </div>
          <div className="floor-editorial-facts">
            <span><small>From</small><strong>{money(active.product.price)} <em>/ m²</em></strong></span>
            <Link href={`/product/${active.product.slug}`}>Explore this floor <ArrowUpRight size={19} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="floor-editorial-controls" aria-label="Choose a featured floor">
          <button type="button" aria-label="Previous floor" onClick={() => showFloor(activeIndex - 1)}><ChevronLeft size={20} aria-hidden="true" /></button>
          <button type="button" aria-label="Next floor" onClick={() => showFloor(activeIndex + 1)}><ChevronRight size={20} aria-hidden="true" /></button>
        </div>
      </div>
    </section>
  );
}

function SampleBoxSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setIsVisible(true);
      observer.disconnect();
    }, { threshold: 0.22 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`sbs-section sample-palette-section${isVisible ? " is-visible" : ""}`}
    >
      <div className="sample-palette-visual">
        <div className="sample-palette-stage">
          <span className="palette-orbit palette-orbit-one" aria-hidden="true" />
          <span className="palette-orbit palette-orbit-two" aria-hidden="true" />
          <img
            className="sample-palette-image"
            src="/assets/real/sample-wood-palette-new.png"
            alt="Floating natural wood flooring sample palette"
          />
          <span className="sample-palette-shadow" aria-hidden="true" />
        </div>
      </div>

      <div className="sample-palette-copy">
        <h2>Let the floor <em>rise</em> into your room before you buy.</h2>
        <p>
          Choose real wood tones, compare texture at home and build a premium
          palette before ordering full packs.
        </p>
        <div className="sample-palette-actions">
          <Link href="/category/engineered" className="sbs-cta">
            Shop Free Samples <PremiumIcon name="arrow" />
          </Link>
        </div>
      </div>
    </section>
  );
}



function PostHeroReference() {
  const floorBenefits = [
    ["price", "Price Match Guarantee"],
    ["truck", "Free Next Day Samples"],
    ["sample", "Free XL Samples"],
    ["return", "30-Day Returns"],
  ];

  return (
    <section
      className="post-hero-reference"
      aria-label="About UNIQ FLOORS and flooring categories"
    >
      <div className="reference-why">
        <div className="reference-why-head">
          <h2>Floors made for the way you live.</h2>
          <Link href="/about">About us <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
        <div className="reference-why-benefits" aria-label="Why shop with UNIQ FLOORS">
          <div className="reference-why-benefits-track">
            {[false, true].map((duplicate) => (
              <div className="reference-why-benefits-group" key={String(duplicate)} aria-hidden={duplicate || undefined}>
                {floorBenefits.map(([icon, label]) => (
                  <div className="reference-why-benefit" key={label}>
                    <span className="reference-why-benefit-icon" aria-hidden="true"><PremiumIcon name={icon} /></span>
                    <strong>{label}</strong>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <FlooringCategoryBlocks />
    </section>
  );
}

const categoryBlockCollections = {
  residential: [
    { title: "Engineered Wood Flooring", href: "/category/engineered", image: "/assets/categories/generated/engineered-focused.jpg" },
    { title: "Vinyl (LVT)", href: "/category/lvt", image: "/assets/categories/generated/lvt-focused.jpg" },
    { title: "Laminate Flooring", href: "/category/laminate", image: "/assets/categories/generated/laminate-focused.jpg" },
    { title: "Solid Oak Flooring", href: "/category/solid", image: "/assets/categories/generated/solid-oak-focused.jpg" },
    { title: "SPC Click Vinyl", href: "/category/spc", image: "/assets/categories/generated/spc-focused.jpg" },
    { title: "Parquet & Herringbone", href: "/category/herringbone", image: "/assets/categories/generated/herringbone-focused.jpg" },
  ],
  commercial: [
    { title: "Commercial Vinyl (LVT)", href: "/category/lvt", image: "/assets/rooms-generated/room-commercial.webp" },
    { title: "SPC Click Vinyl", href: "/category/spc", image: "/assets/categories/generated/spc-focused.jpg" },
    { title: "Laminate", href: "/category/laminate", image: "/assets/categories/generated/laminate-focused.jpg" },
    { title: "Carpet", href: "/carpets", image: "/assets/material-illustrations/carpet-grey.webp" },
    { title: "Parquet & Herringbone", href: "/category/herringbone", image: "/assets/categories/generated/herringbone-focused.jpg" },
    { title: "Engineered Wood Flooring", href: "/category/engineered", image: "/assets/categories/generated/engineered-focused.jpg" },
  ],
} as const;

function FlooringCategoryBlocks() {
  const router = useRouter();
  const [audience, setAudience] = useState<"residential" | "commercial">("residential");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const collection = categoryBlockCollections[audience];
  const selected = collection[selectedIndex];
  const selectAudience = (next: "residential" | "commercial") => {
    setAudience(next);
    setSelectedIndex(0);
  };
  const selectCategory = (index: number) => {
    if (index === selectedIndex) router.push(collection[index].href);
    else setSelectedIndex(index);
  };
  const moveSelection = (direction: number) => {
    setSelectedIndex((index) => (index + direction + collection.length) % collection.length);
  };

  return (
    <section className="home-category-blocks" aria-label="Explore flooring collections">
      <div className="home-category-blocks-top">
        <div className="home-category-blocks-switch" aria-label="Choose a flooring collection">
          <button type="button" aria-pressed={audience === "residential"} onClick={() => selectAudience("residential")}>Residential</button>
          <button type="button" aria-pressed={audience === "commercial"} onClick={() => selectAudience("commercial")}>Commercial</button>
        </div>
        <div className="home-category-blocks-arrows">
          <button type="button" onClick={() => moveSelection(-1)} aria-label="Previous flooring category"><ChevronLeft aria-hidden="true" /></button>
          <button type="button" onClick={() => moveSelection(1)} aria-label="Next flooring category"><ChevronRight aria-hidden="true" /></button>
        </div>
      </div>
      <strong className="home-category-blocks-backdrop" aria-hidden="true">{selected.title}</strong>
      <div className="home-category-blocks-grid" key={audience}>
        {collection.map(({ title, image }, index) => (
          <button
            className="home-category-block"
            type="button"
            key={title}
            aria-label={`${title}${index === selectedIndex ? "; selected, press again to explore" : "; select category"}`}
            aria-pressed={index === selectedIndex}
            onClick={() => selectCategory(index)}
          >
            <img src={image} alt="" loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
      <div className="home-category-blocks-detail" aria-live="polite">
        <div><span>{String(selectedIndex + 1).padStart(2, "0")} of {String(collection.length).padStart(2, "0")}</span><h2>{selected.title}</h2></div>
        <Link href={selected.href}>Explore this category <ArrowUpRight size={20} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

function BeforeAfterComparison() {
  const [dividerPosition, setDividerPosition] = useState(52);

  return (
    <section className="section home-before-after" aria-labelledby="before-after-title">
      <div className="before-after-heading">
        <div>
          <p className="eyebrow">Before &amp; after</p>
          <h2 id="before-after-title">See what a floor can do.</h2>
        </div>
        <p>
          One room, two finishes. Drag across to see the difference.
        </p>
      </div>

      <div
        className="before-after-stage"
        style={{ "--comparison-position": `${dividerPosition}%` } as CSSProperties}
      >
        <img
          className="before-after-image before-after-before"
          src="/assets/before-after/floor-before.jpg"
          alt="Room before installation with an unfinished concrete floor"
          draggable={false}
        />
        <div className="before-after-after" aria-hidden="true">
          <img
            className="before-after-image"
            src="/assets/before-after/floor-after.jpg"
            alt=""
            draggable={false}
          />
        </div>

        <span className="comparison-label comparison-label-before">Before</span>
        <span className="comparison-label comparison-label-after">After</span>

        <div className="comparison-divider" aria-hidden="true">
          <span>
            <i>‹</i>
            <i>›</i>
          </span>
        </div>

        <input
          className="before-after-range"
          type="range"
          min="0"
          max="100"
          value={dividerPosition}
          onChange={(event) => setDividerPosition(Number(event.target.value))}
          aria-label="Move the divider to compare the room before and after flooring"
          aria-valuetext={`${dividerPosition}% before image and ${100 - dividerPosition}% after image`}
        />

      </div>
    </section>
  );
}

function CommerceHeader({ headerScrolled }: { headerScrolled: boolean }) {
  return (
    <header className={`aeline-header ${headerScrolled ? 'scrolled' : ''}`} id="top">
      <div className="aeline-header-inner">
        <Link className="aeline-brand" href="/" aria-label="Home">
          <img
            className="aeline-brand-logo"
            src="/assets/brand/uniq-header-logo.png"
            alt="UNIQ Floors"
          />
        </Link>
        <Link className="aeline-account-link" href="/account" aria-label="Open your account" title="Account">
          <UserRound size={20} strokeWidth={1.8} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}

function RollingAds() {
  const [activeGroup, setActiveGroup] = useState(0);
  const adGroups = [
    [
      {
        label: "Engineered oak",
        title: "Natural smoked oak with a calm grain.",
        copy: "Premium boards for warm living spaces",
        deal: "From £52.95",
        image: "/assets/real/living-oak.jpg",
        href: "/product/kensington-smoked-oak-engineered",
        icon: "layers",
        tone: "image",
      },
      {
        label: "Samples",
        title: "Next day sample drop.",
        copy: "Compare colour at home",
        deal: "Free",
        image: "/assets/real/dining-oak.jpg",
        href: "/category/engineered",
        icon: "sample",
        tone: "lime",
      },
      {
        label: "Design advice",
        title: "Room edits built around real flooring photos.",
        copy: "Texture, finish and practical guidance",
        deal: "Guides",
        image: "/assets/real/kitchen-oak.jpg",
        href: "/guides",
        icon: "guide",
        tone: "dark",
      },
      {
        label: "Herringbone",
        title: "Pattern floors for considered rooms.",
        copy: "Parquet favourites",
        deal: "Shop now",
        image: "/assets/real/dining-oak.jpg",
        href: "/category/herringbone",
        icon: "palette",
        tone: "glass",
      },
      {
        label: "Price match",
        title: "Found it cheaper?",
        copy: "We will match before checkout",
        deal: "Promise",
        image: "/assets/real/hallway-oak.jpg",
        href: "/delivery",
        icon: "price",
        tone: "white",
      },
    ],
    [
      {
        label: "Kitchen-ready",
        title: "Waterproof finishes for daily life.",
        copy: "Wood looks with practical performance",
        deal: "LVT edit",
        image: "/assets/real/kitchen-oak.jpg",
        href: "/category/lvt",
        icon: "droplets",
        tone: "image",
      },
      {
        label: "Laminate",
        title: "Easy care floors with sharp detail.",
        copy: "Built for busy rooms",
        deal: "Shop",
        image: "/assets/real/hallway-oak.jpg",
        href: "/category/laminate",
        icon: "shield",
        tone: "white",
      },
      {
        label: "Solid oak",
        title: "True wood character with a rich finish.",
        copy: "Long-life natural flooring",
        deal: "Classic",
        image: "/assets/real/living-walnut.jpg",
        href: "/category/solid",
        icon: "badge",
        tone: "dark",
      },
      {
        label: "SPC vinyl",
        title: "Stone calm for bathrooms and utility rooms.",
        copy: "Click-fit waterproof comfort",
        deal: "Explore",
        image: "/assets/real/bath-wood.jpg",
        href: "/category/spc",
        icon: "droplets",
        tone: "glass",
      },
      {
        label: "Rooms",
        title: "Curated floors by room.",
        copy: "Living, dining, hallway and office",
        deal: "Inspire",
        image: "/assets/real/office-oak.jpg",
        href: "/live-room",
        icon: "room",
        tone: "lime",
      },
    ],
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveGroup((current) => (current + 1) % adGroups.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [adGroups.length]);

  return (
    <section
      className="rolling-ads hero-ad-dock"
      aria-label="Featured flooring promotions"
    >
      <div className="hero-ad-window">
        <div
          className="hero-ad-track"
          style={{ transform: `translateX(-${activeGroup * 100}%)` }}
        >
          {adGroups.map((group, groupIndex) => (
            <div
              className="hero-ad-page"
              aria-hidden={activeGroup !== groupIndex}
              key={`ad-page-${groupIndex}`}
            >
              {group.map((item, index) => (
                <Link
                  className={`hero-ad-card tone-${item.tone} card-${index + 1}`}
                  href={item.href}
                  key={item.title}
                >
                  <img src={item.image} alt="" />
                  <span>
                    <PremiumIcon name={item.icon as IconName} /> {item.label}
                  </span>
                  <strong>{item.title}</strong>
                  <em>{item.copy}</em>
                  <b>{item.deal}</b>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="hero-ad-dots" aria-label="Promotion slides">
        {adGroups.map((_, index) => (
          <button
            aria-label={`Show promotion group ${index + 1}`}
            aria-pressed={activeGroup === index}
            className={activeGroup === index ? "active" : ""}
            key={index}
            type="button"
            onClick={() => setActiveGroup(index)}
          />
        ))}
      </div>
    </section>
  );
}

function FeaturedCollections() {
  const slides = [
    [
      "Family Friendly Laminate",
      "Durable and beautiful flooring for active homes.",
      "/assets/real/hallway-oak.jpg",
      "/category/laminate",
    ],
    [
      "Luxury Vinyl Tile (LVT)",
      "Elegant designs with practical waterproof performance.",
      "/assets/real/kitchen-oak.jpg",
      "/category/lvt",
    ],
    [
      "Classic Herringbone",
      "Timeless pattern for sophisticated spaces.",
      "/assets/real/dining-oak.jpg",
      "/category/herringbone",
    ],
  ];

  return (
    <section className="featured-collections">
      <div className="featured-head">
        <p className="eyebrow">Featured collections</p>
        <h2>Colour-blocked liquid glass, built for browsing.</h2>
      </div>
      <div className="collection-rail">
        <div className="collection-track">
          {[...slides, ...slides].map(([title, copy, image, href], index) => (
            <Link
              className="collection-slide"
              href={href}
              key={`${title}-${index}`}
            >
              <img src={image} alt={title} />
              <span>
                <strong>{title}</strong>
                <em>{copy}</em>
                <b>Shop now</b>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryView({
  id,
  addSample,
}: {
  id?: string;
  addSample: (slug: string) => void;
}) {
  const { products, categories, productBySlug, categoryById, productsByCategory, content, selectionWhatsAppHref, whatsappHref, whatsappVideoHref, storeMapHref } = useStoreData();
  const category = categoryById(id);
  const [filter, setFilter] = useState("all");
  const visibleProducts = productsByCategory(category.id).filter((product) => {
    if (filter === "all") return true;
    if (filter === "premium")
      return product.tags.includes("premium") || product.price > 50;
    return product.tags.includes(filter);
  });

  return (
    <>
      <section className="section tight" id="products">
        <SectionHead
          eyebrow={`${visibleProducts.length} ${category.title.toLowerCase()}`}
          title="Shop the full range."
          copy="Compare colour, board format and price at a glance, then open any floor for room visuals and full specifications."
        />
        <div className="filters" aria-label="Product filters">
          {filters.map((item) => (
            <button
              className={`filter-chip ${filter === item ? "active" : ""}`}
              type="button"
              onClick={() => setFilter(item)}
              key={item}
            >
              <PremiumIcon name={filterIcons[item]} />
              {item}
            </button>
          ))}
        </div>
        <div className="inner-benefit-row" aria-label="Shopping benefits">
          <span><PremiumIcon name="sample" /> Free XL samples</span>
          <span><PremiumIcon name="truck" /> Fast UK delivery</span>
          <span><PremiumIcon name="shield" /> Price-match promise</span>
          <span><PremiumIcon name="message" /> Flooring expert support</span>
        </div>
        <div className="grid products-grid">
          {visibleProducts.map((product) => (
            <ProductCard
              product={product}
              addSample={addSample}
              key={product.slug}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function ShopView({
  addToCart,
}: {
  addToCart: (slug: string, quantity: number) => void;
}) {
  const { products, categories, productBySlug, categoryById, productsByCategory, content, selectionWhatsAppHref, whatsappHref, whatsappVideoHref, storeMapHref } = useStoreData();
  const [material, setMaterial] = useState("all");
  const [shopColour, setShopColour] = useState("all");
  const [shopSearch, setShopSearch] = useState("");
  const [discoveryTab, setDiscoveryTab] = useState<"category" | "concern">("category");
  const shopConcerns: {
    title: string;
    copy: string;
    href: string;
    image: string;
    icon: IconName;
  }[] = [
    {
      title: "Waterproof rooms",
      copy: "Spills, splashes and muddy boots wipe clean with ease.",
      href: "/category/lvt",
      image: "/assets/concerns-generated/concern-waterproof.webp",
      icon: "droplets",
    },
    {
      title: "Busy family homes",
      copy: "Built for children, pets and constant everyday traffic.",
      href: "/category/laminate",
      image: "/assets/concerns-generated/concern-busy-family.webp",
      icon: "shield",
    },
    {
      title: "Real wood warmth",
      copy: "Natural grain and warmth for relaxed, lived-in rooms.",
      href: "/category/engineered",
      image: "/assets/concerns-generated/concern-real-wood.webp",
      icon: "layers",
    },
    {
      title: "Statement pattern",
      copy: "Herringbone detail that turns the floor into a feature.",
      href: "/category/herringbone",
      image: "/assets/concerns-generated/concern-pattern.webp",
      icon: "star",
    },
    {
      title: "Premium forever floor",
      copy: "Full-depth timber made to be loved across generations.",
      href: "/category/solid",
      image: "/assets/concerns-generated/concern-premium.webp",
      icon: "badge",
    },
  ];
  const bestsellerSlugs = [
    "ashford-natural-oak-engineered",
    "mayfair-herringbone-oak",
    "brooklyn-oak-lvt",
    "brighton-white-oak-engineered",
  ];
  const bestsellerProducts = bestsellerSlugs
    .map((slug) => products.find(product => product.slug === slug))
    .filter((product): product is Product => Boolean(product));
  const visibleProducts = products.filter(product =>
    (material === "all" || product.category === material) &&
    (shopColour === "all" || product.colour === shopColour) &&
    `${product.name} ${product.colour} ${product.finish}`.toLowerCase().includes(shopSearch.toLowerCase())
  );

  return (
    <>
      <section className="shop-page-intro">
        <p className="eyebrow">The UNIQ floor edit</p>
        <h1>Shop floors for every kind of home.</h1>
        <p>Explore considered materials, compare finishes and choose with confidence.</p>
        <div className="shop-intro-actions">
          <Link className="shop-expanded-collection-link" href="/carpets" aria-label="Explore carpet collections">
            <span className="shop-collection-symbol" aria-hidden="true"><PremiumIcon name="layers" /></span>
            <span className="shop-collection-label"><strong>Carpets</strong><small>Explore the softer side of flooring</small></span>
            <PremiumIcon name="arrow" />
          </Link>
          <nav className="customer-shop-channel" aria-label="Choose how to shop">
            <Link className="shop-channel-option is-current" href="#products" aria-current="page">
              <span className="shop-channel-icon"><PremiumIcon name="home" /></span>
              <span className="shop-channel-copy"><strong>Floors</strong><small>Browse materials and order samples</small></span>
              <PremiumIcon name="arrow" />
            </Link>
            <Link className="shop-channel-option" href="/retailers">
              <span className="shop-channel-icon"><PremiumIcon name="briefcase" /></span>
              <span className="shop-channel-copy"><strong>Trade</strong><small>Flooring for your next project</small></span>
              <PremiumIcon name="arrow" />
            </Link>
          </nav>
        </div>
      </section>

      <section className="shop-discovery-section" aria-label="Discover flooring">
        <div className="shop-discovery-tabs" role="tablist" aria-label="Shop flooring by">
          <button
            className={discoveryTab === "category" ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={discoveryTab === "category"}
            aria-controls="shop-category-panel"
            onClick={() => setDiscoveryTab("category")}
          >
            Shop by Category
          </button>
          <button
            className={discoveryTab === "concern" ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={discoveryTab === "concern"}
            aria-controls="shop-concern-panel"
            onClick={() => setDiscoveryTab("concern")}
          >
            Shop by Concern
          </button>
        </div>
        {discoveryTab === "category" ? (
          <div className="shop-discovery-grid shop-category-grid" id="shop-category-panel" role="tabpanel">
            {categories.map((category) => (
              <Link className="shop-discovery-card" href={`/category/${category.id}`} key={category.id}>
                <span className="shop-discovery-image">
                  <img src={category.image} alt={`${category.title} flooring preview`} />
                </span>
                <strong>
                  {category.id === "herringbone"
                    ? "Herringbone"
                    : category.id === "spc"
                      ? "SPC flooring"
                      : category.title.replace(" Flooring", "").replace(" Tile", "")}
                </strong>
              </Link>
            ))}
          </div>
        ) : (
          <div className="shop-discovery-grid shop-concern-grid" id="shop-concern-panel" role="tabpanel">
            {shopConcerns.map((concern) => (
              <Link className="shop-discovery-card shop-concern-card" href={concern.href} key={concern.title}>
                <span className="shop-discovery-image">
                  <img src={concern.image} alt={`${concern.title} room`} />
                  <i aria-hidden="true"><PremiumIcon name={concern.icon} /></i>
                </span>
                <strong>{concern.title}</strong>
                <small>{concern.copy}</small>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="section tight shop-bestseller-section">
        <div className="shop-simple-heading">
          <h2>Best Sellers</h2>
          <Link href="#products">View all <PremiumIcon name="arrow" /></Link>
        </div>
        <div className="shop-bestseller-grid">
          {bestsellerProducts.map((product) => (
            <ShopProductCard product={product} addToCart={addToCart} key={product.slug} />
          ))}
        </div>
      </section>

      <section className="section tight shop-catalogue" id="products">
        <div className="shop-catalogue-heading">
          <div>
            <p className="eyebrow">The complete collection</p>
            <h2>All Floors</h2>
          </div>
          <span>{products.length} products</span>
        </div>
        <div className="filters material-filters" aria-label="Filter by flooring material">
          <button className={`filter-chip ${material === "all" ? "active" : ""}`} type="button" onClick={() => setMaterial("all")}>
            <PremiumIcon name="layers" /> All floors
          </button>
          {categories.map((category) => (
            <button
              className={`filter-chip ${material === category.id ? "active" : ""}`}
              type="button"
              onClick={() => setMaterial(category.id)}
              key={category.id}
            >
              <PremiumIcon name={category.id === "lvt" || category.id === "spc" ? "droplets" : category.id === "laminate" ? "shield" : "layers"} />
              {category.id === "herringbone" ? "Herringbone" : category.title.replace(" Flooring", "")}
            </button>
          ))}
        </div>
        <div className="customer-colour-filters"><label>Find your floor<input value={shopSearch} onChange={e=>setShopSearch(e.target.value)} placeholder="Search names, colours or finishes"/></label><label>Colour<select value={shopColour} onChange={e=>setShopColour(e.target.value)}><option value="all">All colours</option>{[...new Set(products.map(product=>product.colour))].map(colour=><option key={colour}>{colour}</option>)}</select></label></div>
        <p className="catalogue-count">Showing <strong>{visibleProducts.length}</strong> floors</p>
        <div className="grid products-grid">
          {visibleProducts.map((product) => (
            <ShopProductCard product={product} addToCart={addToCart} key={product.slug} />
          ))}
        </div>
      </section>
      <ManufacturerCatalogue/>
      <RoomInspirationSection />
    </>
  );
}

function RoomInspirationSection() {
  return (
    <section className="section room-inspiration-strip shop-room-inspiration">
      <SectionHead
        eyebrow="Shop by room"
        title="Start with how the room lives."
        copy="Find flooring shaped around moisture, traffic, comfort and the atmosphere you want to create."
        action={<Link className="secondary-btn" href="/live-room">Try Live Room <PremiumIcon name="camera" /></Link>}
      />
      <div className="room-inspiration-scroll">
        {rooms.map(([name, copy, category, image]) => (
          <article className="room-card" key={name}>
            <img src={image} alt={`${name} flooring inspiration`} />
            <div>
              <h3>{name}</h3>
              <p>{copy}</p>
              <Link href={`/category/${category}`}>Shop {name} <PremiumIcon name="arrow" /></Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RoomCameraStudio({
  addToCart,
  autoStart = false,
}: {
  addToCart: (slug: string, quantity: number) => void;
  autoStart?: boolean;
}) {
  const { products, categories, productBySlug, categoryById, productsByCategory, content, selectionWhatsAppHref, whatsappHref, whatsappVideoHref, storeMapHref } = useStoreData();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const autoAttemptedRef = useRef(false);
  const [deviceKind, setDeviceKind] = useState<"checking" | "mobile" | "desktop">("checking");
  const [selectedSlug, setSelectedSlug] = useState(products[0].slug);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [size, setSize] = useState(82);
  const [perspective, setPerspective] = useState(18);
  const [angle, setAngle] = useState(0);
  const [opacity, setOpacity] = useState(78);
  const [layoutRestored, setLayoutRestored] = useState(false);
  const selectedProduct = productBySlug(selectedSlug);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
    setCameraStarting(false);
  }

  async function startCamera() {
    setCameraError("");
    setCameraReady(false);
    setCameraStarting(true);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("This browser cannot open the live camera. Please try Safari or Chrome on your phone or tablet.");
      setCameraStarting(false);
      return;
    }

    try {
      stopCamera();
      setCameraStarting(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Camera view is not ready");
      video.srcObject = stream;
      await video.play();
      setCameraReady(true);
    } catch {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraError("Camera access was not available. Allow camera permission in your browser, then tap Try again.");
    } finally {
      setCameraStarting(false);
    }
  }

  useEffect(() => {
    const mobileUserAgent = /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent);
    const touchDevice = navigator.maxTouchPoints > 1 && window.matchMedia("(pointer: coarse)").matches;
    const supportedDevice = mobileUserAgent || touchDevice;
    setDeviceKind(supportedDevice ? "mobile" : "desktop");

    let timer: number | undefined;
    if (supportedDevice && autoStart && !autoAttemptedRef.current) {
      autoAttemptedRef.current = true;
      timer = window.setTimeout(() => void startCamera(), 650);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [autoStart]);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("uniqLiveRoomLayout") || "null") as null | {
        size?: number;
        perspective?: number;
        angle?: number;
        opacity?: number;
      };
      if (saved) {
        if (typeof saved.size === "number") setSize(saved.size);
        if (typeof saved.perspective === "number") setPerspective(saved.perspective);
        if (typeof saved.angle === "number") setAngle(saved.angle);
        if (typeof saved.opacity === "number") setOpacity(saved.opacity);
      }
    } catch {
      // Keep the clean default layout when storage is unavailable.
    } finally {
      setLayoutRestored(true);
    }
  }, []);

  useEffect(() => {
    if (!layoutRestored) return;
    try {
      sessionStorage.setItem("uniqLiveRoomLayout", JSON.stringify({ size, perspective, angle, opacity }));
    } catch {
      // The visualiser still works when storage is unavailable.
    }
  }, [size, perspective, angle, opacity, layoutRestored]);

  const overlayStyle = {
    width: `${size}%`,
    opacity: opacity / 100,
    backgroundImage: `url(/assets/material-samples/sample-${selectedProduct.category}.png)`,
    clipPath: `polygon(${perspective}% 0, ${100 - perspective}% 0, 100% 100%, 0 100%)`,
    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
  } satisfies CSSProperties;

  if (deviceKind === "checking") {
    return (
      <section className="section room-camera-section live-room-only live-room-checking" aria-live="polite">
        <div className="live-room-device-loader"><PremiumIcon name="camera" /><span>Preparing Live Room…</span></div>
      </section>
    );
  }

  if (deviceKind === "desktop") {
    return (
      <section className="section room-camera-section live-room-only live-room-desktop">
        <div className="desktop-live-room-card">
          <div className="desktop-device-scene" aria-hidden="true">
            <span className="device-orbit orbit-one" />
            <span className="device-orbit orbit-two" />
            <div className="device-phone"><span /><PremiumIcon name="camera" /><i /></div>
            <div className="device-tablet"><span /><div><PremiumIcon name="layers" /></div></div>
          </div>
          <div className="desktop-live-room-copy">
            <p className="eyebrow"><PremiumIcon name="camera" /> Live Room</p>
            <h1>Designed for phones and tablets.</h1>
            <p>Open this page on a mobile, iPad or tablet. Live Room will request the rear camera, then let you place and compare every UNIQ floor in your own space.</p>
            <div className="desktop-device-pills"><span>Rear camera</span><span>Live floor overlay</span><span>Saved layout</span></div>
            <Link className="secondary-btn" href="/shop">Browse floors on desktop <PremiumIcon name="arrow" /></Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section room-camera-section live-room-only mobile-live-room" id="live-room-view">
      <div className="room-camera-heading">
        <span className="camera-feature-icon"><PremiumIcon name="camera" /></span>
        <div>
          <p className="eyebrow">Live Room</p>
          <h1>See it in your space.</h1>
          <p>Your rear camera opens securely. Adjust the floor once, then compare products without losing the layout.</p>
        </div>
        <span className={`camera-status-pill ${cameraReady ? "ready" : ""}`}><i /> {cameraReady ? "Camera live" : cameraStarting ? "Connecting" : "Camera needed"}</span>
      </div>

      <div className={`room-camera-studio ${cameraReady ? "camera-active" : "camera-permission"}`}>
        <div className={`camera-viewport ${cameraReady ? "is-live is-ready" : "is-waiting"}`}>
          <video ref={videoRef} muted playsInline aria-label="Live rear camera room view" />
          {cameraReady ? <div className="floor-camera-overlay" style={overlayStyle} aria-label={`${selectedProduct.name} floor overlay`} /> : null}
          {cameraReady ? (
            <>
              <div className="camera-view-topbar"><span><i /> Live rear camera</span><button type="button" onClick={stopCamera}>Close</button></div>
              <div className="camera-view-label"><small>Comparing now</small><strong>{selectedProduct.name}</strong></div>
            </>
          ) : (
            <div className="camera-permission-screen">
              <span className="permission-camera-icon"><PremiumIcon name="camera" /><i /></span>
              <p className="eyebrow">One-time permission</p>
              <h2>{cameraStarting ? "Allow camera access" : cameraError ? "Camera needs permission" : "Opening your rear camera"}</h2>
              <p>{cameraStarting ? "Your phone or tablet will show its own secure permission message." : cameraError || "Keep this page open while Live Room connects to your device camera."}</p>
              {!cameraStarting ? <button type="button" onClick={startCamera}><PremiumIcon name="camera" /> Try again</button> : <div className="permission-pulse"><i /><i /><i /></div>}
            </div>
          )}
        </div>

        {cameraReady ? (
          <>
            <aside className="camera-controls-panel">
              <div className="camera-control-intro"><span>Fit the floor</span><small>Your settings stay fixed while products change.</small></div>
              <span className="camera-layout-lock"><PremiumIcon name="check" /> Layout saved</span>
              <label><span>Size <b>{size}%</b></span><input type="range" min="48" max="118" value={size} onChange={(event) => setSize(Number(event.target.value))} /></label>
              <label><span>Perspective <b>{perspective}</b></span><input type="range" min="2" max="34" value={perspective} onChange={(event) => setPerspective(Number(event.target.value))} /></label>
              <label><span>Angle <b>{angle}°</b></span><input type="range" min="-18" max="18" value={angle} onChange={(event) => setAngle(Number(event.target.value))} /></label>
              <label><span>Blend <b>{opacity}%</b></span><input type="range" min="42" max="94" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} /></label>
              <button className="camera-add-cart" type="button" onClick={() => addToCart(selectedProduct.slug, 1)}><PremiumIcon name="cart" /> Add selected floor <span>{money(selectedProduct.price)} / m²</span></button>
              <p><PremiumIcon name="shield" /> The camera stays on your device and stops when this view closes.</p>
            </aside>

            <div className="camera-product-tray" aria-label="Choose flooring for the room viewer">
              <div className="camera-tray-copy"><span>Change the floor</span><small>Layout stays exactly the same</small></div>
              <div className="camera-product-scroll">
                {products.map((product) => (
                  <button className={selectedSlug === product.slug ? "active" : ""} type="button" onClick={() => setSelectedSlug(product.slug)} key={product.slug}>
                    <img src={`/assets/material-samples/sample-${product.category}.png`} alt="" />
                    <span><strong>{product.colour}</strong><small>{money(product.price)} / m²</small></span>
                    <i aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

function ProductView({
  slug,
  addSample,
  addToCart,
}: {
  slug?: string;
  addSample: (slug: string) => void;
  addToCart: (slug: string, quantity: number) => void;
}) {
  const { products, categories, productBySlug, categoryById, productsByCategory, content, selectionWhatsAppHref, whatsappHref, whatsappVideoHref, storeMapHref } = useStoreData();
  const product = productBySlug(slug);
  const category = categoryById(product.category);
  const [area, setArea] = useState(20);
  const [waste, setWaste] = useState(10);
  const packCoverage = product.packCoverage || 2.2;
  const { packs, coveredArea } = calculatePacks(area.toFixed(4), packCoverage.toFixed(4), waste);
  const estimatedTotal = lineTotalPence(coveredArea.toFixed(4), Math.round(product.price * 100)) / 100;
  const discountPercent = Math.max(0, Math.round((1 - product.price / product.old) * 100));
  const packPrice = product.price * packCoverage;
  const orderWhatsAppHref = selectionWhatsAppHref("customer", [{ name: product.name, colour: product.colour, quantity: packs, unit: "packs", area: String(area) }]);
  const shadeOptions = products.filter((item) => item.category === product.category).slice(0, 6);
  const productWhatsappHref = `https://api.whatsapp.com/send/?phone=${String(content.business?.whatsapp_number||"447938373500")}&text=${encodeURIComponent(`Hello, I'm interested in buying ${product.name} through WhatsApp.`)}&type=phone_number&app_absent=0`;
  const productVideoHref = `https://api.whatsapp.com/send/?phone=${String(content.business?.whatsapp_number||"447938373500")}&text=${encodeURIComponent(`Hello, I'm interested in buying ${product.name} through a WhatsApp video call.`)}&type=phone_number&app_absent=0`;
  const bulkOrderHref = `https://api.whatsapp.com/send/?phone=${String(content.business?.whatsapp_number||"447938373500")}&text=${encodeURIComponent(`Hello, I'd like a bulk flooring quote for ${product.name}.`)}&type=phone_number&app_absent=0`;
  const galleryItems = [
    {
      id: "sample",
      image: product.image,
      label: "Single board",
      caption: `${product.thickness} construction and ${product.colour} finish`,
      alt: `${product.name} single product board`,
    },
    {
      id: "texture",
      image: product.textureImage,
      label: "Floor close-up",
      caption: `${product.finish} surface detail`,
      alt: `${product.name} installed floor close-up`,
    },
    {
      id: "room",
      image: product.roomImage,
      label: "In a room",
      caption: `${product.colour} in natural daylight`,
      alt: `${product.name} installed in a styled room`,
    },
  ];
  const [activeGalleryItem, setActiveGalleryItem] = useState(0);
  const [showStickyOrder, setShowStickyOrder] = useState(true);
  useEffect(() => {
    const updateStickyOrder = () => {
      const reviews = document.getElementById("reviews");
      setShowStickyOrder(!reviews || reviews.getBoundingClientRect().bottom > 120);
    };
    updateStickyOrder();
    window.addEventListener("scroll", updateStickyOrder, { passive: true });
    window.addEventListener("resize", updateStickyOrder);
    return () => {
      window.removeEventListener("scroll", updateStickyOrder);
      window.removeEventListener("resize", updateStickyOrder);
    };
  }, []);
  const activeGallery = galleryItems[activeGalleryItem];
  const showPreviousImage = () =>
    setActiveGalleryItem((current) =>
      (current - 1 + galleryItems.length) % galleryItems.length,
    );
  const showNextImage = () =>
    setActiveGalleryItem((current) => (current + 1) % galleryItems.length);
  const gallerySwipeStartX = useRef<number | null>(null);

  const handleGalleryTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    gallerySwipeStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleGalleryTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startX = gallerySwipeStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    gallerySwipeStartX.current = null;

    if (startX === null || endX === undefined || Math.abs(endX - startX) < 42) return;
    if (endX < startX) showNextImage();
    else showPreviousImage();
  };

  const related = products
    .filter((item) => item.slug !== product.slug)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, 4);
  const reviewWhatsappHref = `https://api.whatsapp.com/send/?phone=${String(content.business?.whatsapp_number||"447938373500")}&text=${encodeURIComponent(`Hello UNIQ FLOORS, I'd like to share feedback about ${product.name}.`)}&type=phone_number&app_absent=0`;

  return (
    <div className="product-experience frido-legacy-product">
      <header className="frido-product-topbar"><button className="frido-product-back" type="button" onClick={() => {
        if (document.referrer && new URL(document.referrer).origin === window.location.origin) window.history.back();
        else window.location.assign(`/category/${product.category}`);
      }}><span className="frido-back-icon"><ArrowLeft size={17} strokeWidth={1.8} aria-hidden="true" /></span><span className="frido-back-label">Back to shop</span></button><div className="frido-product-brand"><img src="/assets/brand/uniq-header-logo.png" alt="UNIQ FLOORS" width="720" height="279" /></div><div className="frido-product-right"><div className="frido-product-category" aria-label={`Collection: ${category.title}`}><span className="frido-category-icon" aria-hidden="true"><Layers3 size={18} strokeWidth={1.5} /></span><span className="frido-category-copy"><small>THE COLLECTION</small><strong>{category.title}</strong></span></div><Link className="frido-product-account" href="/account" aria-label="Account"><UserRound size={19} strokeWidth={1.65}/></Link></div></header>
      <div className="product-announcement" aria-label="Shopping benefits">
        <div className="product-benefit-track">
          {[0, 1, 2, 3].map((copy) => (
            <div className="product-benefit-set" aria-hidden={copy !== 0} key={copy}>
              <span><PackageCheck aria-hidden="true" size={17} strokeWidth={1.6} />Free samples</span>
              <span><RotateCcw aria-hidden="true" size={17} strokeWidth={1.6} />30-day returns on unopened packs</span>
              <span><Ruler aria-hidden="true" size={17} strokeWidth={1.6} />Expert flooring advice</span>
              <span><MessageCircle aria-hidden="true" size={17} strokeWidth={1.6} />Order with our team</span>
            </div>
          ))}
        </div>
      </div>
      {showStickyOrder && <div className="frido-product-sticky-order"><strong>{product.name}</strong><span>{money(product.price)} <small>per m²</small></span><a href={orderWhatsAppHref} target="_blank" rel="noopener noreferrer">Order on WhatsApp <ArrowUpRight size={18} strokeWidth={1.7} aria-hidden="true" /></a></div>}
      <nav className="product-section-nav" aria-label="On this page">
        <span>{product.name}</span>
        <div>
          <a href="#product-overview">Overview</a>
          <a href="#product-details">Features</a>
          <a href="#product-specifications">Specifications</a>
          <a href="#reviews">Reviews</a>
        </div>
        <a className="product-section-nav-buy" href="#product-buy">Buy now <span aria-hidden="true">↗</span></a>
      </nav>

      <section className="section product-section" id="product-overview">
        <nav className="product-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span>/</span>
          <Link href={`/category/${product.category}`}>{category.title}</Link><span>/</span>
          <strong>{product.name}</strong>
        </nav>
        <div className="details-grid">
          <div className="product-gallery">
            <div
              className={`product-gallery-stage is-${activeGallery.id}`}
              onTouchStart={handleGalleryTouchStart}
              onTouchEnd={handleGalleryTouchEnd}
            >
              <div className="product-gallery-heading">
                <h2>{product.colour}. Made for living.</h2>
                <p><span aria-label={`${product.rating} out of 5 stars`}>★★★★★</span> <a href="#reviews">{product.rating}</a></p>
              </div>
              <div className="product-gallery-image-frame">
                <img key={activeGallery.id} src={activeGallery.image} alt={activeGallery.alt} />
              </div>
              <div className="gallery-label"><span>{String(activeGalleryItem + 1).padStart(2, "0")}</span> {activeGallery.label}</div>
              <div className="gallery-caption">
                <PremiumIcon name={activeGallery.id === "sample" ? "scan" : "room"} />
                <span>{activeGallery.caption}</span>
              </div>
              <div className="product-gallery-dots product-gallery-stage-dots" role="tablist" aria-label="Product images">
                {galleryItems.map((item, index) => (
                  <button
                    className={index === activeGalleryItem ? "active" : ""}
                    type="button"
                    role="tab"
                    aria-selected={index === activeGalleryItem}
                    aria-label={`Image ${index + 1}: ${item.label}`}
                    onClick={() => setActiveGalleryItem(index)}
                    key={item.id}
                  />
                ))}
              </div>
              <button className="product-gallery-next" type="button" onClick={showNextImage} aria-label="Show next product image">
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="product-gallery-thumbnails" role="group" aria-label="Choose a product image">
              {galleryItems.map((item, index) => (
                <button className={index === activeGalleryItem ? "active" : ""} type="button" onClick={() => setActiveGalleryItem(index)} aria-label={`View ${item.label}`} aria-pressed={index === activeGalleryItem} key={item.id}>
                  <img src={item.image} alt="" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="product-info reference-product-info" id="product-buy">
            <div className="product-title-row">
              <p className="product-kicker"><span className="product-kicker-marker" aria-hidden="true" /><span><small><span className="product-kicker-brand">UNIQ Select</span><span className="product-kicker-badge">{product.badge}</span></small><strong>{category.title}</strong></span></p>
              <span className="product-stock"><span className="product-stock-icon"><MessageCircle size={17} strokeWidth={1.7} aria-hidden="true" /></span><span><small>AVAILABILITY</small><strong>{product.availability === "in_stock" ? "In stock" : product.availability === "out_of_stock" ? "Out of stock" : product.availability === "made_to_order" ? "Made to order" : "Ask our team"}</strong></span></span>
            </div>
            <h1>{product.name}</h1>
            <div className="product-rating-row">
              <span className="product-stars" aria-label={`${product.rating} out of 5 stars`}>★★★★★</span>
              <a href="#reviews">{product.rating}/5 · customer rating</a>
            </div>

            <div className="reference-price-block">
              <div><strong>{money(product.price)}</strong>{product.old > product.price && <><del>{money(product.old)}</del><span>{discountPercent}% OFF</span></>}</div>
              <p>per m² · VAT included</p>
              <small>One {packCoverage} m² pack from <b>{money(packPrice)}</b></small>
            </div>

            <div className="floor-offer-card">
              <span><PremiumIcon name="price" /></span>
              <div><strong>Plan your floor with confidence</strong><small>Estimate packs for your room, including a waste allowance.</small></div>
            </div>

            <div className="product-shade-choice">
              <div><span>Explore similar floors</span><strong>{product.colour}</strong></div>
              <div className="product-shade-options" aria-label="Explore other floors in this range">
                {shadeOptions.map((option) => (
                  <Link className={option.slug === product.slug ? "active" : ""} href={`/product/${option.slug}`} aria-label={`Explore ${option.name}`} key={option.slug}>
                    <img src={option.image} alt="" />
                    <span>{option.colour}</span>
                  </Link>
                ))}
              </div>
            </div>

            <p className="product-lead">{product.details}</p>

            <div className="flooring-configurator">
              <div className="config-title">
                <span>1</span>
                <div><strong>Enter your room size</strong><small>We calculate packs and allow for cuts.</small></div>
              </div>
              <label className="area-input">
                <span>Floor area</span>
                <span><input type="number" min="1" max="500" step="0.0001" value={area} onChange={(event) => { const value = Number(event.target.value); setArea(Number.isFinite(value) ? Math.min(500, Math.max(1, value)) : 1); }} /> m²</span>
              </label>

              <div className="config-title config-title-spacing">
                <span>2</span>
                <div><strong>Choose waste allowance</strong><small>10% works for most straight-lay rooms.</small></div>
              </div>
              <div className="waste-options" role="group" aria-label="Waste allowance">
                {[5, 10, 15].map((amount) => (
                  <button className={waste === amount ? "active" : ""} type="button" onClick={() => setWaste(amount)} key={amount}>
                    <strong>{amount}%</strong>
                    <small>{amount === 5 ? "Simple" : amount === 10 ? "Recommended" : "Patterned"}</small>
                    {amount === 10 ? <em>Best choice</em> : null}
                  </button>
                ))}
              </div>

              <div className="pack-summary">
                <div><span>You need</span><strong>{packs} packs</strong></div>
                <div><span>Total coverage</span><strong>{coveredArea.toFixed(1)} m²</strong></div>
                <div><span>Estimated order total</span><strong>{money(estimatedTotal)}</strong></div>
              </div>
              <div className="product-buy-actions">
                <button className="buy-add-cart" type="button" onClick={() => addToCart(product.slug, packs)}><PremiumIcon name="cart" /><span>Add to cart<small>{packs} packs · {money(estimatedTotal)}</small></span></button>
                <a className="buy-order-now" href={orderWhatsAppHref} target="_blank" rel="noopener noreferrer"><PremiumIcon name="message" /><span>Order on WhatsApp<small>Confirm with our flooring team</small></span></a>
                <a className="buy-visit-store" href={storeMapHref} target="_blank" rel="noopener noreferrer"><PremiumIcon name="map" /><span>Visit our showroom<small>Directions on Google Maps</small></span><ArrowUpRight className="store-directions-arrow" size={19} strokeWidth={1.7} aria-hidden="true" /></a>
              </div>
              <p className="checkout-reassurance"><PremiumIcon name="shield" /> Our team confirms stock, price, delivery and payment on WhatsApp</p>
              <p className="pack-estimate-note">Pack quantities use {packCoverage} m² coverage. Our team confirms the pack size and availability before you order.</p>
            </div>

            <div className="product-actions product-actions-priority product-secondary-actions reference-secondary-actions">
              <button
                className="secondary-btn"
                type="button"
                onClick={() => addSample(product.slug)}
              >
                <PremiumIcon name="sample" />
                Order free sample
              </button>
              <Link
                className="secondary-btn"
                href={`/category/${product.category}`}
              >
                <PremiumIcon name="layers" />
                Back to range
              </Link>
            </div>

          </div>
        </div>

        <section className="reference-service-strip" aria-label="Why choose UNIQ FLOORS">
          <div className="service-strip-heading"><p className="eyebrow">THE UNIQ EXPERIENCE</p><h2>Why customers choose UNIQ FLOORS.</h2></div>
          <article className="service-strip-item"><span className="service-strip-number">01</span><PackageCheck aria-hidden="true" strokeWidth={1.1} /><div><h3>See it at home</h3><p>Order a free sample and compare the colour in your own light before choosing.</p><button type="button" onClick={() => addSample(product.slug)}>Order a sample <ArrowUpRight size={16} /></button></div></article>
          <article className="service-strip-item"><span className="service-strip-number">02</span><Ruler aria-hidden="true" strokeWidth={1.1} /><div><h3>Plan with confidence</h3><p>Our team can help check your measurements, pack estimate and delivery options.</p><a href={productWhatsappHref} target="_blank" rel="noopener noreferrer">Ask our team <ArrowUpRight size={16} /></a></div></article>
          <article className="service-strip-item"><span className="service-strip-number">03</span><RotateCcw aria-hidden="true" strokeWidth={1.1} /><div><h3>Support after purchase</h3><p>30-day returns on unopened packs. Listed warranty: {product.warranty}. Ask us for the terms.</p><a href={productWhatsappHref} target="_blank" rel="noopener noreferrer">View your options <ArrowUpRight size={16} /></a></div></article>
        </section>

        <div className="product-shopping-help">
          <div className="shopping-help-copy">
            <p className="eyebrow">Need help shopping?</p>
            <h2>Choose with a flooring specialist.</h2>
            <p>Send your room, measurements or inspiration. We can help with colour, pack quantities, fitting and delivery.</p>
          </div>
          <div className="shopping-help-actions">
            <a className="shop-help-whatsapp" href={productWhatsappHref} target="_blank" rel="noreferrer"><WhatsAppMark /><span><strong>Shop on WhatsApp</strong><small>Message a flooring expert</small></span><PremiumIcon name="arrow" /></a>
            <a className="shop-help-video" href={productVideoHref} target="_blank" rel="noreferrer"><PremiumIcon name="video" /><span><strong>Shop on Video Call</strong><small>Show us your room live</small></span><PremiumIcon name="arrow" /></a>
            <a className="shop-help-store" href={storeMapHref} target="_blank" rel="noreferrer"><PremiumIcon name="map" /><span><strong>Visit our store</strong><small>Open directions in Maps</small></span><PremiumIcon name="arrow" /></a>
          </div>
          <div className="bulk-order-callout">
            <span><PremiumIcon name="briefcase" /></span>
            <div><small>Trade, multiple rooms or larger quantities?</small><strong>Chat with us for a bulk order.</strong></div>
            <a href={bulkOrderHref} target="_blank" rel="noreferrer">Get a quote <PremiumIcon name="arrow" /></a>
          </div>
        </div>
      </section>

      <section className="section product-confidence-section" id="product-details">
        <div className="confidence-intro">
          <p className="eyebrow">Closer look</p>
          <h2>Product highlights</h2>
          <p>Explore the finish, see it in a room and check the details before you choose.</p>
        </div>
        <div className="confidence-grid">
          <article><img src={product.textureImage} alt={`${product.name} surface detail`} loading="lazy" /><div><span>01 · THE FINISH</span><h3>Colour with character</h3><p>{product.finish} surface in {product.colour.toLowerCase()}.</p></div></article>
          <article><img src={product.roomImage} alt={`${product.name} in a room`} loading="lazy" /><div><span>02 · IN YOUR SPACE</span><h3>Picture the room</h3><p>View the floor in a styled interior, then order a sample to check it in your own light.</p></div></article>
          <article><img src={product.image} alt={`${product.name} board detail`} loading="lazy" /><div><span>03 · THE DETAILS</span><h3>Built around your project</h3><p>{product.thickness} construction with {product.install.toLowerCase()} installation.</p></div></article>
        </div>
      </section>

      <section className="section product-tech-section" id="product-specifications">
        <div className="product-tech-heading">
          <p className="eyebrow">The material, explained</p>
          <h2>Every detail has a purpose.</h2>
          <p>See the key specifications before choosing a sample or planning your order.</p>
        </div>
        <div className="product-tech-layout">
          <div className="product-tech-image"><img src={product.textureImage} alt={`${product.name} surface and grain detail`} /><span>01 · SURFACE DETAIL</span></div>
          <div className="spec-grid">
            <Spec icon="palette" label="Colour" value={product.colour} />
            <Spec icon="sparkles" label="Finish" value={product.finish} />
            <Spec icon="ruler" label="Thickness" value={product.thickness} />
            <Spec icon="layers" label="Board size" value={product.size} />
            <Spec icon="shield" label="Wear layer" value={product.wear} />
            <Spec icon="install" label="Install" value={product.install} />
            <Spec icon="badge" label="Warranty" value={product.warranty} />
            <Spec icon="sample" label="Samples" value="Free sample available" />
          </div>
        </div>
      </section>

      <section className="section product-information-section">
        <div className="product-accordions">
          <p className="eyebrow">Everything you need to know</p>
          <h2>Product information</h2>
          <details open><summary>Description <span>+</span></summary><p>{product.details} The {product.colour.toLowerCase()} palette is designed to stay versatile across warm and cool interiors. We recommend viewing a free sample in morning and evening light before placing a full order.</p></details>
          <details><summary>Technical details <span>+</span></summary><div className="detail-table"><span>Thickness <b>{product.thickness}</b></span><span>Board size <b>{product.size}</b></span><span>Wear layer <b>{product.wear}</b></span><span>Installation <b>{product.install}</b></span><span>Finish <b>{product.finish}</b></span><span>Warranty <b>{product.warranty}</b></span></div></details>
          <details><summary>Installation and care <span>+</span></summary><p>Acclimatise packs in the room before fitting and confirm the subfloor is clean, level and dry. Use felt furniture pads, avoid standing water and only use products approved for your flooring type.</p></details>
          <details><summary>Delivery and returns <span>+</span></summary><p>Free samples are dispatched separately. Full flooring orders are securely packed for UK delivery. Unopened packs may be returned within 30 days, subject to the delivery and returns policy.</p></details>
        </div>
        <div className="order-journey-card">
          <div className="journey-heading">
            <p className="eyebrow">From sample to room</p>
            <span>01—04</span>
          </div>
          <h3>A calmer route to the right floor.</h3>
          <p className="journey-copy">Test the colour, calculate accurately and plan delivery before fitting day.</p>
          <ol>
            <li><span>01</span><i><PremiumIcon name="sample" /></i><div><strong>Order a free sample</strong><small>Compare colour and texture in your own light.</small></div></li>
            <li><span>02</span><i><PremiumIcon name="ruler" /></i><div><strong>Measure your room</strong><small>Use our pack calculator with the right waste allowance.</small></div></li>
            <li><span>03</span><i><PremiumIcon name="truck" /></i><div><strong>Choose delivery</strong><small>Select a protected delivery option that suits your project.</small></div></li>
            <li><span>04</span><i><PremiumIcon name="fit" /></i><div><strong>Fit and enjoy</strong><small>Follow the fitting notes, then keep your floor looking its best.</small></div></li>
          </ol>
          <div className="journey-action">
            <span><small>Need a second opinion?</small><strong>Show us your room.</strong></span>
            <a href={whatsappVideoHref} target="_blank" rel="noreferrer"><PremiumIcon name="video" /> Book a video call</a>
          </div>
        </div>
      </section>

      <section className="section product-reviews-section" id="reviews">
        <div className="review-summary">
          <p className="eyebrow">Customer reviews</p>
          <h2>What customers say</h2>
          <p>Feedback helps others choose the right floor for their home.</p>
        </div>
        <div className="review-empty-state">
          <span aria-hidden="true">☆</span>
          <div><h3>No published reviews yet</h3><p>Have this floor at home? Share your experience with our team. We review feedback before it appears here.</p></div>
          <a href={reviewWhatsappHref} target="_blank" rel="noopener noreferrer">Share your review <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section className="section product-faq-section">
        <div><p className="eyebrow">Flooring help</p><h2>Questions before you order?</h2><p>Clear answers for measuring, samples, fitting and daily use.</p></div>
        <div>
          <details><summary>How many extra packs should I order?<span>+</span></summary><p>Allow 10% for most straight layouts and 15% for diagonal or patterned fitting. Our calculator includes your selected allowance.</p></details>
          <details><summary>Will the sample match every board?<span>+</span></summary><p>Natural grain and shade variation is expected. The sample represents the overall tone and finish, while full packs create a more varied floor.</p></details>
          <details><summary>Can I use it with underfloor heating?<span>+</span></summary><p>Compatibility depends on the floor build and heating system. Send your project details to our team before ordering for product-specific advice.</p></details>
          <details><summary>Do you help with measuring and fitting?<span>+</span></summary><p>Yes. Use WhatsApp or request a video call and we can review your room, measurements, fitting direction and accessories.</p></details>
        </div>
      </section>

      <section className="section tight product-related-section">
        <SectionHead
          eyebrow="Explore more floors"
          title="You may also like"
        />
        <div className="grid products-grid">
          {related.map((item) => (
            <ProductCard product={item} addSample={addSample} key={item.slug} />
          ))}
        </div>
      </section>
      <section className="product-story-band">
        <p className="eyebrow">Designed for better living</p>
        <h2>Beautiful underfoot. Practical everywhere.</h2>
        <div>
          <article><span>01</span><h3>True-to-life texture</h3><p>Carefully selected grain, colour variation and finish create a natural room-wide effect.</p></article>
          <article><span>02</span><h3>Everyday confidence</h3><p>Durable construction makes this floor ready for busy homes, furniture and daily cleaning.</p></article>
          <article><span>03</span><h3>Simple decision making</h3><p>Order a free sample, compare it in your light and speak to an expert before buying.</p></article>
        </div>
      </section>
    </div>
  );
}

function ShopProductCard({
  product,
  addToCart,
}: {
  product: Product;
  addToCart: (slug: string, quantity: number) => void;
}) {
  const discount = Math.max(0, Math.round((1 - product.price / product.old) * 100));
  const [imageIndex, setImageIndex] = useState(0);
  const images = [
    { src: product.image, label: "Product view" },
    { src: product.textureImage, label: "Surface detail" },
    { src: product.roomImage, label: "In a room" },
  ].filter((image, index, all) => all.findIndex((item) => item.src === image.src) === index);
  const selectedImage = images[imageIndex % images.length];

  return (
    <article className="shop-product-card">
      <div className="shop-product-image">
        <span className="shop-product-rating"><PremiumIcon name="star" /> {product.rating}</span>
        <span className="shop-product-favourite" aria-hidden="true"><Heart className="icon-svg" strokeWidth={1.7} /></span>
        <Link href={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="shop-product-image-link">
          <img src={selectedImage.src} alt={`${product.name} — ${selectedImage.label.toLowerCase()}`} loading="lazy" />
        </Link>
        {images.length > 1 && <div className="shop-product-image-controls" aria-label={`${product.name} images`}>
          <button type="button" aria-label={`Previous image of ${product.name}`} onClick={() => setImageIndex((index) => (index - 1 + images.length) % images.length)}><ChevronLeft aria-hidden="true" /></button>
          <span aria-live="polite">{imageIndex + 1} of {images.length}</span>
          <button type="button" aria-label={`Next image of ${product.name}`} onClick={() => setImageIndex((index) => (index + 1) % images.length)}><ChevronRight aria-hidden="true" /></button>
        </div>}
      </div>
      <div className="shop-product-body">
        <span className="shop-product-meta">{product.colour} · {product.finish}</span>
        <h3><Link href={`/product/${product.slug}`}>{product.name}</Link></h3>
        <div className="shop-product-pricing">
          <strong>{money(product.price)} <small>/ m²</small></strong>
          <del>{money(product.old)}</del>
          {discount > 0 ? <em>{discount}% OFF</em> : null}
        </div>
        <button type="button" onClick={() => addToCart(product.slug, 1)}>
          <PremiumIcon name="cart" /> Add to cart
        </button>
      </div>
    </article>
  );
}

function ProductCard({
  product,
  addSample,
}: {
  product: Product;
  addSample: (slug: string) => void;
}) {
  return (
    <article className="product-card">
      <Link href={`/product/${product.slug}`} className="product-image">
        <span className="badge">{product.badge}</span>
        <span className="product-card-favourite" aria-hidden="true"><Heart className="icon-svg" strokeWidth={1.7} /></span>
        <img src={product.image} alt={product.name} loading="lazy" />
      </Link>
      <div className="product-body">
        <div className="product-card-head">
          <span>{product.colour}</span>
          <span className="rating"><PremiumIcon name="star" /> {product.rating}</span>
        </div>
        <h3>
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="product-card-specline">
          <span>{product.finish}</span><i /> <span>{product.thickness}</span>
        </div>
        <div className="product-card-price-row">
          <span className="price">{money(product.price)} <small>per m²</small></span>
          <span className="old-price">{money(product.old)}</span>
        </div>
        <div className="product-actions">
          <button
            className="primary-btn"
            type="button"
            onClick={() => addSample(product.slug)}
          >
            <PremiumIcon name="sample" /> Free sample
          </button>
          <Link className="secondary-btn" href={`/product/${product.slug}`}>
            View floor <PremiumIcon name="arrow" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function RoomsView({
  addToCart,
}: {
  addToCart: (slug: string, quantity: number) => void;
}) {
  return <LiveRoomVisualizer addToCart={addToCart} />;
}

function GuidesView() {
  const guideOptions: Array<{ title: string; copy: string; icon: IconName; id: string }> = [
    { title: "Choose your material", copy: "Understand engineered wood, LVT, laminate, solid wood and SPC before you order.", icon: "layers", id: "materials" },
    { title: "Measure your room", copy: "Work out square metres, waste allowance and how many packs your room needs.", icon: "ruler", id: "measuring" },
    { title: "Underfloor heating", copy: "Check suitable floor types, installation limits and temperature guidance.", icon: "care", id: "heating" },
    { title: "Fitting preparation", copy: "Prepare your subfloor, acclimatise packs and choose the right underlay.", icon: "install", id: "fitting" },
    { title: "Samples and colour", copy: "See samples in daylight, evening light and beside your furniture before choosing.", icon: "sample", id: "samples" },
    { title: "Care for your floor", copy: "Simple cleaning, furniture protection and long-term care for every material.", icon: "shield", id: "care" },
  ];

  return (
    <section className="section">
      <SectionHead
        eyebrow="Advice centre"
        title="Clear flooring help, before you buy."
        copy="Start with the question you have. Each guide turns the practical parts of choosing, measuring and fitting a floor into straightforward next steps."
      />
      <div className="guide-options-grid">
        {guideOptions.map((guide) => (
          <article className="guide-option" id={guide.id} key={guide.id}>
            <span><PremiumIcon name={guide.icon} /></span>
            <div><h3>{guide.title}</h3><p>{guide.copy}</p></div>
          </article>
        ))}
      </div>
      <section className="guide-answers" aria-label="Quick flooring answers">
        <p className="eyebrow">Quick answers</p>
        <h2>Common questions, answered simply.</h2>
        <details open><summary>Which flooring is best for kitchens and bathrooms?<span>+</span></summary><p>LVT and SPC are the safest waterproof choices. Laminate can work in selected kitchens when the product is rated for moisture and spills are cleaned quickly.</p></details>
        <details><summary>How much extra flooring should I order?<span>+</span></summary><p>Allow around 10% for a straightforward room. Choose 15% for herringbone, diagonal fitting or rooms with many cuts and corners.</p></details>
        <details><summary>Should I order a sample first?<span>+</span></summary><p>Yes. A sample lets you see the real tone and surface in your own daylight, next to your walls and furniture.</p></details>
        <details><summary>Can I ask for help before ordering?<span>+</span></summary><p>Yes. Use the floating WhatsApp control to message us, then switch to the video-call option if you want to show your room.</p></details>
      </section>
    </section>
  );
}

function DeliveryView() {
  return (
    <section className="section">
      <div className="delivery-panel">
        <p className="eyebrow">Delivery and service</p>
        <h1>Simple delivery, clear samples, expert support.</h1>
        <p>
          UNIQ FLOORS can be adapted to real delivery prices and regions. This
          concept includes the common ecommerce flow customers expect from a
          flooring retailer.
        </p>
        <div className="delivery-steps">
          <div>
            <span>
              <PremiumIcon name="sample" />
            </span>
            <h3>1. Order samples</h3>
            <p>
              Pick up to six free flooring samples and compare colours at home.
            </p>
          </div>
          <div>
            <span>
              <PremiumIcon name="ruler" />
            </span>
            <h3>2. Measure rooms</h3>
            <p>
              Use exact room measurements and add waste allowance before
              checkout.
            </p>
          </div>
          <div>
            <span>
              <PremiumIcon name="truck" />
            </span>
            <h3>3. Book delivery</h3>
            <p>Choose kerbside, room-of-choice or trade delivery options.</p>
          </div>
          <div>
            <span>
              <PremiumIcon name="fit" />
            </span>
            <h3>4. Fit and finish</h3>
            <p>
              Add underlay, trims, door bars and care products for a complete
              job.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { products, categories, productBySlug, categoryById, productsByCategory, content, selectionWhatsAppHref, whatsappHref, whatsappVideoHref, storeMapHref } = useStoreData();
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((product) => {
        const haystack =
          `${product.name} ${product.colour} ${product.finish} ${product.category} ${product.install}`.toLowerCase();
        return !q || haystack.includes(q);
      })
      .slice(0, 6);
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="search-modal"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="search-card">
        <button
          className="icon-btn close-search"
          type="button"
          onClick={onClose}
          aria-label="Close search"
        >
          <PremiumIcon name="x" />
        </button>
        <p className="eyebrow">Search UNIQ FLOORS</p>
        <label htmlFor="searchInput">
          <PremiumIcon name="search" /> Find a floor by name, colour, room or
          feature
        </label>
        <div className="search-input-wrap">
          <PremiumIcon name="scan" />
          <input
            id="searchInput"
            type="search"
            placeholder="Try oak, waterproof, herringbone..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
        </div>
        <div className="search-results">
          {matches.map((product) => (
            <Link
              className="search-result"
              href={`/product/${product.slug}`}
              onClick={onClose}
              key={product.slug}
            >
              <span className="thumb">
                <img src={product.image} alt="" />
              </span>
              <span>
                <strong>{product.name}</strong>
                <p>
                  {product.colour} - {money(product.price)} / m²
                </p>
              </span>
              <PremiumIcon name="arrow" />
            </Link>
          ))}
        </div>
        <button
          className="skip-popup search-skip"
          type="button"
          onClick={onClose}
        >
          Skip search
        </button>
      </div>
    </div>
  );
}

function SampleDrawer({
  open,
  samples,
  cartItems,
  onClose,
  onRemove,
  onRemoveCart,
  onChangeCartQuantity,
}: {
  open: boolean;
  samples: string[];
  cartItems: CartItem[];
  onClose: () => void;
  onRemove: (slug: string) => void;
  onRemoveCart: (slug: string) => void;
  onChangeCartQuantity: (slug: string, change: number) => void;
}) {
  const { products, categories, productBySlug, categoryById, productsByCategory, content, selectionWhatsAppHref, whatsappHref, whatsappVideoHref, storeMapHref } = useStoreData();
  const [deliveryNote, setDeliveryNote] = useState("");
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0) + samples.length;
  const recommendedProduct = products.find((product) => !cartItems.some((item) => item.slug === product.slug) && !samples.includes(product.slug));
  const subtotal = cartItems.reduce((total, item) => {
    const product = productBySlug(item.slug);
    return total + product.price * (product.packCoverage || 2.2) * item.quantity;
  }, 0);
  const basketWhatsAppHref = selectionWhatsAppHref("customer", [
    ...cartItems.map(item => { const product = productBySlug(item.slug); return { name: product.name, colour: product.colour, quantity: item.quantity, unit: "packs" as const }; }),
    ...samples.map(slug => { const product = productBySlug(slug); return { name: product.name, colour: product.colour, quantity: 1, unit: "samples" as const }; }),
  ]);
  const basketMessageUrl = new URL(basketWhatsAppHref);
  if (deliveryNote.trim()) {
    basketMessageUrl.searchParams.set("text", `${basketMessageUrl.searchParams.get("text") || ""}\n\nDelivery notes: ${deliveryNote.trim()}`);
  }

  return (
    <>
      {open ? <div className="drawer-backdrop" onClick={onClose} /> : null}
      <aside
        className={`sample-drawer ${open ? "open" : ""}`}
        aria-label="Shopping basket"
        aria-hidden={!open}
        role="dialog"
        aria-modal={open}
      >
        <div className="drawer-head">
          <div className="drawer-head-title"><h2>Bag</h2><span>{itemCount} {itemCount === 1 ? "item" : "items"}</span></div>
          <button className="drawer-head-shop" type="button" onClick={onClose}>Continue shopping</button>
          <button
            className="icon-btn"
            type="button"
            onClick={onClose}
            aria-label="Close shopping basket"
          >
            <PremiumIcon name="x" />
          </button>
        </div>
        <div className="drawer-scroll-content">
        <div className="drawer-request-note"><span aria-hidden="true" /> Samples are free. Our team confirms your order details.</div>
        {cartItems.length ? (
          <div className="cart-list">
            <p className="drawer-section-label">Flooring packs</p>
            {cartItems.map((item) => {
              const product = productBySlug(item.slug);
              return (
                <div className="cart-row" key={item.slug}>
                  <span className="thumb"><img src={product.image} alt="" /></span>
                  <span className="cart-row-copy"><strong>{product.name}</strong><small>{product.colour} · {money(product.price)} / m²</small><span className="cart-quantity"><span>Quantity</span><button type="button" aria-label={`Remove one pack of ${product.name}`} onClick={() => onChangeCartQuantity(item.slug, -1)}>−</button><output aria-label={`${item.quantity} packs`}>{item.quantity}</output><button type="button" aria-label={`Add one pack of ${product.name}`} onClick={() => onChangeCartQuantity(item.slug, 1)}>+</button></span></span>
                  <span className="cart-row-price"><b>{money(product.price * (product.packCoverage || 2.2) * item.quantity)}</b><button type="button" onClick={() => onRemoveCart(item.slug)}>Remove</button></span>
                </div>
              );
            })}
          </div>
        ) : null}
        <div className="sample-list">
          <p className="drawer-section-label">Free samples <span>{samples.length}</span></p>
          {samples.length ? (
            samples.map((slug) => {
              const product = productBySlug(slug);
              return (
                <div className="sample-row" key={slug}>
                  <span className="thumb">
                    <img src={product.image} alt="" />
                  </span>
                  <span>
                    <strong>{product.name}</strong>
                    <p>{product.colour}</p>
                  </span>
                  <button
                    className="icon-btn"
                    type="button"
                    aria-label={`Remove ${product.name}`}
                    onClick={() => onRemove(slug)}
                  >
                    <PremiumIcon name="x" />
                  </button>
                </div>
              );
            })
          ) : !cartItems.length ? (
            <div className="drawer-empty-state"><PremiumIcon name="package" /><h3>Your bag is empty.</h3><p>Find a floor you love, then request a sample or add packs here.</p><Link href="/shop" onClick={onClose}>Explore floors <PremiumIcon name="arrow" /></Link></div>
          ) : <p className="drawer-muted">No free samples added yet.</p>}
        </div>
        {recommendedProduct ? <div className="drawer-recommendation"><p>Recommended for you</p><Link href={`/product/${recommendedProduct.slug}`} onClick={onClose}><span className="thumb"><img src={recommendedProduct.image} alt="" /></span><span><strong>{recommendedProduct.name}</strong><small>{money(recommendedProduct.price)} / m²</small><span className="drawer-recommendation-action">View floor <ArrowUpRight size={14} /></span></span></Link></div> : null}
        </div>
        <div className="drawer-checkout">
        <details className="drawer-delivery-notes"><summary>Add delivery instructions <span aria-hidden="true">⌄</span></summary><label htmlFor="basket-delivery-note">Notes for our team</label><textarea id="basket-delivery-note" value={deliveryNote} onChange={(event) => setDeliveryNote(event.target.value)} maxLength={500} placeholder="Anything we should know about your delivery?" /></details>
        <div className="drawer-total">
          <span>{cartItems.length ? "Estimated subtotal" : "Sample subtotal"}</span>
          <strong>{cartItems.length ? money(subtotal) : "Free"}</strong>
        </div>
        {cartItems.length || samples.length ? <a className="primary-btn full" href={basketMessageUrl.toString()} target="_blank" rel="noopener noreferrer">Send enquiry on WhatsApp <ArrowUpRight size={17} /></a> : <button className="primary-btn full" type="button" disabled>Add flooring or samples to continue</button>}
        <p className="drawer-muted">Your request is reviewed by our team before any payment or delivery is arranged.</p>
        </div>
      </aside>
    </>
  );
}

function Footer() {
  const { content, whatsappHref, whatsappVideoHref, storeMapHref } = useStoreData();
  return (
    <footer className="site-footer minimal-footer uniq-directory-footer">
      <div className="uniq-footer-bridge">
        <Link className="uniq-footer-bridge-item" href="/shop">
          <span className="uniq-footer-bridge-icon" aria-hidden="true"><PremiumIcon name="home" /></span>
          <span className="uniq-footer-bridge-content">
            <small>For your home</small>
            <strong>Find the floor that feels like yours.</strong>
            <span>Explore floors, finishes and free samples.</span>
          </span>
          <ArrowUpRight className="uniq-footer-bridge-arrow" size={27} aria-hidden="true" />
        </Link>
        <Link className="uniq-footer-bridge-item" href="/retailers">
          <span className="uniq-footer-bridge-icon" aria-hidden="true"><PremiumIcon name="briefcase" /></span>
          <span className="uniq-footer-bridge-content">
            <small>For professionals</small>
            <strong>Make the right choice for every project.</strong>
            <span>Explore trade support and project sourcing.</span>
          </span>
          <ArrowUpRight className="uniq-footer-bridge-arrow" size={27} aria-hidden="true" />
        </Link>
      </div>
      <div className="uniq-footer-panel">
        <div className="minimal-footer-main">
          <div className="minimal-footer-brand">
            <Link className="brand footer-brand" href="/">
              <img className="footer-mini-logo" src="/assets/brand/uniq-mini-logo.png" alt="UNIQ Floors" />
              <span><strong>UNIQ FLOORS</strong><small>Flooring, clearly chosen.</small></span>
            </Link>
            <p>Distinctive floors and honest guidance for the spaces you live and work in.</p>
            <div className="minimal-footer-promises">
              <span><PremiumIcon name="sample" /> Free samples</span>
              <span><PremiumIcon name="shield" /> Price match</span>
              <span><PremiumIcon name="return" /> 30-day returns</span>
            </div>
          </div>

          <nav className="minimal-footer-links" aria-label="Footer shop links">
            <span>Explore flooring</span>
            <Link href="/shop">All floors</Link>
            <Link href="/category/engineered">Engineered wood</Link>
            <Link href="/category/lvt">Luxury vinyl</Link>
            <Link href="/category/herringbone">Herringbone</Link>
            <Link href="/carpets">Carpets</Link>
          </nav>

          <nav className="minimal-footer-links" aria-label="Footer help links">
            <span>UNIQ &amp; support</span>
            <Link href="/about">About us</Link>
            <Link href="/live-room">Live room view</Link>
            <Link href="/guides">Buying guides</Link>
            <Link href="/delivery">Delivery &amp; returns</Link>
            <a href={storeMapHref} target="_blank" rel="noreferrer">Visit our store</a>
          </nav>

          <div className="minimal-footer-contact">
            <span>Talk to us</span>
            <p>Questions about colour, samples or quantities? We can help.</p>
            {!!content.business?.business_email && <a className="uniq-footer-email" href={`mailto:${String(content.business.business_email)}`}>{String(content.business.business_email)}</a>}
            {!!content.business?.address && <p>{String(content.business.address)}</p>}
            <div className="uniq-footer-contact-actions">
              <a className="footer-whatsapp" href={whatsappHref} target="_blank" rel="noreferrer"><WhatsAppMark /> WhatsApp</a>
              <a className="footer-video-call" href={whatsappVideoHref} target="_blank" rel="noreferrer"><PremiumIcon name="video" /> Video call</a>
            </div>
          </div>
        </div>
      </div>

      <div className="minimal-footer-credit">
        <span>© 2026 UNIQ FLOORS</span>
        <a href="https://leafcreationism.in/" target="_blank" rel="noreferrer">
          Designed and developed by <strong>Leaf Creationism</strong><PremiumIcon name="arrow" />
        </a>
        <a className="uniq-footer-top" href="#app">Back to top <ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
    </footer>
  );
}

function SectionHead({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        <p className="eyebrow">
          <PremiumIcon name="sparkles" /> {eyebrow}
        </p>
        <h2>{title}</h2>
      </div>
      {copy ? <p>{copy}</p> : action}
    </div>
  );
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <div className="spec">
      <span>
        <PremiumIcon name={icon} /> {label}
      </span>
      <strong>{value}</strong>
    </div>
  );
}
