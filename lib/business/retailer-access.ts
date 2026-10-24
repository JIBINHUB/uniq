export function isApprovedRetailer(role: string | undefined, profileStatus: string | undefined) {
  return role === "retailer" && profileStatus === "approved";
}
