import { useState } from 'react';
import { useGetCommunityQuery, useGetCommunityPostsQuery } from '../../app/communityApi';
import PostCard from './PostCard';
import PostCreationForm from './PostCreationForm';
import ModerationDashboard from './Moderation/ModerationDashboard';
import ModerationAccess from './Moderation/ModerationAccess';

export default function CommunityDetail({ communityId, currentUserId, onBack, onSelectPost }) {
  const [showPostForm, setShowPostForm] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModeration, setShowModeration] = useState(false);

  const { data: communityData, isLoading: communityLoading } = useGetCommunityQuery(communityId);
  const { data: postsData, isLoading: postsLoading, refetch: refetchPosts } = useGetCommunityPostsQuery({
    communityId,
    sortBy,
    page: currentPage,
    perPage: 20,
  });

  const community = communityData?.community || {};
  const posts = postsData?.posts || [];
  const pagination = postsData?.pagination || {};

  const getColorClass = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200',
      gray: 'bg-gray-50 border-gray-200',
      purple: 'bg-purple-50 border-purple-200',
      green: 'bg-green-50 border-green-200',
      yellow: 'bg-yellow-50 border-yellow-200',
      gold: 'bg-yellow-50 border-yellow-200',
    };
    return colorMap[color] || 'bg-gray-50 border-gray-200';
  };

  if (communityLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading community...</p>
      </div>
    );
  }

  if (showModeration) {
    return (
      <ModerationAccess communityId={communityId} currentUserId={currentUserId}>
        <ModerationDashboard communityId={communityId} onBack={() => setShowModeration(false)} />
      </ModerationAccess>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-6 transition-colors"
      >
        <span>←</span> Back to Communities
      </button>

      {/* Community Header */}
      <div className={`rounded-lg border-2 p-8 mb-8 ${getColorClass(community.color)}`}>
        <div className="flex items-start gap-6 justify-between">
          <div className="flex items-start gap-6 flex-1">
            {/* Icon */}
            <div className="text-6xl">{community.icon}</div>

            {/* Community Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">{community.name}</h1>
                <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                  {community.subject_area}
                </span>
              </div>
              <p className="text-lg text-gray-700 mb-4">{community.description}</p>

              {/* Stats */}
              <div className="flex gap-6 text-sm text-gray-600">
                <span>📝 {community.post_count || 0} posts</span>
                <span>💬 {community.reply_count || 0} replies</span>
                <span>👥 {community.member_count || 0} members</span>
                <span>👮 {community.moderator_count || 0} moderators</span>
              </div>
            </div>
          </div>

          {/* Moderation Button (if moderator) */}
          {community.moderators?.some((mod) => mod.id === currentUserId) && (
            <button
              onClick={() => setShowModeration(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap h-fit"
            >
              👮 Moderate
            </button>
          )}
        </div>

        {/* Crisis Hotline */}
        {community.crisis_hotline_phone && (
          <div className="mt-6 bg-red-100 border border-red-400 rounded-lg p-4">
            <p className="text-red-900 font-semibold">
              🚨 Crisis Support Available: {community.crisis_hotline_phone}
            </p>
            <p className="text-red-800 text-sm mt-1">
              {community.crisis_hotline_description || 'Contact this number if you need immediate help.'}
            </p>
          </div>
        )}
      </div>

      {/* Community Guidelines */}
      <details className="mb-8 bg-teal-50 border border-teal-200 rounded-lg">
        <summary className="px-6 py-4 font-semibold text-gray-900 cursor-pointer hover:bg-teal-100 transition-colors">
          📋 Community Guidelines
        </summary>
        <div className="px-6 py-4 border-t border-teal-200 text-gray-700 text-sm space-y-2">
          <p>• Be respectful to all members</p>
          <p>• No promotion of self-harm or suicide</p>
          <p>• No medical advice - seek professional help if needed</p>
          <p>• Maintain confidentiality of others</p>
          <p>• No spam, hate speech, or discrimination</p>
          <p>• Trigger warnings required for sensitive content</p>
        </div>
      </details>

      {/* Create Post Section */}
      <div className="mb-8">
        {!showPostForm ? (
          <button
            onClick={() => setShowPostForm(true)}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-lg transition-colors"
          >
            ✍️ Create a Post
          </button>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">New Post</h3>
              <button
                onClick={() => setShowPostForm(false)}
                className="text-gray-500 hover:text-gray-700 font-bold text-xl"
              >
                ✕
              </button>
            </div>
            <PostCreationForm
              communityId={communityId}
              onPostCreated={() => {
                setShowPostForm(false);
                refetchPosts();
              }}
              onCancel={() => setShowPostForm(false)}
            />
          </div>
        )}
      </div>

      {/* Sort Controls */}
      <div className="mb-6 flex items-center gap-4">
        <span className="text-gray-700 font-medium">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular (Likes)</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* Posts Loading State */}
      {postsLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading posts...</p>
        </div>
      )}

      {/* Posts Grid */}
      {!postsLoading && posts.length > 0 && (
        <div className="space-y-4 mb-8">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              communityId={communityId}
              currentUserId={currentUserId}
              onReply={() => refetchPosts()}
              onView={() => onSelectPost(post.id)}
            />
          ))}
        </div>
      )}

      {/* Empty Posts State */}
      {!postsLoading && posts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-lg">No posts in this community yet.</p>
          <p className="text-gray-500 text-sm mt-2">Be the first to start a conversation!</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 rounded font-medium transition-colors"
          >
            Previous
          </button>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
            disabled={currentPage === pagination.pages}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 rounded font-medium transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
