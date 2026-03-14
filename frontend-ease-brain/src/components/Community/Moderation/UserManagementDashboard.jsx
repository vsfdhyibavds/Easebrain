import { useState } from 'react';
import {
  useGetCommunityMembersWithStatusQuery,
  useSuspendUserMutation,
  useBanUserMutation,
  useRestoreUserMutation,
} from '../../../app/moderationApi';

export default function UserManagementDashboard({ communityId }) {
  const { data, isLoading } = useGetCommunityMembersWithStatusQuery({ communityId });
  const [_suspendUser] = useSuspendUserMutation();
  const [_banUser] = useBanUserMutation();
  const [_restoreUser] = useRestoreUserMutation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [actionReason, setActionReason] = useState('');

  const members = data?.members || [];

  const filteredMembers = members
    .filter((member) => {
      if (filterRole !== 'all' && member.role !== filterRole) return false;
      if (searchTerm && !member.user_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      // Moderators first, then active, then suspended
      const roleOrder = { moderator: 0, member: 1, banned: 2, suspended: 2 };
      return (roleOrder[a.status] || 999) - (roleOrder[b.status] || 999);
    });

  const handleAction = async (userId, action) => {
    // Would call API mutation here
    console.log(`Action: ${action} on user ${userId} with reason: ${actionReason}`);
    setSelectedUser(null);
    setActionType(null);
    setActionReason('');
  };

  const getStatusBadge = (status) => {
    if (status === 'active')
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">✓ Active</span>;
    if (status === 'suspended')
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">⏸️ Suspended</span>;
    if (status === 'banned')
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">🚫 Banned</span>;
    return null;
  };

  const getRoleBadge = (role) => {
    if (role === 'moderator')
      return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">👮 Moderator</span>;
    return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">👤 Member</span>;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading community members...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Community Members</h2>
        <p className="text-gray-600 text-sm">Manage user roles and restrictions ({members.length} total)</p>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by username..."
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Roles</option>
          <option value="member">Members</option>
          <option value="moderator">Moderators</option>
        </select>
      </div>

      {/* Members Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-teal-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Posts</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No members found
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{member.user_name}</p>
                      <p className="text-sm text-gray-500">{member.user_email}</p>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(member.role)}</td>
                    <td className="px-6 py-4">{getStatusBadge(member.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(member.joined_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.post_count || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedUser(member)}
                        className="px-3 py-1 text-sm bg-teal-100 text-teal-700 hover:bg-teal-200 rounded transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Manage User</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="font-semibold text-gray-900">{selectedUser.user_name}</p>
              <p className="text-sm text-gray-600">{selectedUser.user_email}</p>
              <div className="flex gap-2 mt-2">
                {getRoleBadge(selectedUser.role)}
                {getStatusBadge(selectedUser.status)}
              </div>
            </div>

            {/* Action Selection */}
            <div className="space-y-2 mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">Action</label>
              {selectedUser.status === 'active' && (
                <>
                  <button
                    onClick={() => setActionType('suspend')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      actionType === 'suspend'
                        ? 'bg-yellow-100 border-2 border-yellow-500 text-yellow-900'
                        : 'bg-gray-100 border-2 border-transparent text-gray-700 hover:bg-yellow-50'
                    }`}
                  >
                    ⏸️ Suspend User
                  </button>
                  <button
                    onClick={() => setActionType('ban')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      actionType === 'ban'
                        ? 'bg-red-100 border-2 border-red-500 text-red-900'
                        : 'bg-gray-100 border-2 border-transparent text-gray-700 hover:bg-red-50'
                    }`}
                  >
                    🚫 Ban User
                  </button>
                </>
              )}
              {(selectedUser.status === 'suspended' || selectedUser.status === 'banned') && (
                <button
                  onClick={() => setActionType('restore')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    actionType === 'restore'
                      ? 'bg-teal-100 border-2 border-teal-500 text-teal-900'
                      : 'bg-gray-100 border-2 border-transparent text-gray-700 hover:bg-teal-50'
                  }`}
                >
                  ✓ Restore Access
                </button>
              )}
            </div>

            {/* Reason */}
            {actionType && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Reason</label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={`Why are you ${actionType === 'restore' ? 'restoring' : actionType}ing this user?`}
                  maxLength={200}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{actionReason.length}/200</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              {actionType && (
                <button
                  onClick={() => handleAction(selectedUser.id, actionType)}
                  className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
                >
                  Confirm
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
