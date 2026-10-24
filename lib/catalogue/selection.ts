export type MaterialSelection = { id: string; area: number; width?: number };
export function selectionStorageKey(channel: "customer" | "retailer") { return `uniqMaterialSelectionV1:${channel}`; }
export function parseMaterialSelection(raw: string | null, validIds: Set<string>): MaterialSelection[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const valid = value.filter(item => typeof item?.id === "string" && validIds.has(item.id) && typeof item.area === "number" && Number.isFinite(item.area) && item.area > 0 && item.area <= 10000).map(item => ({id:item.id,area:item.area,...(typeof item.width === "number" && Number.isFinite(item.width) && item.width>0 && item.width<=10 ? {width:item.width} : {})}));
    return [...new Map(valid.map(item => [item.id,item])).values()].slice(0,30);
  } catch { return []; }
}
