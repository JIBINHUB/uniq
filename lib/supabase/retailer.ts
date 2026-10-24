import "server-only";
import { serverSupabase } from "./server";
import { isApprovedRetailer } from "@/lib/business/retailer-access";

export async function retailerAccess() {
  const client = await serverSupabase();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user?.email_confirmed_at) return { state: "signin" as const };
  const [role, profile] = await Promise.all([
    client.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
    client.from("retailer_profiles").select("business_name,status").eq("user_id", user.id).maybeSingle(),
  ]);
  const { data: staff } = await client.from("staff_members").select("enabled").eq("user_id", user.id).maybeSingle();
  if (role.data?.role === "admin" || staff?.enabled === true) return { state: "approved" as const, businessName: "Staff preview", quoteEligible: false };
  if (role.error || profile.error) return { state: "unavailable" as const };
  if (!isApprovedRetailer(role.data?.role, profile.data?.status)) return { state: "approval" as const };
  return { state: "approved" as const, businessName: profile.data!.business_name as string, quoteEligible: true };
}
