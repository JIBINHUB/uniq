export const teamWhatsAppNumber = "447938373500";

export type FlooringSelection = {
  name: string;
  colour: string;
  quantity: number;
  unit: "packs" | "samples" | "m²";
  area?: string;
};

export function selectionWhatsAppHref(channel: "customer" | "retailer", items: FlooringSelection[], businessName?: string, destination = teamWhatsAppNumber) {
  const lines = items.map((item, index) => `${index + 1}. ${item.name} — ${item.colour}\n   ${item.quantity} ${item.unit}${item.area ? ` · floor area ${item.area} m²` : ""}`);
  const message = [
    channel === "retailer" ? "Hello UNIQ FLOORS, I would like to discuss a trade order." : "Hello UNIQ FLOORS, I would like to order flooring for my home.",
    businessName ? `Business: ${businessName}` : "",
    ...lines,
    "Please confirm availability, quantities, current prices, delivery and payment arrangements. This is an enquiry, not a confirmed order.",
  ].filter(Boolean).join("\n\n");
  return `https://wa.me/${/^\d{8,15}$/.test(destination)?destination:teamWhatsAppNumber}?text=${encodeURIComponent(message)}`;
}
