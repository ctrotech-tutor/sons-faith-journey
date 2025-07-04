import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCommunityData } from '@/hooks/useCommunityData';
import { useCommunityActions } from '@/hooks/useCommunityActions';
import CommunityHeader from '@/components/community/CommunityHeader';
import PostsList from '@/components/community/PostsList';
import CommunityFilters from '@/components/community/CommunityFilters';
import { Search, Home, Users, Plus } from 'lucide-react';

const Community = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'recent' | 'trending' | 'popular' | 'admin'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
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
    navigate(`/post/${postId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-lg p-8 text-center shadow-lg max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Join Our Community</h2>
          <p className="text-muted-foreground mb-6">Connect with like-minded believers and share your journey.</p>
          <Button onClick={() => navigate('/auth/login')} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  const filteredPosts = getFilteredPosts(filter, hashtagFilter);
  const filteredBySearch = searchQuery 
    ? filteredPosts.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredPosts;

  return (
    <div className="min-h-screen bg-background">
      <CommunityHeader 
        hashtagFilter={hashtagFilter}
        clearHashtagFilter={clearHashtagFilter}
      />
      
      <main className="flex-1 bg-muted/30">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <CommunityFilters 
            filter={filter}
            setFilter={setFilter}
          />
          
          <PostsList
            posts={filteredBySearch}
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
      </main>
    </div>
  );
};

export default Community;