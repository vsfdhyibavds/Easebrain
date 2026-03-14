import { useState } from 'react';
import { useGetCommunityQuery } from '../../../app/communityApi';
import ModerationStats from './ModerationStats';
import PendingPostsQueue from './PendingPostsQueue';
import FlaggedPostsQueue from './FlaggedPostsQueue';
import UserManagementDashboard from './UserManagementDashboard';
import ModerationLogs from './ModerationLogs';
import CommunityModerationSettings from './CommunityModerationSettings';
import PostRevisionHistory from './PostRevisionHistory';

export default function ModerationDashboard({ communityId, onBack }) {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'flagged', 'users', 'logs', 'settings', 'history'
  const [refreshKey, setRefreshKey] = useState(0);
  const [_selectedPostId, _setSelectedPostId] = useState(null);

  const { data: communityData } = useGetCommunityQuery(communityId);
  const community = communityData?.community || {};

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-6 transition-colors"
      >
        <span>←</span> Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">{community.icon}</div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
            <p className="text-gray-600">Moderation Dashboard</p>
          </div>
        </div>
        <p className="text-gray-700">
          Review pending posts, manage users, and configure community settings to maintain a safe, supportive environment.
        </p>
      </div>

      {/* Stats */}
      <ModerationStats key={refreshKey} selectedCommunityId={communityId} />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'pending'
              ? 'text-teal-600 border-teal-600'
              : 'text-gray-600 hover:text-gray-900 border-transparent'
          }`}
        >
          ⏳ Pending Approval
        </button>
        <button
          onClick={() => setActiveTab('flagged')}
          className={`px-4 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'flagged'
              ? 'text-teal-600 border-teal-600'
              : 'text-gray-600 hover:text-gray-900 border-transparent'
          }`}
        >
          🚩 Community Reports
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'text-teal-600 border-teal-600'
              : 'text-gray-600 hover:text-gray-900 border-transparent'
          }`}
        >
          👥 User Management
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'logs'
              ? 'text-teal-600 border-teal-600'
              : 'text-gray-600 hover:text-gray-900 border-transparent'
          }`}
        >
          📋 Audit Trail
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'text-teal-600 border-teal-600'
              : 'text-gray-600 hover:text-gray-900 border-transparent'
          }`}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'pending' && (
        <PendingPostsQueue key={`pending-${refreshKey}`} communityId={communityId} onRefresh={handleRefresh} />
      )}

      {activeTab === 'flagged' && (
        <FlaggedPostsQueue key={`flagged-${refreshKey}`} communityId={communityId} onRefresh={handleRefresh} />
      )}

      {activeTab === 'users' && (
        <UserManagementDashboard key={`users-${refreshKey}`} communityId={communityId} />
      )}

      {activeTab === 'logs' && (
        <ModerationLogs key={`logs-${refreshKey}`} communityId={communityId} />
      )}

      {activeTab === 'settings' && (
        <CommunityModerationSettings key={`settings-${refreshKey}`} communityId={communityId} communityName={community.name} />
      )}
    </div>
  );
}
