import React, { useState, useEffect, useMemo } from 'react';
import { useTokenStore } from '../stores/useTokenStore';
import { useTokenData } from '../hooks/useTokenData';
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import BottomNav from '../components/BottomNav';
import { FaChartLine, FaChartBar, FaChartPie, FaExclamationTriangle, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { formatLargeNumber } from '../utils/tokenStats';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children, icon }) => (
  <div className="bg-gray-800 p-4 rounded-lg">
    <div className="flex items-center justify-between mb-3">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      {icon && <div className="text-gray-400">{icon}</div>}
    </div>
    <div className="h-48">
      {children}
    </div>
  </div>
);

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: string;
}> = ({ title, value, change, icon, color = 'text-white' }) => (
  <div className="bg-gray-800 p-4 rounded-lg">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {change !== undefined && (
          <p className={`text-sm flex items-center mt-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
            {Math.abs(change).toFixed(2)}%
          </p>
        )}
      </div>
      {icon && <div className={`text-2xl ${color}`}>{icon}</div>}
    </div>
  </div>
);

export default function Charts() {
  const { tokens } = useTokenStore();
  const { fetchTokens } = useTokenData();
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'risk' | 'liquidity'>('overview');

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  // Calculate market statistics
  const marketStats = useMemo(() => {
    if (!tokens.length) return null;

    const totalMarketCap = tokens.reduce((sum, token) => sum + (token.marketCap || 0), 0);
    const totalVolume = tokens.reduce((sum, token) => sum + (token.volume24h || 0), 0);
    const avgLiquidity = tokens.reduce((sum, token) => sum + (token.liquidityScore || 0), 0) / tokens.length;
    const highRiskTokens = tokens.filter(token => (token.pumpDumpRiskScore || 0) > 70).length;

    return {
      totalMarketCap,
      totalVolume,
      avgLiquidity,
      highRiskTokens,
      totalTokens: tokens.length,
    };
  }, [tokens]);

  // Top gainers and losers
  const topMovers = useMemo(() => {
    const sorted = [...tokens]
      .filter(token => token.stats?.priceChange24h !== undefined)
      .sort((a, b) => (b.stats?.priceChange24h || 0) - (a.stats?.priceChange24h || 0));

    return {
      gainers: sorted.slice(0, 5),
      losers: sorted.slice(-5).reverse(),
    };
  }, [tokens]);

  // Chart configurations
  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          color: 'white',
          font: { size: 10 },
        },
      },
    },
  };

  const scatterOptions: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        title: {
          display: true,
          text: 'Liquidity Score',
          color: 'white',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        title: {
          display: true,
          text: 'Volume/Market Cap %',
          color: 'white',
        },
      },
    },
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Market Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Market Cap"
          value={marketStats ? formatLargeNumber(marketStats.totalMarketCap) : '$0'}
          icon={<FaChartBar />}
          color="text-blue-400"
        />
        <MetricCard
          title="Total Volume (24h)"
          value={marketStats ? formatLargeNumber(marketStats.totalVolume) : '$0'}
          icon={<FaChartLine />}
          color="text-green-400"
        />
        <MetricCard
          title="Average Liquidity"
          value={marketStats ? `${marketStats.avgLiquidity.toFixed(1)}%` : '0%'}
          icon={<FaChartPie />}
          color="text-yellow-400"
        />
        <MetricCard
          title="High Risk Tokens"
          value={marketStats ? `${marketStats.highRiskTokens} / ${marketStats.totalTokens}` : '0 / 0'}
          icon={<FaExclamationTriangle />}
          color="text-red-400"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Market Cap Distribution */}
        <ChartCard title="Market Cap Distribution" subtitle="Top 10 tokens by market cap">
          <Doughnut
            data={{
              labels: tokens.slice(0, 10).map(t => t.symbol),
              datasets: [{
                data: tokens.slice(0, 10).map(t => t.marketCap || 0),
                backgroundColor: [
                  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
                ],
                borderWidth: 0,
              }],
            }}
            options={doughnutOptions}
          />
        </ChartCard>

        {/* Volume Trends */}
        <ChartCard title="Volume Trends" subtitle="24h volume for top tokens">
          <Bar
            data={{
              labels: tokens.slice(0, 8).map(t => t.symbol),
              datasets: [{
                data: tokens.slice(0, 8).map(t => t.volume24h || 0),
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                borderColor: '#22C55E',
                borderWidth: 1,
              }],
            }}
            options={chartOptions}
          />
        </ChartCard>

        {/* Risk Distribution */}
        <ChartCard title="Risk Distribution" subtitle="Tokens by risk level">
          <Bar
            data={{
              labels: ['Low Risk', 'Medium Risk', 'High Risk'],
              datasets: [{
                data: [
                  tokens.filter(t => (t.pumpDumpRiskScore || 0) < 30).length,
                  tokens.filter(t => (t.pumpDumpRiskScore || 0) >= 30 && (t.pumpDumpRiskScore || 0) < 70).length,
                  tokens.filter(t => (t.pumpDumpRiskScore || 0) >= 70).length,
                ],
                backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
              }],
            }}
            options={chartOptions}
          />
        </ChartCard>

        {/* Liquidity Score Distribution */}
        <ChartCard title="Liquidity Distribution" subtitle="Tokens by liquidity score">
          <Scatter
            data={{
              datasets: [{
                label: 'Tokens',
                data: tokens.map(t => ({
                  x: t.liquidityScore || 0,
                  y: t.volumeMarketCapRatio ? t.volumeMarketCapRatio * 100 : 0,
                })),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: '#3B82F6',
              }],
            }}
            options={scatterOptions}
          />
        </ChartCard>
      </div>
    </div>
  );

  const PerformanceTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-green-400">Top Gainers (24h)</h3>
          <div className="space-y-3">
            {topMovers.gainers.map((token: any, index: number) => (
              <div key={token.id} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400">#{index + 1}</span>
                  <span className="font-medium">{token.symbol}</span>
                </div>
                <span className="text-green-400 font-medium">
                  +{token.stats?.priceChange24h?.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-red-400">Top Losers (24h)</h3>
          <div className="space-y-3">
            {topMovers.losers.map((token: any, index: number) => (
              <div key={token.id} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400">#{index + 1}</span>
                  <span className="font-medium">{token.symbol}</span>
                </div>
                <span className="text-red-400 font-medium">
                  {token.stats?.priceChange24h?.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <ChartCard title="Price Performance Overview" subtitle="24h price changes">
        <Bar
          data={{
            labels: tokens.slice(0, 20).map(t => t.symbol),
            datasets: [{
              data: tokens.slice(0, 20).map(t => t.stats?.priceChange24h || 0),
              backgroundColor: tokens.slice(0, 20).map(t => 
                (t.stats?.priceChange24h || 0) >= 0 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'
              ),
              borderColor: tokens.slice(0, 20).map(t => 
                (t.stats?.priceChange24h || 0) >= 0 ? '#22C55E' : '#EF4444'
              ),
              borderWidth: 1,
            }],
          }}
          options={chartOptions}
        />
      </ChartCard>
    </div>
  );

  const RiskTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="Pump/Dump Risk" subtitle="Distribution of risk scores">
          <Doughnut
            data={{
              labels: ['Low Risk (<30)', 'Medium Risk (30-70)', 'High Risk (>70)'],
              datasets: [{
                data: [
                  tokens.filter(t => (t.pumpDumpRiskScore || 0) < 30).length,
                  tokens.filter(t => (t.pumpDumpRiskScore || 0) >= 30 && (t.pumpDumpRiskScore || 0) < 70).length,
                  tokens.filter(t => (t.pumpDumpRiskScore || 0) >= 70).length,
                ],
                backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                borderWidth: 0,
              }],
            }}
            options={{
              ...doughnutOptions,
              plugins: {
                ...doughnutOptions.plugins,
                legend: {
                  display: true,
                  position: 'bottom',
                  labels: { color: 'white', font: { size: 10 } },
                },
              },
            }}
          />
        </ChartCard>

        <ChartCard title="Wallet Distribution" subtitle="Token holder concentration">
          <Bar
            data={{
              labels: ['Poor (<40)', 'Fair (40-70)', 'Good (>70)'],
              datasets: [{
                data: [
                  tokens.filter(t => (t.walletDistributionScore || 0) < 40).length,
                  tokens.filter(t => (t.walletDistributionScore || 0) >= 40 && (t.walletDistributionScore || 0) < 70).length,
                  tokens.filter(t => (t.walletDistributionScore || 0) >= 70).length,
                ],
                backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
              }],
            }}
            options={chartOptions}
          />
        </ChartCard>

        <ChartCard title="Volume Health" subtitle="Healthy vs unhealthy volume">
          <Doughnut
            data={{
              labels: ['Healthy', 'Unhealthy'],
              datasets: [{
                data: [
                  tokens.filter(t => t.isVolumeHealthy === true).length,
                  tokens.filter(t => t.isVolumeHealthy === false).length,
                ],
                backgroundColor: ['#10B981', '#EF4444'],
                borderWidth: 0,
              }],
            }}
            options={{
              ...doughnutOptions,
              plugins: {
                ...doughnutOptions.plugins,
                legend: {
                  display: true,
                  position: 'bottom',
                  labels: { color: 'white' },
                },
              },
            }}
          />
        </ChartCard>
      </div>

      {/* High Risk Tokens List */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-red-400">High Risk Tokens</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tokens
            .filter(t => (t.pumpDumpRiskScore || 0) > 70)
            .slice(0, 6)
            .map(token => (
              <div key={token.id} className="p-4 bg-gray-700 rounded">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{token.symbol}</span>
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                    Risk: {token.pumpDumpRiskScore?.toFixed(0)}%
                  </span>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Liquidity: {token.liquidityScore?.toFixed(0) || 'N/A'}%</p>
                  <p>Wallet Dist: {token.walletDistributionScore?.toFixed(0) || 'N/A'}%</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const LiquidityTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Liquidity Score Distribution" subtitle="All tokens">
          <Bar
            data={{
              labels: ['0-20', '20-40', '40-60', '60-80', '80-100'],
              datasets: [{
                data: [
                  tokens.filter(t => (t.liquidityScore || 0) < 20).length,
                  tokens.filter(t => (t.liquidityScore || 0) >= 20 && (t.liquidityScore || 0) < 40).length,
                  tokens.filter(t => (t.liquidityScore || 0) >= 40 && (t.liquidityScore || 0) < 60).length,
                  tokens.filter(t => (t.liquidityScore || 0) >= 60 && (t.liquidityScore || 0) < 80).length,
                  tokens.filter(t => (t.liquidityScore || 0) >= 80).length,
                ],
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: '#3B82F6',
                borderWidth: 1,
              }],
            }}
            options={chartOptions}
          />
        </ChartCard>

        <ChartCard title="Volume/Market Cap Correlation" subtitle="Liquidity vs trading activity">
          <Scatter
            data={{
              datasets: [{
                label: 'Tokens',
                data: tokens.map(t => ({
                  x: t.liquidityScore || 0,
                  y: t.volumeMarketCapRatio ? t.volumeMarketCapRatio * 100 : 0,
                })),
                backgroundColor: tokens.map(t => 
                  t.isVolumeHealthy ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'
                ),
                borderColor: tokens.map(t => 
                  t.isVolumeHealthy ? '#22C55E' : '#EF4444'
                ),
              }],
            }}
            options={scatterOptions}
          />
        </ChartCard>
      </div>

      {/* Top Liquid Tokens */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-blue-400">Most Liquid Tokens</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tokens
            .sort((a, b) => (b.liquidityScore || 0) - (a.liquidityScore || 0))
            .slice(0, 6)
            .map(token => (
              <div key={token.id} className="p-4 bg-gray-700 rounded">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{token.symbol}</span>
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                    {token.liquidityScore?.toFixed(0)}%
                  </span>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Volume: {formatLargeNumber(token.volume24h || 0)}</p>
                  <p>Market Cap: {formatLargeNumber(token.marketCap || 0)}</p>
                  <p>Vol/MCap: {((token.volumeMarketCapRatio || 0) * 100).toFixed(2)}%</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <header className="bg-gray-800 p-4">
        <h1 className="text-2xl font-bold mb-2">Market Analytics Dashboard</h1>
        <p className="text-gray-400 text-sm">Real-time insights and market analysis</p>
      </header>

      {/* Tabbed Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'performance', label: 'Performance' },
            { id: 'risk', label: 'Risk Analysis' },
            { id: 'liquidity', label: 'Liquidity' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'performance' && <PerformanceTab />}
        {activeTab === 'risk' && <RiskTab />}
        {activeTab === 'liquidity' && <LiquidityTab />}
      </main>

      <BottomNav onFilterClick={() => {}} onSearchFocus={() => document.querySelector('input')?.focus()} />
    </div>
  );
}
