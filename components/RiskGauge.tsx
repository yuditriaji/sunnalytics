// components/RiskGauge.tsx
import React from 'react';

interface RiskGaugeProps {
    score: number; // 0-100, where 0 = safe, 100 = risky
    label?: string;
    size?: 'sm' | 'md' | 'lg';
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ score, label = 'Risk Score', size = 'md' }) => {
    // Clamp score between 0 and 100
    const clampedScore = Math.max(0, Math.min(100, score));

    // Calculate gauge dimensions based on size
    const dimensions = {
        sm: { width: 120, strokeWidth: 8, fontSize: 24 },
        md: { width: 160, strokeWidth: 10, fontSize: 32 },
        lg: { width: 200, strokeWidth: 12, fontSize: 40 },
    };

    const { width, strokeWidth, fontSize } = dimensions[size];
    const radius = (width - strokeWidth) / 2;
    const circumference = radius * Math.PI; // Half circle
    const offset = circumference - (clampedScore / 100) * circumference;

    // Color gradient based on score
    const getColor = (score: number) => {
        if (score <= 30) return { from: '#10B981', to: '#34D399', text: 'text-green-400', label: 'LOW RISK' };
        if (score <= 60) return { from: '#F59E0B', to: '#FBBF24', text: 'text-yellow-400', label: 'MEDIUM' };
        return { from: '#EF4444', to: '#F87171', text: 'text-red-400', label: 'HIGH RISK' };
    };

    const color = getColor(clampedScore);

    return (
        <div className="flex flex-col items-center">
            <svg
                width={width}
                height={width / 2 + 20}
                viewBox={`0 0 ${width} ${width / 2 + 20}`}
                className="transform"
            >
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id={`gauge-gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color.from} />
                        <stop offset="100%" stopColor={color.to} />
                    </linearGradient>
                    {/* Glow filter */}
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background Track */}
                <path
                    d={`M ${strokeWidth / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - strokeWidth / 2} ${width / 2}`}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />

                {/* Progress Arc */}
                <path
                    d={`M ${strokeWidth / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - strokeWidth / 2} ${width / 2}`}
                    fill="none"
                    stroke={`url(#gauge-gradient-${score})`}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out"
                    filter="url(#glow)"
                />

                {/* Score Text */}
                <text
                    x={width / 2}
                    y={width / 2 - 10}
                    textAnchor="middle"
                    className={`font-bold ${color.text}`}
                    style={{ fontSize }}
                    fill="currentColor"
                >
                    {Math.round(clampedScore)}
                </text>

                {/* Risk Level Label */}
                <text
                    x={width / 2}
                    y={width / 2 + 15}
                    textAnchor="middle"
                    className="text-gray-400"
                    style={{ fontSize: 12 }}
                    fill="currentColor"
                >
                    {color.label}
                </text>

                {/* Scale markers */}
                <text x={strokeWidth} y={width / 2 + 18} className="text-xs text-gray-500" style={{ fontSize: 10 }} fill="currentColor">
                    0
                </text>
                <text x={width - strokeWidth - 10} y={width / 2 + 18} className="text-xs text-gray-500" style={{ fontSize: 10 }} fill="currentColor">
                    100
                </text>
            </svg>

            {/* Label */}
            <p className="text-gray-400 text-sm mt-1">{label}</p>
        </div>
    );
};

export default RiskGauge;
