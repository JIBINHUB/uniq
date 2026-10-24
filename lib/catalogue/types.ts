export type ManufacturerVariant = {
  id: string;
  name: string;
  colourCode: string;
  sku: string;
  dimensions: string;
  widths: number[];
  specifications: { label: string; value: string }[];
  warrantyYears: string[];
  bleachCleanable: boolean;
  sourceUrl: string;
};
export type ManufacturerProduct = {
  image?: string;
  slug: string;
  name: string;
  brand: string;
  collection: string;
  category: "lvt" | "carpet";
  variants: ManufacturerVariant[];
};
export function materialIllustration(product: ManufacturerProduct, colourName = "") {
  if (product.image) return product.image;
  if (product.category === "carpet") return /grey|gray|silver|charcoal|slate|steel/i.test(colourName) ? "/assets/material-illustrations/carpet-grey.webp" : "/assets/material-illustrations/carpet.webp";
  if (/stone|slate|concrete|limestone|marble|travertine|granite/i.test(product.name)) return "/assets/material-illustrations/stone.webp";
  if (/parquet|herringbone/i.test(product.name)) return "/assets/material-illustrations/parquet.webp";
  if (/smoke|charcoal|dark|black|ebony/i.test(colourName)) return "/assets/material-illustrations/wood-dark.webp";
  return "/assets/material-illustrations/wood.webp";
}
