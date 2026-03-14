import { useState } from 'react';
import { useGetFlaggedPostsQuery } from '../../../app/communityApi';
import PostModerationCard from './PostModerationCard';

export default function FlaggedPostsQueue({ communityId, onRefresh }) {
  const { data, isLoading, refetch } = useGetFlaggedPostsQuery(communityId);
  const [sortBy, setSortBy] = useState('most-reported');
  const [filterReason, setFilterReason] = useState('all');

  const posts = data?.posts || [];

  const sortedAndFilteredPosts = posts
    .filter((post) => {
      if (filterReason === 'all') return true;
      return post.primary_report_reason === filterReason;
    })
    .sort((a, b) => {
      if (sortBy === 'most-reported') {
        return (b.report_count || 0) - (a.report_count || 0);
      } else if (sortBy === 'oldest') {
        return new Date(a.first_flagged_at) - new Date(b.first_flagged_at);
      } else if (sortBy === 'newest') {
        return new Date(b.first_flagged_at) - new Date(a.first_flagged_at);
      }
      return 0;
    });

  const reportReasons = [
    { value: 'harmful_advice', label: 'Harmful Advice' },
    { value: 'hate_speech', label: 'Hate Speech' },
    { value: 'self_harm', label: 'Self Harm' },
    { value: 'inappropriate', label: 'Inappropriate' },
    { value: 'spam', label: 'Spam' },
  ];

  const handleAction = () => {
    refetch();
    onRefresh?.();
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading flagged posts...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Reported Posts</h2>
          <p className="text-gray-600 text-sm">Posts flagged by community members ({posts.length})</p>
        </div>

        {/* Controls */}
        <div className="flex gap-3 flex-wrap">
          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Reasons</option>
            {reportReasons.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="most-reported">Most Reported</option>
            <option value="oldest">Oldest Flag</option>
            <option value="newest">Newest Flag</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <p className="text-green-700 text-lg font-semibold">✓ No flagged posts!</p>
          <p className="text-green-600 text-sm mt-2">Community is running smoothly.</p>
        </div>
      )}

      {/* Filtered Empty State */}
      {posts.length > 0 && sortedAndFilteredPosts.length === 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-8 text-center">
          <p className="text-teal-700 text-lg font-semibold">No posts match this filter</p>
          <p className="text-teal-600 text-sm mt-2">Try a different reason or sort option.</p>
        </div>
      )}

      {/* Posts List */}
      {sortedAndFilteredPosts.length > 0 && (
        <div>
          {sortedAndFilteredPosts.map((post) => (
            <PostModerationCard
              key={post.id}
              post={post}
              isPending={false}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
