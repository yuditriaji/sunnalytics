import React from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

interface RiskIndicatorProps {
  pumpDumpRiskScore?: number;
  liquidityScore?: number;
  walletDistributionScore?: number;
  isVolumeHealthy?: boolean;
  volumeMarketCapRatio?: number;
  compact?: boolean;
}

const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  pumpDumpRiskScore,
  liquidityScore,
  walletDistributionScore,
  isVolumeHealthy,
  volumeMarketCapRatio,
  compact = false,
}) => {
  // Calculate overall risk level
  const calculateRiskLevel = () => {
    let riskPoints = 0;
    let totalPoints = 0;

    // Pump/Dump Risk (higher score = higher risk)
    if (pumpDumpRiskScore !== undefined) {
      totalPoints += 100;
      if (pumpDumpRiskScore > 70) riskPoints += 100;
      else if (pumpDumpRiskScore > 50) riskPoints += 60;
      else if (pumpDumpRiskScore > 30) riskPoints += 30;
    }

    // Liquidity Score (lower score = higher risk)
    if (liquidityScore !== undefined) {
      totalPoints += 100;
      if (liquidityScore < 30) riskPoints += 100;
      else if (liquidityScore < 50) riskPoints += 60;
      else if (liquidityScore < 70) riskPoints += 30;
    }

    // Wallet Distribution (lower score = higher risk)
    if (walletDistributionScore !== undefined) {
      totalPoints += 100;
      if (walletDistributionScore < 30) riskPoints += 100;
      else if (walletDistributionScore < 50) riskPoints += 60;
      else if (walletDistributionScore < 70) riskPoints += 30;
    }

    // Volume Health
    if (isVolumeHealthy !== undefined) {
      totalPoints += 100;
      if (!isVolumeHealthy) riskPoints += 100;
    }

    // Volume/Market Cap Ratio (very high or very low = risky)
    if (volumeMarketCapRatio !== undefined) {
      totalPoints += 100;
      if (volumeMarketCapRatio > 2 || volumeMarketCapRatio < 0.01) riskPoints += 100;
      else if (volumeMarketCapRatio > 1.5 || volumeMarketCapRatio < 0.05) riskPoints += 60;
      else if (volumeMarketCapRatio > 1 || volumeMarketCapRatio < 0.1) riskPoints += 30;
    }

    if (totalPoints === 0) return 'unknown';

    const riskPercentage = (riskPoints / totalPoints) * 100;
    if (riskPercentage >= 70) return 'high';
    if (riskPercentage >= 40) return 'medium';
    return 'low';
  };

  const riskLevel = calculateRiskLevel();

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-500 bg-red-500';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500';
      case 'low':
        return 'text-green-500 bg-green-500';
      default:
        return 'text-gray-500 bg-gray-500';
    }
  };

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'high':
        return <FaExclamationTriangle className="w-4 h-4" />;
      case 'medium':
        return <FaExclamationCircle className="w-4 h-4" />;
      case 'low':
        return <FaCheckCircle className="w-4 h-4" />;
      default:
        return <FaExclamationCircle className="w-4 h-4" />;
    }
  };

  const getRiskLabel = () => {
    switch (riskLevel) {
      case 'high':
        return 'High Risk';
      case 'medium':
        return 'Medium Risk';
      case 'low':
        return 'Low Risk';
      default:
        return 'Risk Unknown';
    }
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center ${getRiskColor().split(' ')[0]}`} title={getRiskLabel()}>
        {getRiskIcon()}
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${getRiskColor().split(' ')[1]} bg-opacity-20 ${getRiskColor().split(' ')[0]}`}>
        {getRiskIcon()}
        <span className="text-sm font-medium">{getRiskLabel()}</span>
      </div>

      {/* Tooltip with detailed breakdown */}
      <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm rounded-lg p-4 mt-2 w-64 shadow-lg border border-gray-700">
        <h4 className="font-semibold mb-2">Risk Assessment Breakdown</h4>
        <ul className="space-y-1">
          {pumpDumpRiskScore !== undefined && (
            <li className="flex justify-between">
              <span>Pump/Dump Risk:</span>
              <span className={pumpDumpRiskScore > 70 ? 'text-red-400' : pumpDumpRiskScore > 30 ? 'text-yellow-400' : 'text-green-400'}>
                {pumpDumpRiskScore.toFixed(1)}%
              </span>
            </li>
          )}
          {liquidityScore !== undefined && (
            <li className="flex justify-between">
              <span>Liquidity Score:</span>
              <span className={liquidityScore < 30 ? 'text-red-400' : liquidityScore < 70 ? 'text-yellow-400' : 'text-green-400'}>
                {liquidityScore.toFixed(1)}
              </span>
            </li>
          )}
          {walletDistributionScore !== undefined && (
            <li className="flex justify-between">
              <span>Wallet Distribution:</span>
              <span className={walletDistributionScore < 30 ? 'text-red-400' : walletDistributionScore < 70 ? 'text-yellow-400' : 'text-green-400'}>
                {walletDistributionScore.toFixed(1)}
              </span>
            </li>
          )}
          {isVolumeHealthy !== undefined && (
            <li className="flex justify-between">
              <span>Volume Health:</span>
              <span className={isVolumeHealthy ? 'text-green-400' : 'text-red-400'}>
                {isVolumeHealthy ? 'Healthy' : 'Unhealthy'}
              </span>
            </li>
          )}
          {volumeMarketCapRatio !== undefined && (
            <li className="flex justify-between">
              <span>Vol/MCap Ratio:</span>
              <span className={
                volumeMarketCapRatio > 2 || volumeMarketCapRatio < 0.01 ? 'text-red-400' : 
                volumeMarketCapRatio > 1 || volumeMarketCapRatio < 0.1 ? 'text-yellow-400' : 
                'text-green-400'
              }>
                {(volumeMarketCapRatio * 100).toFixed(2)}%
              </span>
            </li>
          )}
        </ul>
        <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
          <p>Risk levels are calculated based on multiple factors. High risk doesn't always mean bad investment, but requires careful consideration.</p>
        </div>
      </div>
    </div>
  );
};

export default RiskIndicator;
