const vatRate = 0.2;

export type TradeTier = { minimumPacks: number; discount: number; label: string };

export const tradeTiers: TradeTier[] = [
  { minimumPacks: 1, discount: 0.15, label: "Trade" },
  { minimumPacks: 10, discount: 0.2, label: "Project" },
  { minimumPacks: 25, discount: 0.25, label: "Volume" },
];

export function tradeTierForPacks(packs: number) {
  const safePacks = Math.max(1, Math.floor(Number(packs) || 1));
  return [...tradeTiers].reverse().find(tier => safePacks >= tier.minimumPacks) || tradeTiers[0];
}

export function estimatePiecesPerPack(dimensions: string, packCoverage = 2.2) {
  const values = dimensions.match(/[\d.]+/g)?.map(Number) || [];
  if (values.length < 2 || values[0] <= 0 || values[1] <= 0) return null;
  const pieceArea = (values[0] * values[1]) / 1_000_000;
  return Math.max(1, Math.round(packCoverage / pieceArea));
}

export function calculateTradeLine(retailPricePerSquareMetre: number, packCoverage = 2.2, packs = 1, dimensions = "") {
  const quantity = Math.max(1, Math.floor(Number(packs) || 1));
  const coverage = Math.max(0.01, Number(packCoverage) || 2.2);
  const retailExVatPence = Math.max(0, Number(retailPricePerSquareMetre) || 0) * 100 / (1 + vatRate);
  const tier = tradeTierForPacks(quantity);
  const packPricePence = Math.round(retailExVatPence * coverage * (1 - tier.discount));
  const piecesPerPack = estimatePiecesPerPack(dimensions, coverage);
  const subtotalPence = packPricePence * quantity;
  const vatPence = Math.round(subtotalPence * vatRate);

  return {
    packs: quantity,
    coverage,
    piecesPerPack,
    totalPieces: piecesPerPack ? piecesPerPack * quantity : null,
    totalCoverage: Number((coverage * quantity).toFixed(2)),
    tier,
    packPricePence,
    piecePricePence: piecesPerPack ? Math.round(packPricePence / piecesPerPack) : null,
    squareMetrePricePence: Math.round(packPricePence / coverage),
    subtotalPence,
    vatPence,
    totalPence: subtotalPence + vatPence,
  };
}

export function nextTradeTier(packs: number) {
  return tradeTiers.find(tier => tier.minimumPacks > Math.max(0, Math.floor(Number(packs) || 0)));
}
