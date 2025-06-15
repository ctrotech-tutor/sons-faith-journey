
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/use-toast';
import { Button } from '@/components/ui/button';
import CommunityHeader from '@/components/community/CommunityHeader';
import CommunityFilters from '@/components/community/CommunityFilters';
import PostsList from '@/components/community/PostsList';
import CommentsSlideUp from '@/components/community/CommentsSlideUp';
import { useCommunityData } from '@/hooks/useCommunityData';
import { useCommunityActions } from '@/hooks/useCommunityActions';

const Community = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'recent' | 'trending' | 'popular' | 'admin'>('recent');
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const [hashtagFilter, setHashtagFilter] = useState<string | null>(null);

  const { posts, loading, bookmarkedPosts, getFilteredPosts } = useCommunityData(user, userProfile);
  
  const {
    expandedPosts,
    likeAnimations,
    bookmarkAnimations,
    toggleExpanded,
    handleLike,
    toggleBookmark,
    sharePost,
    openCommentsModal
  } = useCommunityActions(user, userProfile, posts);

  const handleHashtagClick = (hashtag: string) => {
    setHashtagFilter(hashtag);
    toast({
      title: 'Filtered by hashtag',
      description: `Showing posts with ${hashtag}`
    });
  };

  const clearHashtagFilter = () => {
    setHashtagFilter(null);
  };

  const handleOpenCommentsModal = (postId: string) => {
    openCommentsModal(postId);
    setSelectedPostForComments(postId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-lg max-w-md">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Join Our Community</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Connect with like-minded believers and share your journey.</p>
          <Button onClick={() => window.location.href = '/auth/login'}>
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  const filteredPosts = getFilteredPosts(filter, hashtagFilter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <CommunityHeader 
        hashtagFilter={hashtagFilter}
        clearHashtagFilter={clearHashtagFilter}
      />
      
      <CommunityFilters filter={filter} setFilter={setFilter} />

      <div className="pb-20">
        <div className="max-w-md mx-auto">
          <PostsList
            posts={filteredPosts}
            loading={loading}
            filter={filter}
            hashtagFilter={hashtagFilter}
            expandedPosts={expandedPosts}
            likeAnimations={likeAnimations}
            bookmarkedPosts={bookmarkedPosts}
            bookmarkAnimations={bookmarkAnimations}
            onToggleExpanded={toggleExpanded}
            onHandleLike={handleLike}
            onToggleBookmark={toggleBookmark}
            onSharePost={sharePost}
            onOpenCommentsModal={handleOpenCommentsModal}
            onHashtagClick={handleHashtagClick}
          />
        </div>
      </div>

      <CommentsSlideUp
        postId={selectedPostForComments || ''}
        isOpen={!!selectedPostForComments}
        onClose={() => setSelectedPostForComments(null)}
      />
    </div>
  );
};

export default Community;
