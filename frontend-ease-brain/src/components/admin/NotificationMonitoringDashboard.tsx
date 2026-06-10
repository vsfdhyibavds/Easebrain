import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AlertCircle, Download, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { AdminCard } from './AdminCard';
import { AdminTable } from './AdminTable';

interface NotificationStats {
  timestamp: string;
  total_attempts: number;
  successful: number;
  failed: number;
  success_rate: number;
  failure_rate: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
  errors: Record<string, number>;
}

interface NotificationLog {
  timestamp: string;
  event: string;
  type: string;
  status?: string;
  error_type?: string;
  error_message?: string;
  recipient_email: string;
  delivery_time_ms?: number;
}

const NOTIFICATION_TYPES = {
  warning_sign: { label: 'Warning Signs', color: '#f59e0b' },
  reminder_shared: { label: 'Reminder Shared', color: '#3b82f6' },
  crisis_alert: { label: 'Crisis Alert', color: '#ef4444' },
};

const STATUS_COLORS = {
  sent: '#10b981',
  failed: '#ef4444',
  skipped: '#8b5cf6',
  pending: '#f59e0b',
};

export const NotificationMonitoringDashboard: React.FC = () => {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'logs' | 'errors'>('overview');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const VITE_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${VITE_BASE_URL}/admin/notifications/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notification stats');
      }

      const data = await response.json();
      setStats(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching stats');
    }
  }, [VITE_BASE_URL]);

  const fetchLogs = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams({ limit: '50' });
      if (filterType) params.append('type', filterType);

      const response = await fetch(
        `${VITE_BASE_URL}/admin/notifications/logs?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      const data = await response.json();
      setLogs(data.data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  }, [VITE_BASE_URL, filterType]);

  const downloadLogs = async (format: 'json' | 'csv') => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${VITE_BASE_URL}/admin/notifications/download?format=${format}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notification_logs_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchLogs();
    setLoading(false);

    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchStats();
      fetchLogs();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchStats, fetchLogs, autoRefresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading notification stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <span className="text-red-700">{error}</span>
      </div>
    );
  }

  if (!stats) return null;

  const notificationTypeData = Object.entries(stats.by_type).map(([type, count]) => ({
    name: NOTIFICATION_TYPES[type as keyof typeof NOTIFICATION_TYPES]?.label || type,
    value: count,
    color: NOTIFICATION_TYPES[type as keyof typeof NOTIFICATION_TYPES]?.color || '#666',
  }));

  const errorData = Object.entries(stats.errors).map(([type, count]) => ({
    name: type,
    count,
  }));

  const performanceData = [
    {
      name: 'Successful',
      value: stats.successful,
      color: '#10b981',
    },
    {
      name: 'Failed',
      value: stats.failed,
      color: '#ef4444',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Notification Monitoring</h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              fetchStats();
              fetchLogs();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300 transition">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span className="text-sm text-gray-700">Auto-refresh (30s)</span>
          </label>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminCard
          title="Total Attempts"
          value={stats.total_attempts.toString()}
          icon="📊"
        />
        <AdminCard
          title="Successful"
          value={`${stats.successful} (${stats.success_rate}%)`}
          icon="✅"
        />
        <AdminCard
          title="Failed"
          value={`${stats.failed} (${stats.failure_rate}%)`}
          icon="❌"
        />
        <AdminCard
          title="Last Update"
          value={new Date(stats.timestamp).toLocaleTimeString()}
          icon="🕐"
        />
      </div>

      {/* Alert Banner */}
      {stats.failure_rate > 5 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-900">High Failure Rate Detected</h3>
            <p className="text-sm text-yellow-800">
              Notification failure rate is {stats.failure_rate}%. Please investigate recent errors.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          {(['overview', 'logs', 'errors'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`py-2 px-1 font-medium text-sm transition ${
                selectedTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Types Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">By Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={notificationTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {notificationTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Error Types Chart */}
          {errorData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Errors by Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={errorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Logs Tab */}
      {selectedTab === 'logs' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType(null)}
                className={`px-3 py-1 rounded text-sm ${
                  !filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {Object.entries(NOTIFICATION_TYPES).map(([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key)}
                  className={`px-3 py-1 rounded text-sm ${
                    filterType === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadLogs('json')}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                JSON
              </button>
              <button
                onClick={() => downloadLogs('csv')}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Timestamp</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Event</th>
                  <th className="px-4 py-2 text-left">Recipient</th>
                  <th className="px-4 py-2 text-left">Time (ms)</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-xs text-gray-600">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2 font-medium">
                      {NOTIFICATION_TYPES[log.type as keyof typeof NOTIFICATION_TYPES]?.label ||
                        log.type}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{log.event}</td>
                    <td className="px-4 py-2 text-xs text-gray-600">{log.recipient_email}</td>
                    <td className="px-4 py-2">
                      {log.delivery_time_ms ? log.delivery_time_ms.toFixed(2) : '-'}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor:
                            STATUS_COLORS[log.status as keyof typeof STATUS_COLORS] || '#ccc',
                          color: 'white',
                        }}
                      >
                        {log.status || log.event}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Errors Tab */}
      {selectedTab === 'errors' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Details</h3>
          {logs.filter((log) => log.error_type).length > 0 ? (
            <div className="space-y-3">
              {logs
                .filter((log) => log.error_type)
                .map((log, idx) => (
                  <div key={idx} className="bg-red-50 border border-red-200 rounded p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-red-900">{log.error_type}</p>
                        <p className="text-sm text-red-700 mt-1">{log.error_message}</p>
                        <p className="text-xs text-red-600 mt-2">
                          {log.recipient_email} •{' '}
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-600">No errors found in recent logs</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationMonitoringDashboard;
