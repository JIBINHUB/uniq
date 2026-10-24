import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ownerCookie, verifyOwnerSession } from "@/lib/owner/pin";
import { ownerService, hasOwnerService, checkOwnerSession } from "@/lib/owner/service";
import { supabaseConfig } from "./config";
export async function serverSupabase(writable = false) {
  const { url, key } = supabaseConfig();
  const jar = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll(values) {
        if (writable) values.forEach(({ name, value, options }) => jar.set(name, value, options));
      },
    },
  });
}
export async function requireAdmin() {
  const mode = verifyOwnerSession((await cookies()).get(ownerCookie)?.value, process.env.OWNER_ACCESS_SECRET || "");
  if (mode === "live" && hasOwnerService() && await checkOwnerSession((await cookies()).get(ownerCookie)!.value)) return { supabase: ownerService(), authorized: true, status: 403, user: null };
  const supabase = await serverSupabase(true);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { supabase, authorized: false as const, status: 401, user: null };
  const { data: role, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).maybeSingle();
  return { supabase, authorized: !roleError && role?.role === "admin", status: 403, user: data.user };
}
