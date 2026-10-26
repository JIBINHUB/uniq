import type { Metadata } from "next";
import { AdminConsole } from "@/components/business/admin-console";
import "./admin.css";
import "./trade-quotes.css";
export const metadata: Metadata = { title: "Business workspace | UNIQ FLOORS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default function AdminPage() { return <AdminConsole tradeQuotesEnabled={process.env.TRADE_QUOTES_ENABLED === 'true'} />; }
