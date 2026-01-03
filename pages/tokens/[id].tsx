import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, ChartOptions, ArcElement, BarElement, CategoryScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useTokens } from '../../utils/api';
import BottomNav from '../../components/BottomNav';
import RiskIndicator from '../../components/RiskIndicator';
import RiskDashboard from '../../components/RiskDashboard';
import { formatLargeNumber as formatNumber } from '../../utils/tokenStats';
import { FaChartLine, FaShieldAlt, FaChartBar, FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaTachometerAlt, FaChartPie } from 'react-icons/fa';

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, ArcElement, BarElement, CategoryScale);

interface TokenHistory {
  id: string;
  tokenId: string;
  price: number | null;
  marketCap: number | null;
  volume24h: number | null;
  timestamp: string;
}

interface Token {
  id: string;
  name: string;
  symbol: string;
  category: string;
  exchange?: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
  volumeMarketCapRatio?: number;
  isVolumeHealthy?: boolean;
  liquidityScore?: number;
  pumpDumpRiskScore?: number;
  walletDistributionScore?: number;
  circulatingSupplyPercentage?: number;
  isCirculatingSupplyGood?: boolean;
}

const TokenDetails: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { tokens, isLoading, error } = useTokens();
  const [history, setHistory] = useState<TokenHistory[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'price' | 'volume' | 'risk' | 'market'>('overview');

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  useEffect(() => {
    if (id) {
      const url = `${BACKEND_URL}/api/tokens/${id}/history`;
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          setHistory(data);
          setApiError(null);
        })
        .catch(err => {
          console.error('Error fetching history:', err.message);
          setApiError(err.message);
        });
    }
  }, [id, BACKEND_URL]);

  const token = tokens?.find((t: Token) => t.id === id);

  if (isLoading) return <div className="p-4 text-center text-gray-400">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  if (!token) return <div className="p-4 text-center text-gray-400">Token not found</div>;

  const validHistory = history
    .filter(h => h.price != null && h.volume24h != null && h.marketCap != null && h.marketCap !== 0)
    .reduce((acc: TokenHistory[], h) => {
      const date = new Date(h.timestamp).toISOString().split('T')[0];
      const existing = acc.find(item => new Date(item.timestamp).toISOString().split('T')[0] === date);
      if (!existing) acc.push(h);
      return acc;
    }, [])
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Metric Card Component
  const MetricCard = ({ title, value, subtitle, icon, color, tooltip }: any) => (
    <div className="bg-gray-800 p-6 rounded-lg relative group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color || 'text-white'}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`text-2xl ${color || 'text-gray-400'}`}>{icon}</div>
      </div>
      {tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {tooltip}
        </div>
      )}
    </div>
  );

  // Tab content components
  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Current Price"
          value={formatNumber(token.price)}
          icon={<FaChartLine />}
          color="text-blue-400"
          tooltip="Latest trading price"
        />
        <MetricCard
          title="Market Cap"
          value={formatNumber(token.marketCap)}
          icon={<FaChartBar />}
          color="text-green-400"
          tooltip="Total market value"
        />
        <MetricCard
          title="24h Volume"
          value={formatNumber(token.volume24h)}
          icon={<FaTachometerAlt />}
          color="text-yellow-400"
          tooltip="Trading volume in last 24 hours"
        />
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Token Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Symbol</p>
            <p className="text-white font-medium">{token.symbol.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Category</p>
            <p className="text-white font-medium">{token.category.charAt(0).toUpperCase() + token.category.slice(1)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Exchange</p>
            <p className="text-white font-medium">{token.exchange || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Volume Health</p>
            <p className="text-white font-medium flex items-center">
              {token.isVolumeHealthy ? (
                <>
                  <FaCheckCircle className="text-green-400 mr-2" />
                  Healthy
                </>
              ) : (
                <>
                  <FaExclamationTriangle className="text-red-400 mr-2" />
                  Unhealthy
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Overall Risk Assessment</h3>
        <RiskIndicator
          pumpDumpRiskScore={token.pumpDumpRiskScore}
          liquidityScore={token.liquidityScore}
          walletDistributionScore={token.walletDistributionScore}
          isVolumeHealthy={token.isVolumeHealthy}
          volumeMarketCapRatio={token.volumeMarketCapRatio}
          compact={false}
        />
      </div>
    </div>
  );

  const PriceAnalyticsTab = () => {
    // Calculate volume/market cap ratio for each historical point
    const volMktCapRatioHistory = validHistory.map(h =>
      h.marketCap && h.marketCap > 0 ? (h.volume24h! / h.marketCap) * 100 : 0
    );

    const priceVsRatioChartData = {
      labels: validHistory.map(h => new Date(h.timestamp)),
      datasets: [
        {
          label: 'Price (USD)',
          data: validHistory.map(h => h.price!),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: false,
          yAxisID: 'y',
        },
        {
          label: 'Vol/Mkt Cap Ratio (%)',
          data: volMktCapRatioHistory,
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: false,
          yAxisID: 'y1',
        },
      ],
    };

    const priceVsRatioChartOptions: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          type: 'time',
          time: { unit: 'day' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#3B82F6' },
          title: {
            display: true,
            text: 'Price (USD)',
            color: '#3B82F6'
          },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: '#F59E0B' },
          title: {
            display: true,
            text: 'Vol/Mkt Cap Ratio (%)',
            color: '#F59E0B'
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          labels: { color: 'white' }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                if (context.datasetIndex === 0) {
                  label += '$' + context.parsed.y.toFixed(2);
                } else {
                  label += context.parsed.y.toFixed(2) + '%';
                }
              }
              return label;
            }
          }
        },
      },
    };

    // Separate price history chart
    const priceChartData = {
      labels: validHistory.map(h => new Date(h.timestamp)),
      datasets: [
        {
          label: 'Price (USD)',
          data: validHistory.map(h => h.price!),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
        },
      ],
    };

    const priceChartOptions: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
          time: { unit: 'day' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          title: { display: true, text: 'Price (USD)' },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false },
      },
    };

    return (
      <div className="space-y-6">
        {/* Price vs Volume/Market Cap Ratio Chart - Primary Analysis */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Price vs Volume/Market Cap Ratio Analysis</h3>
          <p className="text-sm text-gray-400 mb-4">
            Analyze the relationship between price movements and trading activity intensity
          </p>
          <div className="h-80">
            {validHistory.length > 0 ? (
              <Line data={priceVsRatioChartData} options={priceVsRatioChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No historical data available
              </div>
            )}
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Current Price"
            value={formatNumber(token.price)}
            subtitle="Latest trading price"
            icon={<FaChartLine />}
            color="text-blue-400"
          />
          <MetricCard
            title="Current Vol/Mkt Cap"
            value={`${((token.volumeMarketCapRatio || 0) * 100).toFixed(2)}%`}
            subtitle={token.volumeMarketCapRatio && token.volumeMarketCapRatio > 1 ? "High activity" : "Normal activity"}
            icon={<FaTachometerAlt />}
            color={token.volumeMarketCapRatio && token.volumeMarketCapRatio > 1 ? 'text-yellow-400' : 'text-green-400'}
          />
          <MetricCard
            title="Correlation"
            value={validHistory.length > 0 ? "Analyzing..." : "N/A"}
            subtitle="Price-Volume relationship"
            icon={<FaChartBar />}
            color="text-purple-400"
          />
        </div>

        {/* Detailed Price History */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Price History Detail</h3>
          <div className="h-64">
            {validHistory.length > 0 ? (
              <Line data={priceChartData} options={priceChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No historical data available
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const VolumeAnalyticsTab = () => {
    const volumeChartData = {
      labels: validHistory.map(h => new Date(h.timestamp)),
      datasets: [
        {
          label: 'Volume (USD)',
          data: validHistory.map(h => h.volume24h!),
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          borderColor: '#22C55E',
        },
      ],
    };

    const volumeChartOptions: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
          time: { unit: 'day' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          title: { display: true, text: 'Volume (USD)' },
        },
      },
      plugins: {
        legend: { display: false },
      },
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Volume History</h3>
          <div className="h-64">
            {validHistory.length > 0 ? (
              <Bar data={volumeChartData} options={volumeChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No historical data available
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="24h Volume"
            value={formatNumber(token.volume24h)}
            icon={<FaTachometerAlt />}
            color="text-green-400"
          />
          <MetricCard
            title="Volume/Market Cap"
            value={`${((token.volumeMarketCapRatio || 0) * 100).toFixed(2)}%`}
            icon={<FaChartBar />}
            color={token.volumeMarketCapRatio && token.volumeMarketCapRatio > 1 ? 'text-yellow-400' : 'text-green-400'}
            tooltip="Higher ratio indicates more trading activity"
          />
          <MetricCard
            title="Volume Health"
            value={token.isVolumeHealthy ? 'Healthy' : 'Unhealthy'}
            icon={token.isVolumeHealthy ? <FaCheckCircle /> : <FaExclamationTriangle />}
            color={token.isVolumeHealthy ? 'text-green-400' : 'text-red-400'}
          />
        </div>
      </div>
    );
  };

  const RiskAssessmentTab = () => {
    return (
      <RiskDashboard
        pumpDumpRiskScore={token.pumpDumpRiskScore}
        liquidityScore={token.liquidityScore}
        walletDistributionScore={token.walletDistributionScore}
        isVolumeHealthy={token.isVolumeHealthy}
        volumeMarketCapRatio={token.volumeMarketCapRatio}
      />
    );
  };

  const MarketHealthTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title="Market Cap"
          value={formatNumber(token.marketCap)}
          subtitle="Total market value"
          icon={<FaChartBar />}
          color="text-blue-400"
        />
        <MetricCard
          title="Circulating Supply"
          value={`${token.circulatingSupplyPercentage?.toFixed(2) || 'N/A'}%`}
          subtitle="Percentage of total supply in circulation"
          icon={<FaInfoCircle />}
          color={token.isCirculatingSupplyGood ? 'text-green-400' : 'text-yellow-400'}
        />
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Market Indicators</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-700 rounded">
            <span className="text-gray-300">Volume/Market Cap Ratio</span>
            <span className={`font-medium ${(token.volumeMarketCapRatio || 0) > 1 ? 'text-yellow-400' : 'text-green-400'}`}>
              {((token.volumeMarketCapRatio || 0) * 100).toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-700 rounded">
            <span className="text-gray-300">Volume Health Status</span>
            <span className={`font-medium flex items-center ${token.isVolumeHealthy ? 'text-green-400' : 'text-red-400'}`}>
              {token.isVolumeHealthy ? (
                <>
                  <FaCheckCircle className="mr-2" />
                  Healthy
                </>
              ) : (
                <>
                  <FaExclamationTriangle className="mr-2" />
                  Unhealthy
                </>
              )}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-700 rounded">
            <span className="text-gray-300">Supply Health Status</span>
            <span className={`font-medium flex items-center ${token.isCirculatingSupplyGood ? 'text-green-400' : 'text-yellow-400'}`}>
              {token.isCirculatingSupplyGood ? (
                <>
                  <FaCheckCircle className="mr-2" />
                  Good
                </>
              ) : (
                <>
                  <FaExclamationTriangle className="mr-2" />
                  Moderate
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="mr-4 text-yellow-400 hover:text-yellow-300">
            ← Back
          </button>
          <div>
            <h1 className="text-xl font-bold">{token.name} ({token.symbol.toUpperCase()})</h1>
            <p className="text-sm text-gray-400">{token.category.charAt(0).toUpperCase() + token.category.slice(1)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{formatNumber(token.price)}</p>
          <p className="text-sm text-gray-400">Current Price</p>
        </div>
      </header>

      {/* Tabbed Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: <FaInfoCircle /> },
            { id: 'price', label: 'Price Analytics', icon: <FaChartLine /> },
            { id: 'volume', label: 'Volume Analytics', icon: <FaTachometerAlt /> },
            { id: 'risk', label: 'Risk Assessment', icon: <FaShieldAlt /> },
            { id: 'market', label: 'Market Health', icon: <FaChartPie /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'price' && <PriceAnalyticsTab />}
        {activeTab === 'volume' && <VolumeAnalyticsTab />}
        {activeTab === 'risk' && <RiskAssessmentTab />}
        {activeTab === 'market' && <MarketHealthTab />}
      </main>

      <BottomNav onFilterClick={() => { }} />
    </div>
  );
};

export default TokenDetails;
