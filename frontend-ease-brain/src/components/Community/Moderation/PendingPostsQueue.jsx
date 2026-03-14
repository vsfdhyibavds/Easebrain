import { useState } from 'react';
import { useGetPendingPostsQuery } from '../../../app/moderationApi';
import PostModerationCard from './PostModerationCard';

export default function PendingPostsQueue({ communityId, onRefresh }) {
  const { data, isLoading, refetch } = useGetPendingPostsQuery({ communityId });
  const [sortBy, setSortBy] = useState('oldest');

  const posts = data?.posts || [];

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at);
    } else if (sortBy === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy === 'reported') {
      return (b.report_count || 0) - (a.report_count || 0);
    }
    return 0;
  });

  const handleAction = () => {
    refetch();
    onRefresh?.();
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading pending posts...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pending Approval</h2>
          <p className="text-gray-600 text-sm">Posts awaiting moderator review ({posts.length})</p>
        </div>

        {/* Sort Controls */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="oldest">Oldest First</option>
          <option value="newest">Newest First</option>
          <option value="reported">Most Reported</option>
        </select>
      </div>

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <p className="text-green-700 text-lg font-semibold">✓ All caught up!</p>
          <p className="text-green-600 text-sm mt-2">No posts pending approval.</p>
        </div>
      )}

      {/* Posts List */}
      {posts.length > 0 && (
        <div>
          {sortedPosts.map((post) => (
            <PostModerationCard
              key={post.id}
              post={post}
              isPending={true}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
