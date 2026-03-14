import { useState } from 'react';
import { useGetModerationLogsQuery } from '../../../app/moderationApi';

export default function ModerationLogs({ communityId }) {
  const [filterAction, setFilterAction] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, _setPage] = useState(1);

  const { data, isLoading: _isLoading, error: _error } = useGetModerationLogsQuery({
    communityId,
    page,
    perPage: 20,
    actionType: filterAction !== 'all' ? filterAction : null,
  });

  const logs = data?.logs || [];

  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === 'all' || log.targetType === filterType;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q || (log.targetTitle && log.targetTitle.toLowerCase().includes(q)) || (log.moderatorName && log.moderatorName.toLowerCase().includes(q));
    return matchesType && matchesSearch;
  });

  const getActionBadge = (action) => {
    const badges = {
      approve: 'bg-green-100 text-green-800',
      reject: 'bg-red-100 text-red-800',
      suspend: 'bg-yellow-100 text-yellow-800',
      ban: 'bg-red-100 text-red-800',
      restore: 'bg-teal-100 text-teal-800',
      remove: 'bg-red-100 text-red-800',
    };
    const icons = {
      approve: '✓',
      reject: '✕',
      suspend: '⏸️',
      ban: '🚫',
      restore: '↩️',
      remove: '🗑️',
    };
    return (
      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${badges[action] || 'bg-gray-100 text-gray-800'}`}>
        {icons[action]} {action.charAt(0).toUpperCase() + action.slice(1)}
      </span>
    );
  };

  const getTargetIcon = (type) => {
    return type === 'post' ? '📝' : '👤';
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Moderation Audit Trail</h2>
        <p className="text-gray-600 text-sm">Complete log of all moderation actions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by post/user title..."
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Actions</option>
          <option value="approve">Approve</option>
          <option value="reject">Reject</option>
          <option value="suspend">Suspend</option>
          <option value="ban">Ban</option>
          <option value="restore">Restore</option>
          <option value="remove">Remove</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Types</option>
          <option value="post">Posts</option>
          <option value="user">Users</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-teal-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Timestamp</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Moderator</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Target</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No moderation logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatTime(log.timestamp)}
                      <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.moderatorName}</td>
                    <td className="px-6 py-4">{getActionBadge(log.action)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span>{getTargetIcon(log.targetType)}</span>
                        <span className="text-gray-900 font-medium">{log.targetTitle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-center">
          <p className="text-teal-600 text-sm font-medium">Total Actions</p>
          <p className="text-2xl font-bold text-teal-700">{logs.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-600 text-sm font-medium">Approved</p>
          <p className="text-2xl font-bold text-green-700">{logs.filter((l) => l.action_type === 'approve').length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 text-sm font-medium">Rejected</p>
          <p className="text-2xl font-bold text-red-700">{logs.filter((l) => l.action_type === 'reject' || l.action_type === 'remove').length}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-600 text-sm font-medium">Suspended</p>
          <p className="text-2xl font-bold text-yellow-700">{logs.filter((l) => l.action_type === 'suspend').length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <p className="text-purple-600 text-sm font-medium">Restored</p>
          <p className="text-2xl font-bold text-purple-700">{logs.filter((l) => l.action_type === 'restore').length}</p>
        </div>
      </div>
    </div>
  );
}
