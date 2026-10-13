import type { Metadata } from "next";
import { Geist, Host_Grotesk, Manrope, Outfit } from "next/font/google";
import { SiteTransitionLoader } from "../components/site-loader";
import "./globals.css";
import "./home-refinements.css";
import "./live-room.css";
import "./product-redesign.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

const hostGrotesk = Host_Grotesk({
  subsets: ["latin"],
  variable: "--font-host-grotesk",
  weight: ["400", "500", "600", "700"],
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800"],
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
      className={`${manrope.variable} ${hostGrotesk.variable} ${geist.variable} ${outfit.variable}`}
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
