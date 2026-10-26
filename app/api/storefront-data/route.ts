import { storefrontData } from '@/lib/owner/catalogue';

export const dynamic = 'force-dynamic';

export async function GET() {
  const timings:string[]=[];
  const data = await storefrontData('supabase',timings);
  return Response.json(data, {
    headers: { 'Cache-Control': 'public, max-age=15, s-maxage=30, stale-while-revalidate=60', 'Server-Timing': timings.join(', ') },
  });
}
