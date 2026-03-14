import { useGetPendingPostsQuery, useGetFlaggedPostsQuery } from '../../../app/communityApi';

export default function ModerationStats({ selectedCommunityId }) {
  const { data: pendingData } = useGetPendingPostsQuery({ communityId: selectedCommunityId });
  const { data: flaggedData } = useGetFlaggedPostsQuery(selectedCommunityId);

  const pendingCount = pendingData?.posts?.length || 0;
  const flaggedCount = flaggedData?.posts?.length || 0;
  const totalToModerate = pendingCount + flaggedCount;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Pending Posts Card */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-700 text-sm font-medium">Pending Approval</p>
            <p className="text-4xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
            <p className="text-yellow-600 text-xs mt-1">Posts awaiting review</p>
          </div>
          <div className="text-5xl">⏳</div>
        </div>
      </div>

      {/* Flagged Posts Card */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-700 text-sm font-medium">Flagged for Review</p>
            <p className="text-4xl font-bold text-red-600 mt-2">{flaggedCount}</p>
            <p className="text-red-600 text-xs mt-1">Community reported posts</p>
          </div>
          <div className="text-5xl">🚩</div>
        </div>
      </div>

      {/* Total to Moderate */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-teal-700 text-sm font-medium">Total Action Needed</p>
            <p className="text-4xl font-bold text-teal-600 mt-2">{totalToModerate}</p>
            <p className="text-teal-600 text-xs mt-1">Items in moderation queue</p>
          </div>
          <div className="text-5xl">📋</div>
        </div>
      </div>
    </div>
  );
}
