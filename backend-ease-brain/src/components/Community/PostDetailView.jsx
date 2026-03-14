import { useState } from 'react';
import { useGetPostQuery, useReplyToPostMutation } from '../../app/communityApi';
import TriggerWarningToggle from './TriggerWarningToggle';

export default function PostDetailView({ postId, onBack }) {
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const { data, isLoading, error } = useGetPostQuery(postId);
  const [replyToPost] = useReplyToPostMutation();

  const post = data?.post || {};
  const replies = data?.replies || [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;

    setIsSubmittingReply(true);
    try {
      await replyToPost({
        postId,
        content: replyContent,
      }).unwrap();

      setReplyContent('');
    } catch {
      alert('Failed to post reply. Please try again.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-6 transition-colors"
        >
          <span>←</span> Back to Community
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">Failed to load post. Please try again.</p>
        </div>
      </div>
    );
  }

  const getModerationBadge = () => {
    if (post.moderation_status === 'approved')
      return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">✓ Approved</span>;
    if (post.moderation_status === 'pending')
      return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">⏳ Pending Review</span>;
    if (post.moderation_status === 'removed')
      return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">✕ Removed</span>;
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-6 transition-colors"
      >
        <span>←</span> Back to Community
      </button>

      {/* Post Container */}
      <article className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
        {/* Post Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold text-gray-900">
                  {post.is_anonymous ? '👤 Anonymous User' : `👤 ${post.author_name || 'User'}`}
                </p>
                <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
              </div>
              {post.is_anonymous && (
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">Anonymous</span>
              )}
            </div>
            <div className="flex items-center gap-2">{getModerationBadge()}</div>
          </div>

          {/* Post Type */}
          {post.post_type && (
            <div className="mb-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  post.post_type === 'discussion'
                    ? 'bg-teal-100 text-teal-800'
                    : post.post_type === 'question'
                      ? 'bg-purple-100 text-purple-800'
                      : post.post_type === 'tip'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                }`}
              >
                {post.post_type === 'discussion'
                  ? '💬 Discussion'
                  : post.post_type === 'question'
                    ? '❓ Question'
                    : post.post_type === 'tip'
                      ? '💡 Tip/Resource'
                      : '🤝 Support Request'}
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

        {/* Trigger Warning */}
        {post.has_trigger_warning && (
          <TriggerWarningToggle warningText={post.trigger_warning_text}>
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">{post.content}</div>
          </TriggerWarningToggle>
        )}

        {/* Content (without warning) */}
        {!post.has_trigger_warning && (
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">{post.content}</div>
        )}

        {/* Post Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex gap-8 text-sm text-gray-600">
          <span>👍 {post.like_count || 0} likes</span>
          <span>✅ {post.helpful_count || 0} found helpful</span>
          <span>💬 {replies.length} replies</span>
          {post.report_count > 0 && <span>🚩 {post.report_count} reports</span>}
        </div>
      </article>

      {/* Replies Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Replies ({replies.length})
        </h2>

        {replies.length > 0 ? (
          <div className="space-y-4 mb-6">
            {replies.map((reply) => (
              <div key={reply.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {reply.is_anonymous ? '👤 Anonymous' : `👤 ${reply.author_name || 'User'}`}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(reply.created_at)}</p>
                  </div>
                  {reply.is_helpful && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      ✓ Helpful
                    </span>
                  )}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                <div className="mt-3 flex gap-4 text-sm text-gray-600">
                  <span>👍 {reply.like_count || 0} likes</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No replies yet. Be the first to respond!</p>
        )}
      </div>

      {/* Reply Form */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 mb-4">Share Your Thoughts</h3>
        <div className="flex flex-col gap-4">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply here... (be supportive and respectful)"
            maxLength={2000}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {replyContent.length}/2000 characters
            </span>
            <button
              onClick={handleSubmitReply}
              disabled={!replyContent.trim() || isSubmittingReply}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmittingReply ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
