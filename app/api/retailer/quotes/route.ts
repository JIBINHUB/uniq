import { serverSupabase } from '@/lib/supabase/server';
import { hasOwnerService, ownerService } from '@/lib/owner/service';
import { storefrontData } from '@/lib/owner/catalogue';
import { buildTradeQuote } from '@/lib/business/trade-quote';
import { isApprovedRetailer } from '@/lib/business/retailer-access';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store' };
const fail = (error: string, status: number) => Response.json({ error }, { status, headers });

async function approvedAccount() {
  const db = await serverSupabase();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user?.email_confirmed_at) return null;
  const [role, profile] = await Promise.all([
    db.from('user_roles').select('role').eq('user_id', user.id).maybeSingle(),
    db.from('retailer_profiles').select('business_name,status').eq('user_id', user.id).maybeSingle(),
  ]);
  if (role.error || profile.error || !isApprovedRetailer(role.data?.role, profile.data?.status)) return null;
  return { db, user, businessName: String(profile.data!.business_name) };
}

export async function GET() {
  if (process.env.TRADE_QUOTES_ENABLED !== 'true') return fail('Quotation history is not available yet.', 503);
  const account = await approvedAccount();
  if (!account) return fail('Approved retailer access required.', 403);
  const { data, error } = await account.db.from('trade_quote_requests')
    .select('id,items,estimated_total_pence,status,review_notes,created_at')
    .eq('user_id', account.user.id).order('created_at', { ascending: false }).limit(30);
  if (error) return fail('Quotation history is currently unavailable.', 503);
  return Response.json({ requests: data }, { headers });
}

export async function POST(request: Request) {
  if (process.env.TRADE_QUOTES_ENABLED !== 'true') return fail('Quotation requests are not available yet.', 503);
  const origin = request.headers.get('origin');
  if (!origin || new URL(origin).host !== (request.headers.get('host') || new URL(request.url).host)) return fail('Invalid request origin.', 403);
  const account = await approvedAccount();
  if (!account) return fail('Sign in with an approved retailer account to request a quotation.', 403);
  if (!hasOwnerService()) return fail('Quotation requests are not available until the secure backend is configured.', 503);
  let payload: { items?: unknown; idempotency_key?: unknown };
  try {
    const body = await request.text();
    if (body.length > 5000) return fail('Request too large.', 413);
    payload = JSON.parse(body);
  } catch { return fail('Invalid request.', 400); }
  if (typeof payload.idempotency_key !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(payload.idempotency_key)) return fail('Invalid request key.', 400);
  let quote: ReturnType<typeof buildTradeQuote>;
  try { quote = buildTradeQuote(payload.items, (await storefrontData('supabase')).products); }
  catch (error) { return fail(error instanceof Error ? error.message : 'Invalid selection.', 400); }
  const db = ownerService();
  const { data, error } = await db.from('trade_quote_requests').insert({
    user_id: account.user.id,
    idempotency_key: payload.idempotency_key,
    business_name: account.businessName,
    items: quote.lines,
    subtotal_pence: quote.subtotal_pence,
    vat_pence: quote.vat_pence,
    estimated_total_pence: quote.estimated_total_pence,
    status: 'new',
  }).select('id,status,estimated_total_pence').single();
  if (error?.code === '23505') {
    const existing = await db.from('trade_quote_requests').select('id,status,estimated_total_pence')
      .eq('user_id', account.user.id).eq('idempotency_key', payload.idempotency_key).single();
    if (!existing.error) return Response.json({ request: existing.data, alreadySaved: true }, { headers });
  }
  if (error || !data) return fail('Your quotation request could not be saved. Please try again.', 503);
  return Response.json({ request: data }, { status: 201, headers });
}
