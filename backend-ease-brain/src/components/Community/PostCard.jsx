import { useState } from 'react';
import { useLikePostMutation, useReportPostMutation } from '../../app/communityApi';

export default function PostCard({ post, onReply, onView }) {
  const [likePost] = useLikePostMutation();
  const [reportPost] = useReportPostMutation();
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const handleLike = async () => {
    try {
      await likePost(post.id).unwrap();
    } catch (_error) {
      console.error('Error liking post:', _error);
    }
  };

  const handleReport = async () => {
    if (!reportReason) {
      alert('Please select a reason');
      return;
    }
    try {
      await reportPost({ postId: post.id, reason: reportReason, description: reportDescription }).unwrap();
      setShowReportForm(false);
      setReportReason('');
      setReportDescription('');
      alert('Post reported successfully. Thank you for helping keep our community safe.');
    } catch (_error) {
      console.error('Error reporting post:', _error);
      alert('Failed to report post');
    }
  };

  const truncateContent = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const isModerator = post.moderation_status !== undefined; // Simplified check

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {post.author?.username || 'Anonymous'}
            </span>
            {post.is_anonymous && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Anonymous</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
        </div>
        {isModerator && post.moderation_status && (
          <div className={`px-3 py-1 rounded text-xs font-medium ${
            post.moderation_status === 'approved' ? 'bg-green-100 text-green-800' :
            post.moderation_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {post.moderation_status.charAt(0).toUpperCase() + post.moderation_status.slice(1)}
          </div>
        )}
      </div>

      {/* Trigger Warning Badge */}
      {post.has_trigger_warning && (
        <div className="mb-3 flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded text-sm">
          <span>⚠️</span>
          <span>Trigger Warning: {post.trigger_warning_text || 'Sensitive content'}</span>
        </div>
      )}

      {/* Title */}
      <h3 className="font-semibold text-lg text-gray-900 mb-2">{post.title}</h3>

      {/* Content Preview */}
      <p className="text-gray-700 mb-4">{truncateContent(post.content)}</p>

      {/* Engagement Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
        <span>❤️ {post.likes}</span>
        <span>💬 {post.reply_count}</span>
        {post.helpful_count > 0 && <span>✓ {post.helpful_count} helpful</span>}
        {post.flagged_count > 0 && isModerator && (
          <span className="text-red-600">🚩 {post.flagged_count} reports</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleLike}
          className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          ❤️ Like
        </button>
        <button
          onClick={() => onReply?.(post.id)}
          className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          💬 Reply
        </button>
        <button
          onClick={() => onView?.(post.id)}
          className="px-3 py-2 text-sm bg-teal-100 text-teal-700 hover:bg-teal-200 rounded transition-colors"
        >
          View Full Post
        </button>
        {!showReportForm && (
          <button
            onClick={() => setShowReportForm(true)}
            className="px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded transition-colors ml-auto"
          >
            ⚠️ Report
          </button>
        )}
      </div>

      {/* Report Form */}
      {showReportForm && (
        <div className="mt-4 p-4 bg-red-50 rounded border border-red-200">
          <h4 className="font-semibold text-red-900 mb-3">Report Post</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select a reason</option>
                <option value="harmful_advice">Harmful Advice</option>
                <option value="hate_speech">Hate Speech</option>
                <option value="self_harm">Self Harm Content</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="spam">Spam</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Details (optional)</label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Tell us more about why you're reporting this post..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReport}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
              >
                Submit Report
              </button>
              <button
                onClick={() => {
                  setShowReportForm(false);
                  setReportReason('');
                  setReportDescription('');
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
