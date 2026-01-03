// components/RiskDashboard.tsx
import React from 'react';
import RiskGauge from './RiskGauge';
import { FaShieldAlt, FaWater, FaUsers, FaChartLine, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

interface RiskDashboardProps {
    pumpDumpRiskScore?: number;
    liquidityScore?: number;
    walletDistributionScore?: number;
    isVolumeHealthy?: boolean;
    volumeMarketCapRatio?: number;
}

const RiskDashboard: React.FC<RiskDashboardProps> = ({
    pumpDumpRiskScore,
    liquidityScore,
    walletDistributionScore,
    isVolumeHealthy,
    volumeMarketCapRatio,
}) => {
    // Calculate overall risk score (0 = safe, 100 = risky)
    const calculateOverallRisk = () => {
        let riskSum = 0;
        let count = 0;

        if (pumpDumpRiskScore !== undefined) {
            riskSum += pumpDumpRiskScore;
            count++;
        }
        if (liquidityScore !== undefined) {
            riskSum += (100 - liquidityScore); // Invert: low liquidity = high risk
            count++;
        }
        if (walletDistributionScore !== undefined) {
            riskSum += (100 - walletDistributionScore); // Invert: concentrated = high risk
            count++;
        }
        if (isVolumeHealthy !== undefined) {
            riskSum += isVolumeHealthy ? 0 : 70;
            count++;
        }

        return count > 0 ? riskSum / count : 50;
    };

    const overallRisk = calculateOverallRisk();

    // Risk factor card component
    const RiskFactorCard = ({
        icon,
        title,
        score,
        description,
        inverted = false, // If true, lower score = higher risk
    }: {
        icon: React.ReactNode;
        title: string;
        score: number | undefined;
        description: string;
        inverted?: boolean;
    }) => {
        const displayScore = score ?? 0;
        const riskLevel = inverted
            ? displayScore < 40 ? 'high' : displayScore < 70 ? 'medium' : 'low'
            : displayScore > 60 ? 'high' : displayScore > 30 ? 'medium' : 'low';

        const colors = {
            high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', bar: 'bg-red-500' },
            medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', bar: 'bg-yellow-500' },
            low: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', bar: 'bg-green-500' },
        };

        const color = colors[riskLevel];

        return (
            <div className={`p-4 rounded-lg ${color.bg} border ${color.border} transition-all hover:scale-[1.02]`}>
                <div className="flex items-center gap-3 mb-3">
                    <div className={`text-xl ${color.text}`}>{icon}</div>
                    <div>
                        <h4 className="font-semibold text-white">{title}</h4>
                        <p className="text-xs text-gray-400">{description}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl font-bold ${color.text}`}>
                        {score !== undefined ? `${score.toFixed(0)}%` : 'N/A'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${color.bg} ${color.text} font-medium`}>
                        {riskLevel.toUpperCase()}
                    </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full ${color.bar} transition-all duration-500`}
                        style={{ width: `${displayScore}%` }}
                    />
                </div>
            </div>
        );
    };

    // Warning/Insight cards
    const insights = [];

    if (pumpDumpRiskScore !== undefined && pumpDumpRiskScore > 70) {
        insights.push({
            type: 'warning',
            icon: <FaExclamationTriangle />,
            title: 'High Pump/Dump Risk',
            message: 'This token shows patterns consistent with pump and dump schemes. Exercise caution.',
        });
    }

    if (liquidityScore !== undefined && liquidityScore < 30) {
        insights.push({
            type: 'warning',
            icon: <FaExclamationTriangle />,
            title: 'Low Liquidity',
            message: 'Limited liquidity may cause high slippage and difficulty exiting positions.',
        });
    }

    if (walletDistributionScore !== undefined && walletDistributionScore < 30) {
        insights.push({
            type: 'warning',
            icon: <FaExclamationTriangle />,
            title: 'Concentrated Holdings',
            message: 'Token supply is concentrated in few wallets, increasing manipulation risk.',
        });
    }

    if (overallRisk < 30) {
        insights.push({
            type: 'success',
            icon: <FaCheckCircle />,
            title: 'Low Overall Risk',
            message: 'This token has healthy metrics across our risk indicators.',
        });
    }

    return (
        <div className="space-y-6">
            {/* Overall Risk Gauge */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
                <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center justify-center gap-2">
                        <FaShieldAlt className="text-yellow-400" />
                        Overall Risk Assessment
                    </h3>
                </div>
                <div className="flex justify-center">
                    <RiskGauge score={overallRisk} label="Composite Risk Score" size="lg" />
                </div>
            </div>

            {/* Individual Risk Factors */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <RiskFactorCard
                    icon={<FaExclamationTriangle />}
                    title="Pump/Dump Risk"
                    score={pumpDumpRiskScore}
                    description="Price manipulation indicators"
                    inverted={false}
                />
                <RiskFactorCard
                    icon={<FaWater />}
                    title="Liquidity Score"
                    score={liquidityScore}
                    description="Trading depth & ease of exit"
                    inverted={true}
                />
                <RiskFactorCard
                    icon={<FaUsers />}
                    title="Wallet Distribution"
                    score={walletDistributionScore}
                    description="Token holder concentration"
                    inverted={true}
                />
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${isVolumeHealthy ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} border`}>
                    <div className="flex items-center gap-3">
                        <FaChartLine className={`text-xl ${isVolumeHealthy ? 'text-green-400' : 'text-red-400'}`} />
                        <div>
                            <h4 className="font-semibold text-white">Volume Health</h4>
                            <p className={`text-sm ${isVolumeHealthy ? 'text-green-400' : 'text-red-400'}`}>
                                {isVolumeHealthy ? 'Healthy trading volume' : 'Unusual volume patterns'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-lg ${(volumeMarketCapRatio ?? 0) < 1 ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'} border`}>
                    <div className="flex items-center gap-3">
                        <FaChartLine className={`text-xl ${(volumeMarketCapRatio ?? 0) < 1 ? 'text-green-400' : 'text-yellow-400'}`} />
                        <div>
                            <h4 className="font-semibold text-white">Volume/MCap Ratio</h4>
                            <p className={`text-sm ${(volumeMarketCapRatio ?? 0) < 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                                {volumeMarketCapRatio !== undefined ? `${(volumeMarketCapRatio * 100).toFixed(2)}%` : 'N/A'}
                                {volumeMarketCapRatio !== undefined && volumeMarketCapRatio > 1 ? ' (High activity)' : ''}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insights & Warnings */}
            {insights.length > 0 && (
                <div className="space-y-2">
                    {insights.map((insight, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg flex items-start gap-3 ${insight.type === 'warning'
                                    ? 'bg-red-500/10 border border-red-500/30'
                                    : 'bg-green-500/10 border border-green-500/30'
                                }`}
                        >
                            <div className={`text-lg mt-0.5 ${insight.type === 'warning' ? 'text-red-400' : 'text-green-400'}`}>
                                {insight.icon}
                            </div>
                            <div>
                                <h4 className={`font-semibold ${insight.type === 'warning' ? 'text-red-400' : 'text-green-400'}`}>
                                    {insight.title}
                                </h4>
                                <p className="text-sm text-gray-400">{insight.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RiskDashboard;
