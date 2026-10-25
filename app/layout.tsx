import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { SiteTransitionLoader } from "../components/site-loader";
import "./globals.css";
import "./home-refinements.css";
import "./live-room.css";
import "./product-redesign.css";
import "./storefront-theme.css";
import "./manufacturer-catalogue.css";
import "./home-motion.css";
import "./shop-intro-controls.css";
import "./product-mobile-polish.css";
import "./blunt-reference.css";
import "./home-featured-motion.css";
import "./matcha-theme.css";
import "./home-floor-editorial.css";
import "./about-editorial.css";
import "./cart-polish.css";
import "./real-homes-editorial.css";
import "./sample-palette-refresh.css";
import "./before-after-refresh.css";
import "./pill-nav.css";
import "./home-category-blocks.css";
import "./shop-manufacturer-editorial.css";
import "./footer-directory.css";
import "./contact-guide.css";
import "./account-design.css";
import "./manufacturer-product-refresh.css";
import "./editorial-labels-cleanup.css";
import "./hero-reviews.css";
import "./home-benefits.css";
import "./home-proof-samples.css";
import "./retailer-account-unified.css";
import "./storefront-responsive-finish.css";

const productSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-product-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "UNIQ FLOORS | Distinctive Wood, LVT and Laminate Flooring",
  description:
    "A premium Next.js flooring store with distinctive product imagery, rich flooring palettes, samples, room inspiration and buying guides.",
  icons: {
    icon: "/assets/brand/uniq-mini-logo.png",
    shortcut: "/assets/brand/uniq-mini-logo.png",
    apple: "/assets/brand/uniq-mini-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={productSans.variable}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <SiteTransitionLoader />
        {children}
      </body>
    </html>
  );
}
