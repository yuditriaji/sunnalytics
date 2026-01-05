import React from 'react';

interface StatsCardProps {
    label: string;
    value: string;
    subtitle?: string;
    icon: React.ReactNode;
    iconBg?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
    label,
    value,
    subtitle,
    icon,
    iconBg = 'bg-cyan-500/10 text-cyan-400'
}) => {
    return (
        <div className="bg-[#111827] border border-white/5 rounded-xl p-4 flex items-center justify-between">
            <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
                {subtitle && (
                    <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                )}
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                {icon}
            </div>
        </div>
    );
};

export default StatsCard;
