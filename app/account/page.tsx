import type { Metadata } from "next";
import { AccountEntrance } from "@/components/account-entrance";

export const metadata: Metadata = {
  title: "Your account | UNIQ FLOORS",
  description: "Sign in to your UNIQ FLOORS customer or retailer account.",
};

export default function AccountPage() {
  return <AccountEntrance />;
}
