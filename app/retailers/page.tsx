import type { Metadata } from "next";
import { RetailerLogin } from "@/components/business/retailer-login";
import "./retailers.css";
export const metadata:Metadata={title:"Retailer access | UNIQ FLOORS",description:"Sign in to your UNIQ FLOORS retailer account to browse flooring and contact our trade team."};
export default function RetailersPage(){return <RetailerLogin/>;}
