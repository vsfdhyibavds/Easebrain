import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronLeft } from 'lucide-react';
import { useCheckModeratorStatusQuery } from '../app/communityApi';
import CommunityDetail from '../components/Community/CommunityDetail';
import PostDetailView from '../components/Community/PostDetailView';
import PostCreationForm from '../components/Community/PostCreationForm';
import ModerationDashboard from '../components/Community/Moderation/ModerationDashboard';

export default function CommunityGroupDetail() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState('detail'); // 'detail', 'post', 'create', 'moderation'
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Get current user from Redux
  const currentUser = useSelector((state) => state.auth?.user);
  const currentUserId = currentUser?.id;

  // Check if user is moderator using RTK Query
  const { data: moderatorData, isLoading: _checkingModerator } = useCheckModeratorStatusQuery(
    parseInt(communityId),
    { skip: !communityId || !currentUserId }
  );

  const isModerator = moderatorData?.isModerator || false;

  const handleBack = () => {
    if (view === 'post') {
      setView('detail');
      setSelectedPostId(null);
    } else if (view === 'create') {
      setView('detail');
      setShowCreateForm(false);
    } else if (view === 'moderation') {
      setView('detail');
    } else {
      navigate('/community');
    }
  };

  const handleSelectPost = (postId) => {
    setSelectedPostId(postId);
    setView('post');
  };

  const handleCreatePost = () => {
    setShowCreateForm(true);
    setView('create');
  };

  const handlePostCreated = () => {
    setView('detail');
    setShowCreateForm(false);
    // Trigger refresh of posts
    window.location.reload();
  };

  const handleOpenModeration = () => {
    setView('moderation');
  };

  return (
    <>
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition"
          >
            <ChevronLeft className="h-5 w-5" />
            {view === 'detail' ? 'Back to Communities' : 'Back'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {view === 'detail' && (
          <>
            <CommunityDetail
              communityId={parseInt(communityId)}
              currentUserId={currentUserId}
              onBack={handleBack}
              onSelectPost={handleSelectPost}
              onCreatePost={handleCreatePost}
              onOpenModeration={isModerator ? handleOpenModeration : null}
            />
            {showCreateForm && (
              <PostCreationForm
                communityId={parseInt(communityId)}
                currentUserId={currentUserId}
                onClose={() => {
                  setShowCreateForm(false);
                  setView('detail');
                }}
                onSuccess={handlePostCreated}
              />
            )}
          </>
        )}

        {view === 'post' && (
          <PostDetailView
            postId={selectedPostId}
            communityId={parseInt(communityId)}
            currentUserId={currentUserId}
            onBack={handleBack}
          />
        )}

        {view === 'create' && (
          <div className="py-8">
            <PostCreationForm
              communityId={parseInt(communityId)}
              currentUserId={currentUserId}
              onClose={handleBack}
              onSuccess={handlePostCreated}
            />
          </div>
        )}

        {view === 'moderation' && isModerator && (
          <div className="py-8">
            <ModerationDashboard
              communityId={parseInt(communityId)}
              currentUserId={currentUserId}
              onBack={handleBack}
            />
          </div>
        )}
      </div>
    </>
  );
}
