import { requireAdmin } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export async function GET() {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const { supabase, authorized, status } = await requireAdmin();
    if (!authorized) return Response.json({ error: "Administrator access required." }, { status, headers });
    const tables = ["products", "categories", "enquiries", "sample_requests", "retailer_applications", "quotations", "invoices", "support_tickets"] as const;
    const rows = await Promise.all(tables.map(async table => {
      const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
      if (error) throw error;
      return [table, count ?? 0] as const;
    }));
    return Response.json({ counts: Object.fromEntries(rows) }, { headers });
  } catch {
    return Response.json({ error: "The business database is not ready. Contact the administrator." }, { status: 503, headers });
  }
}
