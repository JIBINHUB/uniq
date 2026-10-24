import { requireAdmin } from '@/lib/supabase/server';
import { privateHeaders as headers, HttpError, failure } from '@/lib/owner/http';

export const dynamic = 'force-dynamic';
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

export async function GET() {
  if (process.env.TRADE_QUOTES_ENABLED !== 'true') return Response.json({ error: 'Trade requests are not active yet.' }, { status: 503, headers });
  try {
    const { supabase, authorized, status } = await requireAdmin();
    if (!authorized) throw new HttpError('Owner access required.', status);
    const { data, error } = await supabase.from('trade_quote_requests')
      .select('id,business_name,items,subtotal_pence,vat_pence,estimated_total_pence,status,review_notes,created_at')
      .order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return Response.json({ requests: data }, { headers });
  } catch (error) { return failure(error); }
}

export async function PATCH(request: Request) {
  if (process.env.TRADE_QUOTES_ENABLED !== 'true') return Response.json({ error: 'Trade requests are not active yet.' }, { status: 503, headers });
  try {
    const origin = request.headers.get('origin');
    if (!origin || new URL(origin).host !== (request.headers.get('host') || new URL(request.url).host)) throw new HttpError('Invalid request origin.', 403);
    const { supabase, authorized, status } = await requireAdmin();
    if (!authorized) throw new HttpError('Owner access required.', status);
    const bodyText = await request.text();
    if (bodyText.length > 5000) throw new HttpError('Request too large.', 413);
    const body = JSON.parse(bodyText);
    if (typeof body.id !== 'string' || !uuid.test(body.id) || !['pending', 'approved', 'rejected'].includes(body.status)) throw new HttpError('Invalid quotation decision.', 400);
    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 4000) : '';
    const { data, error } = await supabase.from('trade_quote_requests')
      .update({ status: body.status, review_notes: notes }).eq('id', body.id)
      .select('id,status,review_notes').single();
    if (error) throw error;
    return Response.json({ request: data }, { headers });
  } catch (error) { return failure(error); }
}
