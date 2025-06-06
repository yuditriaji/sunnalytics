export interface TokenStats {
  priceChange24h: number;
  volatilityScore24h: number;
  liquidityScore: number;
  transferVolume24h: number;
}

export function calculateTokenStats(data: {
  price: number | null;
  marketCap: number | null;
  volume24h: number | null;
  circulatingSupply: number | null;
  totalSupply: number | null;
  priceChange24h?: number | null;
  transferAmount?: number;
}): TokenStats {
  const { price, marketCap, volume24h, circulatingSupply, priceChange24h, transferAmount } = data;

  const change24h = priceChange24h ?? 0;
  const volatility = volume24h && marketCap ? (volume24h / marketCap) : 0;
  const liquidityScore = volume24h && circulatingSupply ? volume24h / circulatingSupply : 0;
  const transferVol24h = transferAmount ?? 0;

  return {
    priceChange24h: Number(change24h.toFixed(2)),
    volatilityScore24h: Number(volatility.toFixed(2)),
    liquidityScore: Number(liquidityScore.toFixed(2)),
    transferVolume24h: Number(transferVol24h.toFixed(2)),
  };
}
