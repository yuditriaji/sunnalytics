import React from 'react';
import { useRouter } from 'next/router';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

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
    type?: 'gainers' | 'losers';
}

const tokenColors = [
    'bg-gradient-to-br from-purple-500 to-indigo-600',
    'bg-gradient-to-br from-pink-500 to-rose-500',
    'bg-gradient-to-br from-teal-400 to-cyan-500',
    'bg-gradient-to-br from-orange-400 to-amber-500',
    'bg-gradient-to-br from-emerald-400 to-green-500',
];

const TrendingTokens: React.FC<TrendingTokensProps> = ({
    tokens,
    title = 'Trending',
    type = 'gainers',
}) => {
    const router = useRouter();
    const isGainers = type === 'gainers';

    const formatPrice = (price?: number) => {
        if (!price) return '$0.00';
        if (price < 0.0001) return `$${price.toExponential(2)}`;
        if (price < 0.01) return `$${price.toFixed(6)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    };

    const formatMarketCap = (cap?: number) => {
        if (!cap) return '-';
        if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
        if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`;
        return `$${(cap / 1e3).toFixed(0)}K`;
    };

    return (
        <div className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${isGainers ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    {isGainers ? (
                        <FiArrowUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <FiArrowDown className="w-4 h-4 text-red-400" />
                    )}
                </div>
                <span className="text-sm font-medium text-white">{title}</span>
            </div>

            {/* Token List */}
            <div>
                {tokens.slice(0, 5).map((token, index) => (
                    <div
                        key={token.id}
                        onClick={() => router.push(`/tokens/${token.id}`)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] cursor-pointer transition-colors border-b border-white/[0.03] last:border-b-0"
                    >
                        <div className="flex items-center gap-3">
                            <span className="w-4 text-xs text-gray-500 font-medium">{index + 1}</span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${tokenColors[index % tokenColors.length]}`}>
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
                                <p className={`text-xs font-medium ${token.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {tokens.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No tokens available
                </div>
            )}
        </div>
    );
};

export default TrendingTokens;
