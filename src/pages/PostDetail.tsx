import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCommunityActions } from '@/hooks/useCommunityActions';
import { ArrowLeft, MoreVertical, Home, Users, Plus, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import LazyImage from '@/components/LazyImage';
import LazyVideo from '@/components/LazyVideo';
import AdvancedCommentSystem from '@/components/community/AdvancedCommentSystem';
import MetaUpdater from '@/components/MetaUpdater';
import { formatPostContent } from '@/lib/postUtils';
import { useToast } from '@/lib/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  status: 'approved' | 'pending' | 'rejected';
  timestamp: any;
  isAdmin: boolean;
  engagementScore?: number;
  trendingScore?: number;
}

const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());

  const {
    likeAnimations,
    bookmarkAnimations,
    handleLike,
    toggleBookmark,
    sharePost,
    openCommentsModal
  } = useCommunityActions(user, userProfile, post ? [post] : []);

  useEffect(() => {
    if (!postId) {
      navigate('/community');
      return;
    }

    const postRef = doc(db, 'communityPosts', postId);
    
    const unsubscribe = onSnapshot(postRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setPost({
          id: snapshot.id,
          ...data,
          shareCount: data.shareCount || 0
        } as CommunityPost);
      } else {
        toast({
          title: 'Post not found',
          description: 'This post may have been deleted or moved.',
          variant: 'destructive'
        });
        navigate('/community');
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching post:', error);
      toast({
        title: 'Error',
        description: 'Failed to load post. Please try again.',
        variant: 'destructive'
      });
      navigate('/community');
      setLoading(false);
    });

    return unsubscribe;
  }, [postId, navigate, toast]);

  const handleHashtagClick = (hashtag: string) => {
    navigate(`/community?hashtag=${encodeURIComponent(hashtag)}`);
  };

  const handleOpenComments = () => {
    setShowComments(true);
    if (postId) {
      openCommentsModal(postId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto bg-card">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="animate-pulse h-6 w-6 bg-muted rounded" />
            <div className="animate-pulse h-4 w-20 bg-muted rounded" />
            <div className="animate-pulse h-6 w-6 bg-muted rounded" />
          </div>
          
          {/* Content Skeleton */}
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="animate-pulse h-12 w-12 bg-muted rounded-full" />
              <div className="space-y-2">
                <div className="animate-pulse h-4 w-24 bg-muted rounded" />
                <div className="animate-pulse h-3 w-16 bg-muted rounded" />
              </div>
            </div>
            <div className="animate-pulse h-64 w-full bg-muted rounded" />
            <div className="space-y-2">
              <div className="animate-pulse h-4 w-full bg-muted rounded" />
              <div className="animate-pulse h-4 w-3/4 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic Meta Tags */}
      <MetaUpdater
        title={post?.content ? undefined : "Community Post"}
        content={post?.content}
        generateFromContent={true}
      />
      
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tighter text-foreground">THE SONS</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 md:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="h-10 w-10 p-0 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/community')}
              className="h-10 w-10 p-0 text-muted-foreground hover:text-foreground"
            >
              <Users className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/create-post')}
              className="h-10 w-10 p-0 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
          <Avatar className="h-10 w-10">
            <AvatarImage src={userProfile?.profilePhoto} />
            <AvatarFallback>
              {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-card py-8">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {/* Post Header */}
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={post.authorAvatar} />
                  <AvatarFallback>
                    {post.authorName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{post.authorName}</p>
                    {post.isAdmin && (
                      <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs">
                        Leader
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {post.timestamp?.toDate?.()?.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-foreground leading-relaxed">
                {formatPostContent(post.content, handleHashtagClick)}
              </p>
            </div>

            {/* Post Media */}
            {post.mediaUrl && (
              <div className="aspect-[4/3] w-full bg-muted/20">
                {post.mediaType === 'image' ? (
                  <LazyImage
                    src={post.mediaUrl}
                    alt="Post media"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <LazyVideo
                    src={post.mediaUrl}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center justify-around border-t border-border p-2">
              <button 
                onClick={() => handleLike(post.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted transition-colors",
                  post.likes?.includes(user.uid) ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                <Heart className={cn("h-6 w-6", post.likes?.includes(user.uid) && "fill-current")} />
                <span className="text-sm font-semibold">{post.likeCount || 0}</span>
              </button>
              <button 
                onClick={handleOpenComments}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
              >
                <MessageCircle className="h-6 w-6" />
                <span className="text-sm font-semibold">{post.commentCount || 0}</span>
              </button>
              <button 
                onClick={() => sharePost(post.id)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
              >
                <Send className="h-6 w-6" />
                <span className="text-sm font-semibold">{post.shareCount || 0}</span>
              </button>
              <button 
                onClick={() => toggleBookmark(post.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted transition-colors",
                  bookmarkedPosts.has(post.id) ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                <Bookmark className={cn("h-6 w-6", bookmarkedPosts.has(post.id) && "fill-current")} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Advanced Comments Modal */}
      <AdvancedCommentSystem
        postId={post.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </div>
  );
};

export default PostDetail;
