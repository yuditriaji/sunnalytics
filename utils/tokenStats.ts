// Utility functions for calculating token analytics and statistics

export interface TokenMetrics {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  investmentGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  signals: {
    bullish: string[];
    bearish: string[];
    neutral: string[];
  };
}

export const calculateTokenMetrics = (token: any): TokenMetrics => {
  const signals = {
    bullish: [] as string[],
    bearish: [] as string[],
    neutral: [] as string[],
  };

  // Calculate overall score (0-100)
  let scoreComponents = [];
  
  // Liquidity Score Component (0-25)
  if (token.liquidityScore !== undefined) {
    const liquidityComponent = (token.liquidityScore / 100) * 25;
    scoreComponents.push(liquidityComponent);
    
    if (token.liquidityScore >= 70) {
      signals.bullish.push('High liquidity');
    } else if (token.liquidityScore < 30) {
      signals.bearish.push('Low liquidity');
    }
  }

  // Volume Health Component (0-25)
  if (token.isVolumeHealthy !== undefined) {
    const volumeComponent = token.isVolumeHealthy ? 25 : 5;
    scoreComponents.push(volumeComponent);
    
    if (token.isVolumeHealthy) {
      signals.bullish.push('Healthy trading volume');
    } else {
      signals.bearish.push('Unhealthy trading volume');
    }
  }

  // Risk Score Component (0-25) - Inverse of pump/dump risk
  if (token.pumpDumpRiskScore !== undefined) {
    const riskComponent = ((100 - token.pumpDumpRiskScore) / 100) * 25;
    scoreComponents.push(riskComponent);
    
    if (token.pumpDumpRiskScore <= 30) {
      signals.bullish.push('Low pump & dump risk');
    } else if (token.pumpDumpRiskScore >= 70) {
      signals.bearish.push('High pump & dump risk');
    }
  }

  // Distribution Score Component (0-25)
  if (token.walletDistributionScore !== undefined) {
    const distributionComponent = (token.walletDistributionScore / 100) * 25;
    scoreComponents.push(distributionComponent);
    
    if (token.walletDistributionScore >= 70) {
      signals.bullish.push('Good wallet distribution');
    } else if (token.walletDistributionScore < 30) {
      signals.bearish.push('Poor wallet distribution');
    }
  }

  // Volume/Market Cap Ratio Analysis
  if (token.volumeMarketCapRatio !== undefined) {
    if (token.volumeMarketCapRatio > 2) {
      signals.bearish.push('Extremely high volume/market cap ratio (possible manipulation)');
    } else if (token.volumeMarketCapRatio > 1) {
      signals.neutral.push('High trading activity');
    } else if (token.volumeMarketCapRatio > 0.5) {
      signals.bullish.push('Healthy volume/market cap ratio');
    } else if (token.volumeMarketCapRatio < 0.1) {
      signals.bearish.push('Very low trading activity');
    }
  }

  // Calculate overall score
  const overallScore = scoreComponents.length > 0
    ? scoreComponents.reduce((a, b) => a + b, 0) / scoreComponents.length * 4
    : 50;

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'very-high' = 'medium';
  const riskFactors = [];
  
  if (token.pumpDumpRiskScore && token.pumpDumpRiskScore > 70) riskFactors.push('pump-dump');
  if (token.liquidityScore && token.liquidityScore < 30) riskFactors.push('liquidity');
  if (token.walletDistributionScore && token.walletDistributionScore < 30) riskFactors.push('distribution');
  if (!token.isVolumeHealthy) riskFactors.push('volume');
  if (token.volumeMarketCapRatio && token.volumeMarketCapRatio > 2) riskFactors.push('manipulation');

  if (riskFactors.length === 0) {
    riskLevel = 'low';
  } else if (riskFactors.length === 1) {
    riskLevel = 'medium';
  } else if (riskFactors.length <= 3) {
    riskLevel = 'high';
  } else {
    riskLevel = 'very-high';
  }

  // Determine investment grade
  let investmentGrade: 'A' | 'B' | 'C' | 'D' | 'F' = 'C';
  if (overallScore >= 80 && riskLevel === 'low') {
    investmentGrade = 'A';
  } else if (overallScore >= 70 && (riskLevel === 'low' || riskLevel === 'medium')) {
    investmentGrade = 'B';
  } else if (overallScore >= 50) {
    investmentGrade = 'C';
  } else if (overallScore >= 30) {
    investmentGrade = 'D';
  } else {
    investmentGrade = 'F';
  }

  return {
    overallScore,
    riskLevel,
    investmentGrade,
    signals,
  };
};

export const getVolumeHealthStatus = (volumeMarketCapRatio?: number): {
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  color: string;
  description: string;
} => {
  if (volumeMarketCapRatio === undefined) {
    return {
      status: 'unknown',
      color: 'text-gray-400',
      description: 'No volume data available',
    };
  }

  if (volumeMarketCapRatio > 2) {
    return {
      status: 'poor',
      color: 'text-red-400',
      description: 'Extremely high volume - possible manipulation',
    };
  } else if (volumeMarketCapRatio > 1) {
    return {
      status: 'fair',
      color: 'text-yellow-400',
      description: 'High trading activity - monitor closely',
    };
  } else if (volumeMarketCapRatio > 0.5) {
    return {
      status: 'excellent',
      color: 'text-green-400',
      description: 'Healthy trading volume',
    };
  } else if (volumeMarketCapRatio > 0.1) {
    return {
      status: 'good',
      color: 'text-blue-400',
      description: 'Normal trading activity',
    };
  } else {
    return {
      status: 'poor',
      color: 'text-red-400',
      description: 'Very low trading activity',
    };
  }
};

export const calculatePriceVolatility = (priceHistory: number[]): {
  volatility: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number;
} => {
  if (!priceHistory || priceHistory.length < 2) {
    return {
      volatility: 0,
      trend: 'neutral',
      strength: 0,
    };
  }

  // Calculate standard deviation
  const mean = priceHistory.reduce((a, b) => a + b, 0) / priceHistory.length;
  const squaredDiffs = priceHistory.map(price => Math.pow(price - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / priceHistory.length;
  const volatility = Math.sqrt(variance) / mean * 100;

  // Calculate trend
  const firstHalf = priceHistory.slice(0, Math.floor(priceHistory.length / 2));
  const secondHalf = priceHistory.slice(Math.floor(priceHistory.length / 2));
  const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const trendStrength = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  
  let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (trendStrength > 5) trend = 'bullish';
  else if (trendStrength < -5) trend = 'bearish';

  return {
    volatility,
    trend,
    strength: Math.abs(trendStrength),
  };
};

export const getMarketSentiment = (
  priceChange24h?: number,
  volumeChange24h?: number
): {
  sentiment: 'very-bullish' | 'bullish' | 'neutral' | 'bearish' | 'very-bearish';
  confidence: number;
} => {
  if (priceChange24h === undefined && volumeChange24h === undefined) {
    return {
      sentiment: 'neutral',
      confidence: 0,
    };
  }

  let sentimentScore = 0;
  let dataPoints = 0;

  if (priceChange24h !== undefined) {
    if (priceChange24h > 10) sentimentScore += 2;
    else if (priceChange24h > 5) sentimentScore += 1;
    else if (priceChange24h < -10) sentimentScore -= 2;
    else if (priceChange24h < -5) sentimentScore -= 1;
    dataPoints++;
  }

  if (volumeChange24h !== undefined) {
    if (volumeChange24h > 50) sentimentScore += 1;
    else if (volumeChange24h < -50) sentimentScore -= 1;
    dataPoints++;
  }

  const confidence = (dataPoints / 2) * 100;

  let sentiment: 'very-bullish' | 'bullish' | 'neutral' | 'bearish' | 'very-bearish' = 'neutral';
  if (sentimentScore >= 2) sentiment = 'very-bullish';
  else if (sentimentScore >= 1) sentiment = 'bullish';
  else if (sentimentScore <= -2) sentiment = 'very-bearish';
  else if (sentimentScore <= -1) sentiment = 'bearish';

  return {
    sentiment,
    confidence,
  };
};

export const formatLargeNumber = (num: number): string => {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
};

export const calculateROI = (
  currentPrice: number,
  entryPrice: number,
  includePercentage: boolean = true
): string => {
  const roi = ((currentPrice - entryPrice) / entryPrice) * 100;
  return includePercentage ? `${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%` : roi.toFixed(2);
};
