// components/TrendingTokens.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { FaArrowUp, FaArrowDown, FaChartLine } from 'react-icons/fa';

interface Token {
    id: string;
    name: string;
    symbol: string;
    price?: number;
    priceChange24h?: number;
    marketCap?: number;
}

interface TrendingTokensProps {
    tokens: Token[];
    title?: string;
    type?: 'gainers' | 'losers' | 'trending';
}

const TrendingTokens: React.FC<TrendingTokensProps> = ({
    tokens,
    title = 'Trending',
    type = 'trending',
}) => {
    const router = useRouter();

    const getHeaderStyle = () => {
        switch (type) {
            case 'gainers':
                return {
                    icon: <FaArrowUp className="w-4 h-4" />,
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                };
            case 'losers':
                return {
                    icon: <FaArrowDown className="w-4 h-4" />,
                    color: 'text-red-400',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                };
            default:
                return {
                    icon: <FaChartLine className="w-4 h-4" />,
                    color: 'text-cyan-400',
                    bg: 'bg-cyan-500/10',
                    border: 'border-cyan-500/20',
                };
        }
    };

    const style = getHeaderStyle();

    const formatPrice = (price?: number) => {
        if (!price) return '$0.00';
        if (price < 0.0001) return `$${price.toExponential(2)}`;
        if (price < 0.01) return `$${price.toFixed(6)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        if (price < 1000) return `$${price.toFixed(2)}`;
        return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    };

    const formatMarketCap = (cap?: number) => {
        if (!cap) return '-';
        if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
        if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`;
        return `$${(cap / 1e3).toFixed(0)}K`;
    };

    return (
        <div className={`bg-[#141B2D] border ${style.border} rounded-2xl overflow-hidden`}>
            {/* Header */}
            <div className={`px-4 py-3 border-b ${style.border} flex items-center gap-2`}>
                <div className={`p-1.5 rounded-lg ${style.bg} ${style.color}`}>
                    {style.icon}
                </div>
                <h3 className="text-sm font-semibold text-white">{title}</h3>
            </div>

            {/* Token List */}
            <div className="divide-y divide-white/5">
                {tokens.slice(0, 5).map((token, index) => (
                    <div
                        key={token.id}
                        onClick={() => router.push(`/tokens/${token.id}`)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-white/5 cursor-pointer transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-600 w-4 font-medium">{index + 1}</span>
                            <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${type === 'gainers'
                                    ? 'bg-gradient-to-br from-emerald-400 to-cyan-500'
                                    : type === 'losers'
                                        ? 'bg-gradient-to-br from-red-400 to-pink-500'
                                        : 'bg-gradient-to-br from-cyan-400 to-blue-500'
                                } text-black
              `}>
                                {token.symbol.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white uppercase">{token.symbol}</p>
                                <p className="text-xs text-gray-500">{formatMarketCap(token.marketCap)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-white">{formatPrice(token.price)}</p>
                            {token.priceChange24h !== undefined && (
                                <p
                                    className={`text-xs font-medium ${token.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                                        }`}
                                >
                                    {token.priceChange24h >= 0 ? '+' : ''}
                                    {token.priceChange24h.toFixed(2)}%
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {tokens.length === 0 && (
                <div className="px-4 py-8 text-center">
                    <p className="text-gray-500 text-sm">No tokens available</p>
                </div>
            )}
        </div>
    );
};

export default TrendingTokens;
