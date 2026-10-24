import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const client = await serverSupabase(true);
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) {
      const next = request.nextUrl.searchParams.get("next");
      const destination = next === "/admin" || next === "/retailers/studio" ? next : "/retailers/register";
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }
  return NextResponse.redirect(new URL("/retailers?verification=failed", request.url));
}
