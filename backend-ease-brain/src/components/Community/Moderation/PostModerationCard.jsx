import { useState } from 'react';
import { useApprovePostMutation, useRejectPostMutation } from '../../../app/moderationApi';

export default function PostModerationCard({ post, isPending = false, onAction }) {
  const [approvePost, { isLoading: isApproving }] = useApprovePostMutation();
  const [rejectPost, { isLoading: isRejecting }] = useRejectPostMutation();
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReasonForm, setShowReasonForm] = useState(false);

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

  const handleApprove = async () => {
    try {
      await approvePost({
        postId: post.id,
        action: 'approve',
        reason: 'Approved by moderator',
      }).unwrap();
      onAction?.('approved');
    } catch {
      alert('Failed to approve post. Please try again.');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    try {
      await rejectPost({
        postId: post.id,
        reason: rejectionReason,
      }).unwrap();
      setRejectionReason('');
      setShowReasonForm(false);
      onAction?.('rejected');
    } catch {
      alert('Failed to reject post. Please try again.');
    }
  };

  const getModerationBadge = () => {
    if (post.moderation_status === 'approved')
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">✓ Approved</span>;
    if (post.moderation_status === 'pending')
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">⏳ Pending</span>;
    if (post.moderation_status === 'removed')
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">✕ Removed</span>;
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{post.title}</h3>
            {getModerationBadge()}
          </div>
          <p className="text-sm text-gray-600">
            By {post.is_anonymous ? 'Anonymous' : post.author_name || 'User'} •{' '}
            {formatDate(post.created_at)}
          </p>
        </div>
        {post.post_type && (
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
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
                  ? '💡 Tip'
                  : '🤝 Support'}
          </span>
        )}
      </div>

      {/* Trigger Warning */}
      {post.has_trigger_warning && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-red-800 text-sm font-semibold">⚠️ Trigger Warning</p>
          <p className="text-red-700 text-sm">{post.trigger_warning_text}</p>
        </div>
      )}

      {/* Content */}
      <div className="bg-gray-50 rounded p-4 mb-4">
        <p className="text-gray-700 text-sm whitespace-pre-wrap line-clamp-4">{post.content}</p>
        {post.content.length > 200 && <p className="text-gray-500 text-xs mt-2">... (truncated)</p>}
      </div>

      {/* Report Information (if flagged) */}
      {post.report_count > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
          <p className="text-yellow-800 text-sm font-semibold">🚩 Community Reports: {post.report_count}</p>
          {post.report_reasons && (
            <ul className="text-yellow-700 text-xs mt-2 space-y-1">
              {Object.entries(post.report_reasons).map(([reason, count]) => (
                <li key={reason}>
                  • {reason}: {count}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-6 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
        <span>👍 {post.like_count || 0} likes</span>
        <span>💬 {post.reply_count || 0} replies</span>
        <span>✅ {post.helpful_count || 0} helpful</span>
      </div>

      {/* Action Buttons */}
      {isPending ? (
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-2 rounded-lg transition"
          >
            {isApproving ? '✓ Approving...' : '✓ Approve Post'}
          </button>
          <button
            onClick={() => setShowReasonForm(!showReasonForm)}
            disabled={isApproving || isRejecting}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium py-2 rounded-lg transition"
          >
            ✕ Reject Post
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-2 rounded-lg transition"
          >
            {isApproving ? '✓ Removing Report...' : '✓ Clear Flags'}
          </button>
          <button
            onClick={() => setShowReasonForm(!showReasonForm)}
            disabled={isApproving || isRejecting}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium py-2 rounded-lg transition"
          >
            🗑️ Remove Post
          </button>
        </div>
      )}

      {/* Rejection Form */}
      {showReasonForm && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Reason for {isPending ? 'Rejection' : 'Removal'}
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder={
              isPending
                ? 'Why are you rejecting this post?'
                : 'Why are you removing this post?'
            }
            maxLength={500}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500">
              {rejectionReason.length}/500 characters
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowReasonForm(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isApproving || isRejecting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium rounded-lg transition"
              >
                {isRejecting ? 'Confirming...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
