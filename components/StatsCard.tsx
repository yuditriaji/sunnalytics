// components/StatsCard.tsx
import React from 'react';

interface StatsCardProps {
    title: string;
    value: string;
    change?: number;
    icon: React.ReactNode;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const colorClasses = {
    blue: {
        bg: 'from-blue-500/20 to-blue-600/5',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        icon: 'bg-blue-500/20 text-blue-400',
    },
    green: {
        bg: 'from-green-500/20 to-green-600/5',
        border: 'border-green-500/20',
        text: 'text-green-400',
        icon: 'bg-green-500/20 text-green-400',
    },
    yellow: {
        bg: 'from-yellow-500/20 to-yellow-600/5',
        border: 'border-yellow-500/20',
        text: 'text-yellow-400',
        icon: 'bg-yellow-500/20 text-yellow-400',
    },
    red: {
        bg: 'from-red-500/20 to-red-600/5',
        border: 'border-red-500/20',
        text: 'text-red-400',
        icon: 'bg-red-500/20 text-red-400',
    },
    purple: {
        bg: 'from-purple-500/20 to-purple-600/5',
        border: 'border-purple-500/20',
        text: 'text-purple-400',
        icon: 'bg-purple-500/20 text-purple-400',
    },
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon, color = 'blue' }) => {
    const colors = colorClasses[color];

    return (
        <div
            className={`
        relative overflow-hidden rounded-2xl border backdrop-blur-xl
        bg-gradient-to-br ${colors.bg} ${colors.border}
        p-4 transition-all hover:scale-[1.02] hover:shadow-lg
      `}
        >
            {/* Glow effect */}
            <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-3xl ${colors.text} opacity-20`} />

            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-xs text-gray-400 mb-1">{title}</p>
                    <p className={`text-xl font-bold ${colors.text}`}>{value}</p>
                    {change !== undefined && (
                        <p className={`text-xs mt-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
                        </p>
                    )}
                </div>
                <div className={`p-2 rounded-xl ${colors.icon}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
