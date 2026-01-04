// components/TrendingTokens.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { FaFire, FaArrowUp, FaArrowDown } from 'react-icons/fa';

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

    const getIcon = () => {
        switch (type) {
            case 'gainers':
                return <FaArrowUp className="text-green-400" />;
            case 'losers':
                return <FaArrowDown className="text-red-400" />;
            default:
                return <FaFire className="text-orange-400" />;
        }
    };

    const formatPrice = (price?: number) => {
        if (!price) return '$0.00';
        if (price < 0.01) return `$${price.toFixed(6)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        return `$${price.toFixed(2)}`;
    };

    const formatMarketCap = (cap?: number) => {
        if (!cap) return '-';
        if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
        if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`;
        return `$${(cap / 1e3).toFixed(0)}K`;
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
                {getIcon()}
                <h3 className="text-sm font-semibold text-white">{title}</h3>
            </div>

            <div className="space-y-3">
                {tokens.slice(0, 5).map((token, index) => (
                    <div
                        key={token.id}
                        onClick={() => router.push(`/tokens/${token.id}`)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-700/50 cursor-pointer transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 w-4">{index + 1}</span>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-black">
                                {token.symbol.slice(0, 2)}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{token.symbol}</p>
                                <p className="text-xs text-gray-400">{formatMarketCap(token.marketCap)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-white">{formatPrice(token.price)}</p>
                            {token.priceChange24h !== undefined && (
                                <p
                                    className={`text-xs ${token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
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
                <p className="text-center text-gray-500 text-sm py-4">No tokens available</p>
            )}
        </div>
    );
};

export default TrendingTokens;
