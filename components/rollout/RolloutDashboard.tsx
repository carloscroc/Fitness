/**
 * Rollout Dashboard
 *
 * Monitoring dashboard for tracking the progress and health of the enhanced exercise library rollout.
 * Displays real-time metrics, user adoption rates, performance indicators, and success metrics.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Settings,
  Bell,
  Info,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

import { getCurrentPhase } from '../../config/exerciseLibraryRolloutConfig';

interface MetricData {
  timestamp: string;
  value: number;
  label?: string;
}

interface UserSegment {
  name: string;
  value: number;
  color: string;
}

interface FeatureUsage {
  feature: string;
  usage: number;
  users: number;
  growth: number;
}

interface HealthMetric {
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  target: number;
  trend: 'up' | 'down' | 'stable';
}

interface RolloutDashboardProps {
  environment?: string;
  refreshInterval?: number;
  className?: string;
}

const RolloutDashboard: React.FC<RolloutDashboardProps> = ({
  environment = 'development',
  refreshInterval = 30000,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(new Set(['adoption']));
  const [currentPhase, setCurrentPhase] = useState<any>(null);

  // Mock data - In real implementation, this would come from analytics service
  const [adoptionData, setAdoptionData] = useState<MetricData[]>([]);
  const [errorRateData, setErrorRateData] = useState<MetricData[]>([]);
  const [performanceData, setPerformanceData] = useState<MetricData[]>([]);
  const [userSegments, setUserSegments] = useState<UserSegment[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [feedbackSummary, setFeedbackSummary] = useState({
    positive: 0,
    neutral: 0,
    negative: 0,
    total: 0
  });

  useEffect(() => {
    loadData();
    if (autoRefresh) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [environment, selectedTimeRange, autoRefresh]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const phase = getCurrentPhase(environment);
      setCurrentPhase(phase);

      // Mock data generation - Replace with actual API calls
      await generateMockData();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = async () => {
    // Generate time series data
    const now = new Date();
    const hours = selectedTimeRange === '24h' ? 24 : selectedTimeRange === '7d' ? 168 : 720;

    const adoption: MetricData[] = [];
    const errors: MetricData[] = [];
    const performance: MetricData[] = [];

    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const timeStr = time.toISOString();

      // Adoption rate increases over time
      const baseAdoption = selectedTimeRange === '24h' ? 20 : 35;
      const adoptionRate = baseAdoption + Math.random() * 15 + (hours - i) * 0.1;
      adoption.push({ timestamp: timeStr, value: Math.min(adoptionRate, 95) });

      // Error rate with occasional spikes
      const baseError = 1.5;
      const errorSpike = Math.random() > 0.95 ? Math.random() * 3 : 0;
      errors.push({ timestamp: timeStr, value: baseError + errorSpike });

      // Performance score
      const basePerformance = 85;
      const performanceScore = basePerformance + Math.random() * 10 - Math.random() * 5;
      performance.push({ timestamp: timeStr, value: Math.min(Math.max(performanceScore, 70), 99) });
    }

    setAdoptionData(adoption);
    setErrorRateData(errors);
    setPerformanceData(performance);

    // User segments
    setUserSegments([
      { name: 'Internal Team', value: 0.1, color: '#3B82F6' },
      { name: 'Beta Users', value: 4.9, color: '#10B981' },
      { name: 'Power Users', value: 15, color: '#8B5CF6' },
      { name: 'Regular Users', value: 60, color: '#F59E0B' },
      { name: 'Not Rolled Out', value: 20, color: '#EF4444' }
    ]);

    // Feature usage
    setFeatureUsage([
      { feature: 'Enhanced Library', usage: 89, users: 12450, growth: 12.5 },
      { feature: 'Advanced Filtering', usage: 67, users: 9380, growth: 8.3 },
      { feature: 'Video Integration', usage: 45, users: 6300, growth: 23.1 },
      { feature: 'Progress Tracking', usage: 78, users: 10920, growth: 15.7 },
      { feature: 'Personalization', usage: 34, users: 4760, growth: 45.2 },
      { feature: 'Social Features', usage: 12, users: 1680, growth: 67.8 }
    ]);

    // Health metrics
    setHealthMetrics([
      { name: 'Adoption Rate', value: 68.5, status: 'healthy', target: 70, trend: 'up' },
      { name: 'Error Rate', value: 2.1, status: 'warning', target: 2, trend: 'down' },
      { name: 'Performance Score', value: 92.3, status: 'healthy', target: 90, trend: 'stable' },
      { name: 'User Satisfaction', value: 4.2, status: 'healthy', target: 4.0, trend: 'up' },
      { name: 'Retention Rate', value: 74.8, status: 'healthy', target: 70, trend: 'up' },
      { name: 'API Response Time', value: 145, status: 'warning', target: 100, trend: 'up' }
    ]);

    // Feedback summary
    setFeedbackSummary({
      positive: 342,
      neutral: 87,
      negative: 23,
      total: 452
    });
  };

  const toggleMetric = (metric: string) => {
    const newExpanded = new Set(expandedMetrics);
    if (newExpanded.has(metric)) {
      newExpanded.delete(metric);
    } else {
      newExpanded.add(metric);
    }
    setExpandedMetrics(newExpanded);
  };

  const exportData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      environment,
      timeRange: selectedTimeRange,
      currentPhase,
      metrics: {
        adoption: adoptionData,
        errors: errorRateData,
        performance: performanceData
      },
      userSegments,
      featureUsage,
      healthMetrics,
      feedback: feedbackSummary
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rollout-dashboard-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rollout Dashboard</h1>
            <p className="text-gray-600">Monitor the health and progress of the exercise library rollout</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-md ${
                autoRefresh ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}
              title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={exportData}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              title="Export data"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={loadData}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Environment: <strong>{environment}</strong></span>
          <span>Current Phase: <strong>{currentPhase?.name || 'N/A'}</strong></span>
          <span>Last updated: <strong>{lastRefresh.toLocaleTimeString()}</strong></span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthMetrics.map((metric) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{metric.name}</span>
              {getTrendIcon(metric.trend)}
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                {metric.name === 'User Satisfaction' ? metric.value.toFixed(1) :
                 metric.name === 'API Response Time' ? metric.value :
                 metric.value.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">/ {metric.target}%</span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metric.status === 'healthy' ? 'bg-green-500' :
                    metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adoption Rate Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Adoption Rate</h2>
            <button
              onClick={() => toggleMetric('adoption')}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedMetrics.has('adoption') ? <ChevronUp /> : <ChevronDown />}
            </button>
          </div>
          <ResponsiveContainer width="100%" height={expandedMetrics.has('adoption') ? 300 : 200}>
            <AreaChart data={adoptionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: any) => [`${value.toFixed(1)}%`, 'Adoption Rate']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                fill="#93BBFC"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Error Rate Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Error Rate</h2>
            <button
              onClick={() => toggleMetric('errors')}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedMetrics.has('errors') ? <ChevronUp /> : <ChevronDown />}
            </button>
          </div>
          <ResponsiveContainer width="100%" height={expandedMetrics.has('errors') ? 300 : 200}>
            <LineChart data={errorRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: any) => [`${value.toFixed(2)}%`, 'Error Rate']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* User Segments and Feature Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Segments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Segments</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userSegments}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {userSegments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [`${value}%`, 'Percentage']} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Feature Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Usage</h2>
          <div className="space-y-3">
            {featureUsage.map((feature) => (
              <div key={feature.feature} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{feature.feature}</span>
                  <span className="text-sm text-gray-600">{feature.usage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${feature.usage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatNumber(feature.users)} users</span>
                  <span className={feature.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                    {feature.growth > 0 ? '+' : ''}{feature.growth}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* User Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">User Feedback Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <ThumbsUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Positive</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {feedbackSummary.positive}
            </p>
            <p className="text-sm text-green-700">
              {((feedbackSummary.positive / feedbackSummary.total) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Neutral</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {feedbackSummary.neutral}
            </p>
            <p className="text-sm text-gray-700">
              {((feedbackSummary.neutral / feedbackSummary.total) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <ThumbsDown className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-900">Negative</span>
            </div>
            <p className="text-2xl font-bold text-red-900 mt-1">
              {feedbackSummary.negative}
            </p>
            <p className="text-sm text-red-700">
              {((feedbackSummary.negative / feedbackSummary.total) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Feedback</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {feedbackSummary.total}
            </p>
            <p className="text-sm text-blue-700">
              All responses
            </p>
          </div>
        </div>
      </motion.div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-700">Loading dashboard data...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RolloutDashboard;