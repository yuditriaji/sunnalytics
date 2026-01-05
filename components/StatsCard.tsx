// components/StatsCard.tsx
import React from 'react';

interface StatsCardProps {
    title: string;
    value: string;
    subtitle?: string;
    change?: number;
    icon: React.ReactNode;
    color?: 'cyan' | 'green' | 'orange' | 'red' | 'purple';
}

const colorClasses = {
    cyan: {
        gradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
        border: 'border-cyan-500/20',
        text: 'text-cyan-400',
        icon: 'bg-cyan-500/15 text-cyan-400',
        glow: 'bg-cyan-500/30',
    },
    green: {
        gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
        border: 'border-emerald-500/20',
        text: 'text-emerald-400',
        icon: 'bg-emerald-500/15 text-emerald-400',
        glow: 'bg-emerald-500/30',
    },
    orange: {
        gradient: 'from-orange-500/10 via-orange-500/5 to-transparent',
        border: 'border-orange-500/20',
        text: 'text-orange-400',
        icon: 'bg-orange-500/15 text-orange-400',
        glow: 'bg-orange-500/30',
    },
    red: {
        gradient: 'from-red-500/10 via-red-500/5 to-transparent',
        border: 'border-red-500/20',
        text: 'text-red-400',
        icon: 'bg-red-500/15 text-red-400',
        glow: 'bg-red-500/30',
    },
    purple: {
        gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
        border: 'border-purple-500/20',
        text: 'text-purple-400',
        icon: 'bg-purple-500/15 text-purple-400',
        glow: 'bg-purple-500/30',
    },
};

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    subtitle,
    change,
    icon,
    color = 'cyan'
}) => {
    const colors = colorClasses[color];

    return (
        <div
            className={`
        relative overflow-hidden rounded-2xl
        bg-[#141B2D] border ${colors.border}
        p-4 transition-all duration-200
        hover:border-opacity-50 hover:shadow-lg hover:shadow-black/20
        group
      `}
        >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-50`} />

            {/* Glow effect on hover */}
            <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-3xl ${colors.glow} opacity-0 group-hover:opacity-30 transition-opacity`} />

            <div className="relative flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                        {title}
                    </p>
                    <p className={`text-2xl font-bold text-white`}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                    )}
                    {change !== undefined && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            <span>{change >= 0 ? '↑' : '↓'}</span>
                            <span className="font-medium">{Math.abs(change).toFixed(2)}%</span>
                        </div>
                    )}
                </div>
                <div className={`p-2.5 rounded-xl ${colors.icon}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
