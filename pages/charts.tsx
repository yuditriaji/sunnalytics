import React, { useState, useEffect, useMemo } from 'react';
import { useTokenStore } from '../stores/useTokenStore';
import { useTokenData } from '../hooks/useTokenData';
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
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
import { 
  FaChartLine, 
  FaChartBar, 
  FaChartPie, 
  FaExclamationTriangle, 
  FaArrowUp, 
  FaArrowDown,
  FaPlus,
  FaCog,
  FaTimes,
  FaExpand,
  FaCompress,
  FaInfoCircle
} from 'react-icons/fa';
import { formatLargeNumber } from '../utils/tokenStats';

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

interface ChartWidget {
  id: string;
  type: 'line' | 'bar' | 'doughnut' | 'scatter' | 'metric' | 'correlation' | 'distribution';
  title: string;
  subtitle?: string;
  size: 'small' | 'medium' | 'large';
  visible: boolean;
  dataKey?: string;
}

const defaultWidgets: ChartWidget[] = [
  // Market Overview Metrics
  {
    id: 'market-overview',
    type: 'metric',
    title: 'Market Overview',
    subtitle: 'Key market metrics',
    size: 'large',
    visible: true,
  },
  // Supply Metrics
  {
    id: 'supply-metrics',
    type: 'metric',
    title: 'Supply Analysis',
    subtitle: 'Circulating, Total Supply & FDV',
    size: 'large',
    visible: true,
  },
  // Price vs Volume/Market Cap Ratio
  {
    id: 'price-vol-ratio',
    type: 'scatter',
    title: 'Price vs Vol/Mkt Cap Ratio',
    subtitle: 'Correlation analysis',
    size: 'large',
    visible: true,
  },
  // Market Cap vs FDV Analysis
  {
    id: 'mcap-fdv-analysis',
    type: 'scatter',
    title: 'Market Cap vs FDV Analysis',
    subtitle: 'Valuation comparison',
    size: 'large',
    visible: true,
  },
  // Sentiment Score Distribution
  {
    id: 'sentiment-distribution',
    type: 'bar',
    title: 'Sentiment Score Distribution',
    subtitle: 'Market sentiment analysis',
    size: 'medium',
    visible: true,
  },
  // Supply Distribution
  {
    id: 'supply-distribution',
    type: 'bar',
    title: 'Supply Distribution',
    subtitle: 'Circulating vs Total Supply',
    size: 'medium',
    visible: true,
  },
  // Risk Score Distribution
  {
    id: 'risk-distribution',
    type: 'bar',
    title: 'Risk Score Distribution',
    subtitle: 'Pump/Dump, Liquidity, Wallet Distribution',
    size: 'medium',
    visible: true,
  },
  // Market Cap Distribution
  {
    id: 'market-cap-dist',
    type: 'doughnut',
    title: 'Market Cap Distribution',
    subtitle: 'Top 10 tokens by market cap',
    size: 'medium',
    visible: true,
  },
  // FDV Distribution
  {
    id: 'fdv-dist',
    type: 'doughnut',
    title: 'FDV Distribution',
    subtitle: 'Top 10 tokens by fully diluted valuation',
    size: 'medium',
    visible: true,
  },
  // Volume Health Analysis
  {
    id: 'volume-health',
    type: 'bar',
    title: 'Volume Health Analysis',
    subtitle: 'Healthy vs Unhealthy volumes',
    size: 'medium',
    visible: true,
  },
  // Liquidity Score Distribution
  {
    id: 'liquidity-dist',
    type: 'distribution',
    title: 'Liquidity Score Distribution',
    subtitle: 'Token liquidity analysis',
    size: 'medium',
    visible: true,
  },
  // Category Performance
  {
    id: 'category-performance',
    type: 'bar',
    title: 'Category Performance',
    subtitle: 'Average metrics by category',
    size: 'large',
    visible: true,
  },
  // Comprehensive Analysis
  {
    id: 'comprehensive-analysis',
    type: 'scatter',
    title: 'Multi-Dimensional Analysis',
    subtitle: 'Price, Volume, Sentiment & Risk',
    size: 'large',
    visible: true,
  },
];

export default function Charts() {
  const { tokens } = useTokenStore();
  const { fetchTokens } = useTokenData();
  const [widgets, setWidgets] = useState<ChartWidget[]>(defaultWidgets);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  // Comprehensive market statistics
  const marketStats = useMemo(() => {
    if (!tokens.length) return null;

    const totalMarketCap = tokens.reduce((sum, token) => sum + (token.marketCap || 0), 0);
    const totalVolume = tokens.reduce((sum, token) => sum + (token.volume24h || 0), 0);
    const avgLiquidity = tokens.reduce((sum, token) => sum + (token.liquidityScore || 0), 0) / tokens.length;
    const avgPumpDumpRisk = tokens.reduce((sum, token) => sum + (token.pumpDumpRiskScore || 0), 0) / tokens.length;
    const avgWalletDist = tokens.reduce((sum, token) => sum + (token.walletDistributionScore || 0), 0) / tokens.length;
    const healthyTokens = tokens.filter(token => token.isVolumeHealthy).length;
    const highRiskTokens = tokens.filter(token => (token.pumpDumpRiskScore || 0) > 70).length;
    const goodSupplyTokens = tokens.filter(token => token.isCirculatingSupplyGood).length;

    // Category breakdown
    const categoryStats = tokens.reduce((acc, token) => {
      const category = token.category || 'Unknown';
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          totalMarketCap: 0,
          totalVolume: 0,
          avgLiquidity: 0,
          avgRisk: 0,
        };
      }
      acc[category].count++;
      acc[category].totalMarketCap += token.marketCap || 0;
      acc[category].totalVolume += token.volume24h || 0;
      acc[category].avgLiquidity += token.liquidityScore || 0;
      acc[category].avgRisk += token.pumpDumpRiskScore || 0;
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages for categories
    Object.keys(categoryStats).forEach(category => {
      categoryStats[category].avgLiquidity /= categoryStats[category].count;
      categoryStats[category].avgRisk /= categoryStats[category].count;
    });

    return {
      totalMarketCap,
      totalVolume,
      avgLiquidity,
      avgPumpDumpRisk,
      avgWalletDist,
      healthyTokens,
      highRiskTokens,
      goodSupplyTokens,
      totalTokens: tokens.length,
      categoryStats,
      volumeToMarketCapRatio: totalVolume / totalMarketCap,
    };
  }, [tokens]);

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: 'white' } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
      },
    },
  };

  const scatterOptions: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const token = tokens[context.dataIndex];
            return [
              `${token.symbol}: ${token.name}`,
              `Price: $${token.price?.toFixed(2) || 'N/A'}`,
              `Vol/Mkt Cap: ${((token.volumeMarketCapRatio || 0) * 100).toFixed(2)}%`
            ];
          }
        }
      },
    },
    scales: {
      x: {
        type: 'linear',
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        title: { display: true, text: 'Price (USD)', color: 'white' },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        title: { display: true, text: 'Volume/Market Cap Ratio (%)', color: 'white' },
      },
    },
  };

  const toggleWidget = (widgetId: string) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    ));
  };

  const toggleExpanded = (widgetId: string) => {
    setExpandedWidget(expandedWidget === widgetId ? null : widgetId);
  };

  const renderWidget = (widget: ChartWidget) => {
    if (!widget.visible) return null;

    const isExpanded = expandedWidget === widget.id;
    const sizeClasses = {
      small: isExpanded ? 'h-96' : 'h-48',
      medium: isExpanded ? 'h-[500px]' : 'h-64',
      large: isExpanded ? 'h-[600px]' : 'h-80',
    };

    const baseClasses = `bg-gray-800 rounded-lg p-4 ${sizeClasses[widget.size]} relative group transition-all duration-300 ${
      isExpanded ? 'col-span-full' : widget.size === 'large' ? 'md:col-span-2' : ''
    }`;

    switch (widget.type) {
      case 'metric':
        if (widget.id === 'supply-metrics') {
          // Calculate supply metrics
          const totalCirculatingSupply = tokens.reduce((sum, token) => sum + (token.circulatingSupply || 0), 0);
          const totalTotalSupply = tokens.reduce((sum, token) => sum + (token.totalSupply || 0), 0);
          const totalFDV = tokens.reduce((sum, token) => sum + (token.fdv || token.fullyDilutedValuation || 0), 0);
          const avgSentiment = tokens.reduce((sum, token) => sum + (token.sentimentScore || 50), 0) / tokens.length;
          const avgCirculatingPercentage = totalTotalSupply > 0 ? (totalCirculatingSupply / totalTotalSupply) * 100 : 0;

          return (
            <div key={widget.id} className={baseClasses}>
              <WidgetHeader 
                widget={widget} 
                onToggleExpand={toggleExpanded}
                isEditMode={isEditMode} 
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full pt-8">
                <MetricCard
                  title="Total FDV"
                  value={formatLargeNumber(totalFDV)}
                  subtitle="Fully diluted valuation"
                  color="text-purple-400"
                />
                <MetricCard
                  title="Total Circulating"
                  value={formatLargeNumber(totalCirculatingSupply)}
                  subtitle={`${avgCirculatingPercentage.toFixed(1)}% of total`}
                  color="text-blue-400"
                />
                <MetricCard
                  title="Total Supply"
                  value={formatLargeNumber(totalTotalSupply)}
                  subtitle="All tokens"
                  color="text-cyan-400"
                />
                <MetricCard
                  title="Avg Sentiment"
                  value={`${avgSentiment.toFixed(0)}/100`}
                  subtitle={avgSentiment > 70 ? "Bullish" : avgSentiment > 30 ? "Neutral" : "Bearish"}
                  color={avgSentiment > 70 ? "text-green-400" : avgSentiment > 30 ? "text-yellow-400" : "text-red-400"}
                />
                <MetricCard
                  title="FDV/MCap Ratio"
                  value={`${(totalFDV / (marketStats?.totalMarketCap || 1)).toFixed(2)}x`}
                  subtitle="Valuation multiple"
                  color="text-orange-400"
                />
                <MetricCard
                  title="Supply Locked"
                  value={`${(100 - avgCirculatingPercentage).toFixed(1)}%`}
                  subtitle="Not in circulation"
                  color="text-indigo-400"
                />
              </div>
            </div>
          );
        }
        
        return (
          <div key={widget.id} className={baseClasses}>
            <WidgetHeader 
              widget={widget} 
              onToggleExpand={toggleExpanded}
              isEditMode={isEditMode} 
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full pt-8">
              <MetricCard
                title="Total Market Cap"
                value={marketStats ? formatLargeNumber(marketStats.totalMarketCap) : '$0'}
                subtitle={`${marketStats?.totalTokens || 0} tokens`}
                color="text-blue-400"
              />
              <MetricCard
                title="24h Volume"
                value={marketStats ? formatLargeNumber(marketStats.totalVolume) : '$0'}
                subtitle={`Vol/MCap: ${((marketStats?.volumeToMarketCapRatio || 0) * 100).toFixed(2)}%`}
                color="text-green-400"
              />
              <MetricCard
                title="Avg Liquidity"
                value={`${marketStats?.avgLiquidity.toFixed(1) || 0}%`}
                subtitle="Market average"
                color="text-cyan-400"
              />
              <MetricCard
                title="Healthy Tokens"
                value={`${marketStats?.healthyTokens || 0}`}
                subtitle={`${((marketStats?.healthyTokens || 0) / (marketStats?.totalTokens || 1) * 100).toFixed(0)}% of total`}
                color="text-green-400"
              />
              <MetricCard
                title="High Risk"
                value={`${marketStats?.highRiskTokens || 0}`}
                subtitle={`${((marketStats?.highRiskTokens || 0) / (marketStats?.totalTokens || 1) * 100).toFixed(0)}% of total`}
                color="text-red-400"
              />
              <MetricCard
                title="Good Supply"
                value={`${marketStats?.goodSupplyTokens || 0}`}
                subtitle={`${((marketStats?.goodSupplyTokens || 0) / (marketStats?.totalTokens || 1) * 100).toFixed(0)}% of total`}
                color="text-purple-400"
              />
            </div>
          </div>
        );

      case 'scatter':
        if (widget.id === 'mcap-fdv-analysis') {
          return (
            <div key={widget.id} className={baseClasses}>
              <WidgetHeader 
                widget={widget} 
                onToggleExpand={toggleExpanded}
                isEditMode={isEditMode} 
              />
              <div className="h-full pt-8">
                <Scatter
                  data={{
                    datasets: [{
                      label: 'Tokens',
                      data: tokens.map(token => ({
                        x: token.marketCap || 0,
                        y: token.fdv || token.fullyDilutedValuation || 0,
                      })),
                      backgroundColor: tokens.map(token => {
                        const ratio = (token.fdv || token.fullyDilutedValuation || 0) / (token.marketCap || 1);
                        return ratio > 10 ? 'rgba(239, 68, 68, 0.6)' :
                               ratio > 5 ? 'rgba(245, 158, 11, 0.6)' :
                               'rgba(34, 197, 94, 0.6)';
                      }),
                      pointRadius: 5,
                    }],
                  }}
                  options={{
                    ...scatterOptions,
                    scales: {
                      x: {
                        type: 'logarithmic',
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                        title: { display: true, text: 'Market Cap (USD)', color: 'white' },
                      },
                      y: {
                        type: 'logarithmic',
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                        title: { display: true, text: 'Fully Diluted Valuation (USD)', color: 'white' },
                      },
                    },
                    plugins: {
                      ...scatterOptions.plugins,
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const token = tokens[context.dataIndex];
                            const ratio = (token.fdv || token.fullyDilutedValuation || 0) / (token.marketCap || 1);
                            return [
                              `${token.symbol}: ${token.name}`,
                              `Market Cap: ${formatLargeNumber(token.marketCap || 0)}`,
                              `FDV: ${formatLargeNumber(token.fdv || token.fullyDilutedValuation || 0)}`,
                              `FDV/MCap Ratio: ${ratio.toFixed(2)}x`
                            ];
                          }
                        }
                      },
                    },
                  }}
                />
              </div>
            </div>
          );
        }

        if (widget.id === 'comprehensive-analysis') {
          return (
            <div key={widget.id} className={baseClasses}>
              <WidgetHeader 
                widget={widget} 
                onToggleExpand={toggleExpanded}
                isEditMode={isEditMode} 
              />
              <div className="h-full pt-8">
                <Scatter
                  data={{
                    datasets: [{
                      label: 'Tokens',
                      data: tokens.map(token => ({
                        x: token.liquidityScore || 0,
                        y: token.sentimentScore || 50,
                      })),
                      backgroundColor: tokens.map(token => {
                        const risk = token.pumpDumpRiskScore || 0;
                        return risk > 70 ? 'rgba(239, 68, 68, 0.6)' :
                               risk > 40 ? 'rgba(245, 158, 11, 0.6)' :
                               'rgba(34, 197, 94, 0.6)';
                      }),
                      pointRadius: tokens.map(token => {
                        // Size based on market cap
                        const mcap = token.marketCap || 0;
                        if (mcap > 1e9) return 10;
                        if (mcap > 1e8) return 8;
                        if (mcap > 1e7) return 6;
                        return 4;
                      }),
                    }],
                  }}
                  options={{
                    ...scatterOptions,
                    scales: {
                      x: {
                        type: 'linear',
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                        title: { display: true, text: 'Liquidity Score', color: 'white' },
                      },
                      y: {
                        type: 'linear',
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                        title: { display: true, text: 'Sentiment Score', color: 'white' },
                      },
                    },
                    plugins: {
                      ...scatterOptions.plugins,
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const token = tokens[context.dataIndex];
                            return [
                              `${token.symbol}: ${token.name}`,
                              `Liquidity: ${token.liquidityScore?.toFixed(1) || 'N/A'}%`,
                              `Sentiment: ${token.sentimentScore?.toFixed(0) || 50}/100`,
                              `Risk Score: ${token.pumpDumpRiskScore?.toFixed(0) || 'N/A'}`,
                              `Market Cap: ${formatLargeNumber(token.marketCap || 0)}`
                            ];
                          }
                        }
                      },
                    },
                  }}
                />
              </div>
            </div>
          );
        }

        return (
          <div key={widget.id} className={baseClasses}>
            <WidgetHeader 
              widget={widget} 
              onToggleExpand={toggleExpanded}
              isEditMode={isEditMode} 
            />
            <div className="h-full pt-8">
              <Scatter
                data={{
                  datasets: [{
                    label: 'Tokens',
                    data: tokens.map(token => ({
                      x: token.price || 0.001,
                      y: (token.volumeMarketCapRatio || 0) * 100,
                    })),
                    backgroundColor: tokens.map(token => 
                      token.pumpDumpRiskScore && token.pumpDumpRiskScore > 70 ? 'rgba(239, 68, 68, 0.6)' :
                      token.pumpDumpRiskScore && token.pumpDumpRiskScore > 40 ? 'rgba(245, 158, 11, 0.6)' :
                      'rgba(34, 197, 94, 0.6)'
                    ),
                    pointRadius: 5,
                  }],
                }}
                options={scatterOptions}
              />
            </div>
          </div>
        );

      case 'bar':
        if (widget.id === 'sentiment-distribution') {
          const sentimentRanges = {
            'Bearish (0-30)': tokens.filter(t => (t.sentimentScore || 50) <= 30).length,
            'Neutral (31-70)': tokens.filter(t => (t.sentimentScore || 50) > 30 && (t.sentimentScore || 50) <= 70).length,
            'Bullish (71-100)': tokens.filter(t => (t.sentimentScore || 50) > 70).length,
          };

          return (
            <div key={widget.id} className={baseClasses}>
              <WidgetHeader 
                widget={widget} 
                onToggleExpand={toggleExpanded}
                isEditMode={isEditMode} 
              />
              <div className="h-full pt-8">
                <Bar
                  data={{
                    labels: Object.keys(sentimentRanges),
                    datasets: [{
                      label: 'Number of Tokens',
                      data: Object.values(sentimentRanges),
                      backgroundColor: ['rgba(239, 68, 68, 0.5)', 'rgba(245, 158, 11, 0.5)', 'rgba(34, 197, 94, 0.5)'],
                      borderColor: ['#EF4444', '#F59E0B', '#22C55E'],
                      borderWidth: 1,
                    }],
                  }}
                  options={chartOptions}
                />
              </div>
            </div>
          );
        }

        if (widget.id === 'supply-distribution') {
          // Group tokens by circulating supply percentage ranges
          const supplyRanges = {
            'Low (0-33%)': tokens.filter(t => (t.circulatingSupplyPercentage || 0) <= 33).length,
            'Medium (34-66%)': tokens.filter(t => (t.circulatingSupplyPercentage || 0) > 33 && (t.circulatingSupplyPercentage || 0) <= 66).length,
            'High (67-100%)': tokens.filter(t => (t.circulatingSupplyPercentage || 0) > 66).length,
          };

          return (
            <div key={widget.id} className={baseClasses}>
              <WidgetHeader 
                widget={widget} 
                onToggleExpand={toggleExpanded}
                isEditMode={isEditMode} 
              />
              <div className="h-full pt-8">
                <Bar
                  data={{
                    labels: Object.keys(supplyRanges),
                    datasets: [{
                      label: 'Number of Tokens',
                      data: Object.values(supplyRanges),
                      backgroundColor: ['rgba(239, 68, 68, 0.5)', 'rgba(245, 158, 11, 0.5)', 'rgba(34, 197, 94, 0.5)'],
                      borderColor: ['#EF4444', '#F59E0B', '#22C55E'],
                      borderWidth: 1,
                    }],
                  }}
                  options={chartOptions}
                />
              </div>
            </div>
          );
        }

        if (widget.id === 'risk-distribution') {
          const riskRanges = {
            'Low (0-30)': tokens.filter(t => (t.pumpDumpRiskScore || 0) <= 30).length,
            'Medium (31-70)': tokens.filter(t => (t.pumpDumpRiskScore || 0) > 30 && (t.pumpDumpRiskScore || 0) <= 70).length,
            'High (71-100)': tokens.filter(t => (t.pumpDumpRiskScore || 0) > 70).length,
          };

          return (
            <div key={widget.id} className={baseClasses}>
              <WidgetHeader 
                widget={widget} 
                onToggleExpand={toggleExpanded}
                isEditMode={isEditMode} 
              />
              <div className="h-full pt-8">
                <Bar
                  data={{
                    labels: Object.keys(riskRanges),
                    datasets: [{
                      label: 'Number of Tokens',
                      data: Object.values(riskRanges),
                      backgroundColor: ['rgba(34, 197, 94, 0.5)', 'rgba(245, 158, 11, 0.5)', 'rgba(239, 68, 68, 0.5)'],
                      borderColor: ['#22C55E', '#F59E0B', '#EF4444'],
                      borderWidth: 1,
                    }],
                  }}
                  options={chartOptions}
                />
              </div>
            </div>
          );
        }

        if (widget.id === 'volume-health') {
          const healthData = {
            'Healthy': tokens.filter(t => t.isVolumeHealthy).length,
            'Unhealthy': tokens.filter(t => !t.isVolumeHealthy).length,
          };

          return (
            <div key={widget.id} className={baseClasses}>
              <WidgetHeader 
                widget={widget} 
                onToggleExpand={toggleExpanded}
                isEditMode={isEditMode} 
              />
              <div className="h-full pt-8">
                <Bar
                  data={{
                    labels: Object.keys(healthData),
                    datasets: [{
                      label: 'Number of Tokens',
                      data: Object.values(healthData),
                      backgroundColor: ['rgba(34, 197, 94, 0.5)', 'rgba(239, 68, 68, 0.5)'],
                      borderColor: ['#22C55E', '#EF4444'],
                      borderWidth: 1,
                    }],
                  }}
                  options={chartOptions}
                />
              </div>
            </div>
          );
        }

        if (widget.id === 'category-performance' && marketStats?.categoryStats) {
          const categories = Object.keys(marketStats.categoryStats);
          
          return (
            <div key={widget.id} className={baseClasses}>
              <WidgetHeader 
                widget={widget} 
                onToggleExpand={toggleExpanded}
                isEditMode={isEditMode} 
              />
              <div className="h-full pt-8">
                <Bar
                  data={{
                    labels: categories,
                    datasets: [
                      {
                        label: 'Avg Liquidity Score',
                        data: categories.map(cat => marketStats.categoryStats[cat].avgLiquidity),
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        borderColor: '#3B82F6',
                        borderWidth: 1,
                      },
                      {
                        label: 'Avg Risk Score',
                        data: categories.map(cat => marketStats.categoryStats[cat].avgRisk),
                        backgroundColor: 'rgba(239, 68, 68, 0.5)',
                        borderColor: '#EF4444',
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </div>
            </div>
          );
        }

        return null;

      case 'doughnut':
        if (widget.id === 'fdv-dist') {
          // Sort tokens by FDV and get top 10
          const sortedByFDV = [...tokens]
            .sort((a, b) => (b.fdv || b.fullyDilutedValuation || 0) - (a.fdv || a.fullyDilutedValuation || 0))
            .slice(0, 10);

          return (
            <div key={widget.id} className={baseClasses}>
              <WidgetHeader 
                widget={widget} 
                onToggleExpand={toggleExpanded}
                isEditMode={isEditMode} 
              />
              <div className="h-full pt-8">
                <Doughnut
                  data={{
                    labels: sortedByFDV.map(t => t.symbol),
                    datasets: [{
                      data: sortedByFDV.map(t => t.fdv || t.fullyDilutedValuation || 0),
                      backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                        '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
                      ],
                      borderWidth: 0,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'right',
                        labels: { color: 'white', font: { size: 10 } },
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const token = sortedByFDV[context.dataIndex];
                            const fdv = token.fdv || token.fullyDilutedValuation || 0;
                            return `${token.symbol}: ${formatLargeNumber(fdv)}`;
                          }
                        }
                      }
                    },
                  }}
                />
              </div>
            </div>
          );
        }

        // Default market cap distribution
        const sortedByMarketCap = [...tokens]
          .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
          .slice(0, 10);

        return (
          <div key={widget.id} className={baseClasses}>
            <WidgetHeader 
              widget={widget} 
              onToggleExpand={toggleExpanded}
              isEditMode={isEditMode} 
            />
            <div className="h-full pt-8">
              <Doughnut
                data={{
                  labels: sortedByMarketCap.map(t => t.symbol),
                  datasets: [{
                    data: sortedByMarketCap.map(t => t.marketCap || 0),
                    backgroundColor: [
                      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                      '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
                    ],
                    borderWidth: 0,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'right',
                      labels: { color: 'white', font: { size: 10 } },
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const token = sortedByMarketCap[context.dataIndex];
                          return `${token.symbol}: ${formatLargeNumber(token.marketCap || 0)}`;
                        }
                      }
                    }
                  },
                }}
              />
            </div>
          </div>
        );

      case 'distribution':
        const liquidityRanges = {
          'Poor (0-40)': tokens.filter(t => (t.liquidityScore || 0) < 40).length,
          'Fair (40-70)': tokens.filter(t => (t.liquidityScore || 0) >= 40 && (t.liquidityScore || 0) < 70).length,
          'Good (70-100)': tokens.filter(t => (t.liquidityScore || 0) >= 70).length,
        };

        return (
          <div key={widget.id} className={baseClasses}>
            <WidgetHeader 
              widget={widget} 
              onToggleExpand={toggleExpanded}
              isEditMode={isEditMode} 
            />
            <div className="h-full pt-8">
              <Bar
                data={{
                  labels: Object.keys(liquidityRanges),
                  datasets: [{
                    label: 'Number of Tokens',
                    data: Object.values(liquidityRanges),
                    backgroundColor: ['rgba(239, 68, 68, 0.5)', 'rgba(245, 158, 11, 0.5)', 'rgba(34, 197, 94, 0.5)'],
                    borderColor: ['#EF4444', '#F59E0B', '#22C55E'],
                    borderWidth: 1,
                  }],
                }}
                options={chartOptions}
              />
            </div>
          </div>
        );

      case 'correlation':
        // Simplified correlation visualization
        return (
          <div key={widget.id} className={baseClasses}>
            <WidgetHeader 
              widget={widget} 
              onToggleExpand={toggleExpanded}
              isEditMode={isEditMode} 
            />
            <div className="h-full pt-8 flex items-center justify-center">
              <div className="text-center">
                <FaInfoCircle className="text-4xl text-gray-400 mb-4 mx-auto" />
                <p className="text-gray-400">Correlation analysis coming soon</p>
                <p className="text-sm text-gray-500 mt-2">Will show relationships between price, volume, risk scores, and liquidity</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const MetricCard = ({ title, value, subtitle, color }: any) => (
    <div className="bg-gray-700 p-4 rounded">
      <p className="text-xs text-gray-400">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const visibleWidgets = widgets.filter(w => w.visible);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold mb-1">Analytics Dashboard</h1>
          <p className="text-gray-400 text-sm">
            Comprehensive market analysis and insights
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-4 py-2 rounded whitespace-nowrap transition-colors ${
              isEditMode ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            <FaCog className="inline mr-2" />
            {isEditMode ? 'Exit Edit' : 'Customize'}
          </button>
        </div>
      </header>

      {/* Widget Toggle Panel */}
      {isEditMode && (
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Toggle Widgets</h3>
          <div className="flex flex-wrap gap-2">
            {widgets.map(widget => (
              <button
                key={widget.id}
                onClick={() => toggleWidget(widget.id)}
                className={`px-3 py-1 rounded text-sm transition-colors whitespace-nowrap ${
                  widget.visible 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                {widget.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleWidgets.map(widget => renderWidget(widget))}
        </div>
      </main>

      <BottomNav onFilterClick={() => {}} onSearchFocus={() => document.querySelector('input')?.focus()} />
    </div>
  );
}

const WidgetHeader: React.FC<{
  widget: ChartWidget;
  onToggleExpand: (id: string) => void;
  isEditMode: boolean;
}> = ({ widget, onToggleExpand, isEditMode }) => {
  return (
    <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
      <div>
        <h3 className="text-sm font-semibold text-white">{widget.title}</h3>
        {widget.subtitle && <p className="text-xs text-gray-400">{widget.subtitle}</p>}
      </div>
      <button
        onClick={() => onToggleExpand(widget.id)}
        className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors opacity-0 group-hover:opacity-100"
        title="Expand/Collapse"
      >
        {widget.size === 'small' ? <FaExpand className="w-3 h-3" /> : <FaCompress className="w-3 h-3" />}
      </button>
    </div>
  );
};
