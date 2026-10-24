import facts from "./invictus-facts.json";
import type { ManufacturerProduct } from "./types";
export const manufacturerProducts = facts.products as ManufacturerProduct[];
export const manufacturerCollectionDate = facts.collectedAt;
export const catalogueStoreBrand = "UNIQ FLOORS";
