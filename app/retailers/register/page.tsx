import type { Metadata } from "next";
import { RetailerRegistration } from "@/components/business/retailer-registration";
import "../retailers.css";
export const metadata: Metadata = { title: "Apply for a retailer account | UNIQ FLOORS" };
export default function RetailerApplicationPage() { return <RetailerRegistration/>; }
