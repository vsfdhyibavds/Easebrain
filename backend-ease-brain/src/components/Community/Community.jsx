import { useState } from 'react';
import { useSelector } from 'react-redux';
import CommunityBrowser from './CommunityBrowser';
import CommunityDetail from './CommunityDetail';
import PostDetailView from './PostDetailView';

export default function Community() {
  const [view, setView] = useState('browser'); // 'browser', 'detail', 'post'
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Get current user from Redux (adjust selector based on your auth store structure)
  const currentUser = useSelector((state) => state.auth?.user);
  const currentUserId = currentUser?.id;

  const handleSelectCommunity = (communityId) => {
    setSelectedCommunityId(communityId);
    setView('detail');
  };

  const handleSelectPost = (postId) => {
    setSelectedPostId(postId);
    setView('post');
  };

  const handleBack = () => {
    if (view === 'detail') {
      setView('browser');
      setSelectedCommunityId(null);
    } else if (view === 'post') {
      setView('detail');
      setSelectedPostId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {view === 'browser' && <CommunityBrowser onSelectCommunity={handleSelectCommunity} />}

      {view === 'detail' && (
        <CommunityDetail
          communityId={selectedCommunityId}
          currentUserId={currentUserId}
          onBack={handleBack}
          onSelectPost={handleSelectPost}
        />
      )}

      {view === 'post' && (
        <PostDetailView
          postId={selectedPostId}
          communityId={selectedCommunityId}
          currentUserId={currentUserId}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
