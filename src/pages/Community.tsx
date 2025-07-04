import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import LazyImage from '@/components/LazyImage';
import LazyVideo from '@/components/LazyVideo';
import { useCommunityData } from '@/hooks/useCommunityData';
import { useCommunityActions } from '@/hooks/useCommunityActions';
import { formatPostContent } from '@/lib/postUtils';
import { Search, Heart, MessageCircle, Send, Home, Users, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const Community = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'recent' | 'trending' | 'popular'>('recent');
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
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 text-foreground">
          <div className="size-6 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-foreground text-xl font-bold leading-tight tracking-[-0.015em]">THE SONS</h2>
        </div>
        
        <div className="flex flex-1 justify-end items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <label className="relative min-w-40 max-w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Search className="h-5 w-5" />
              </div>
              <Input
                className="pl-10 bg-muted border-border focus:ring-2 focus:ring-primary"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-primary hover:text-primary/80"
            >
              <Users className="h-5 w-5" />
              <span>Community</span>
            </Button>
          </div>
          <Avatar className="h-10 w-10">
            <AvatarImage src={userProfile?.profilePhoto} />
            <AvatarFallback>
              {userProfile?.displayName?.charAt(0) || user.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-muted/30">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Filter Tabs */}
          <div className="mb-6">
            {hashtagFilter && (
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  #{hashtagFilter}
                </Badge>
                <Button variant="ghost" size="sm" onClick={clearHashtagFilter} className="text-muted-foreground">
                  Clear filter
                </Button>
              </div>
            )}
            <div className="border-b border-border">
              <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                <button
                  onClick={() => setFilter('recent')}
                  className={cn(
                    'whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors',
                    filter === 'recent'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  )}
                >
                  For you
                </button>
                <button
                  onClick={() => setFilter('trending')}
                  className={cn(
                    'whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors',
                    filter === 'trending'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  )}
                >
                  Trending
                </button>
                <button
                  onClick={() => setFilter('popular')}
                  className={cn(
                    'whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors',
                    filter === 'popular'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  )}
                >
                  Popular
                </button>
              </nav>
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-8">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4 flex items-center space-x-4">
                    <div className="animate-pulse h-12 w-12 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="animate-pulse h-4 w-24 bg-muted rounded" />
                      <div className="animate-pulse h-3 w-16 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="animate-pulse w-full h-64 bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="animate-pulse h-4 w-full bg-muted rounded" />
                    <div className="animate-pulse h-4 w-3/4 bg-muted rounded" />
                  </div>
                </div>
              ))
            ) : filteredBySearch.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts found. Be the first to share something!</p>
                <Button 
                  onClick={() => navigate('/create-post')} 
                  className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Create Post
                </Button>
              </div>
            ) : (
              filteredBySearch.map((post) => (
                <div key={post.id} className="bg-card rounded-lg shadow-sm overflow-hidden">
                  {/* Post Header */}
                  <div className="p-4 flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={post.authorAvatar} />
                      <AvatarFallback>
                        {post.authorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{post.authorName}</p>
                        {post.isAdmin && (
                          <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs">
                            Leader
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {post.timestamp?.toDate?.()?.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 pb-4">
                    <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                      {formatPostContent(post.content, handleHashtagClick)}
                    </p>
                  </div>

                  {/* Post Media */}
                  {post.mediaUrl && (
                    <div 
                      className="w-full bg-muted/20 cursor-pointer"
                      onClick={() => navigate(`/post/${post.id}`)}
                    >
                      {post.mediaType === 'image' ? (
                        <LazyImage
                          src={post.mediaUrl}
                          alt="Post media"
                          className="w-full h-auto max-h-96 object-cover"
                        />
                      ) : (
                        <LazyVideo
                          src={post.mediaUrl}
                          className="w-full h-auto aspect-video max-h-96 object-cover"
                        />
                      )}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="border-t border-border px-4 py-2 flex justify-between items-center text-muted-foreground">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={cn(
                        "flex items-center space-x-2 hover:text-primary transition-colors",
                        post.likes?.includes(user.uid) && "text-primary"
                      )}
                    >
                      <Heart className={cn("h-6 w-6", post.likes?.includes(user.uid) && "fill-current")} />
                      <span className="text-sm font-semibold">{post.likeCount || 0}</span>
                    </button>
                    <button 
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="flex items-center space-x-2 hover:text-primary transition-colors"
                    >
                      <MessageCircle className="h-6 w-6" />
                      <span className="text-sm font-semibold">{post.commentCount || 0}</span>
                    </button>
                    <button 
                      onClick={() => sharePost(post.id)}
                      className="flex items-center space-x-2 hover:text-primary transition-colors"
                    >
                      <Send className="h-6 w-6" />
                      <span className="text-sm font-semibold">{post.shareCount || 0}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Community;
