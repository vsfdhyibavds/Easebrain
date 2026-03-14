import { useGetCommunityQuery } from '../../../app/communityApi';

export default function ModerationAccess({ communityId, currentUserId, children }) {
  const { data } = useGetCommunityQuery(communityId);
  const community = data?.community || {};

  // Check if current user is a moderator
  const isModerator = community.moderators?.some((mod) => mod.id === currentUserId);

  if (!isModerator) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-700 text-lg font-semibold">Access Denied</p>
          <p className="text-red-600 text-sm mt-2">
            You must be a moderator to access the moderation dashboard.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
