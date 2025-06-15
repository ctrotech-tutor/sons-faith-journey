import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCommunityActions } from '@/hooks/useCommunityActions';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LazyImage from '@/components/LazyImage';
import LazyVideo from '@/components/LazyVideo';
import CommentsSlideUp from '@/components/community/CommentsSlideUp';
import PostInteractions from '@/components/community/PostInteractions';
import { formatPostContent } from '@/lib/postUtils';
import { useToast } from '@/lib/hooks/use-toast';

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <div className="animate-pulse h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="animate-pulse h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="animate-pulse h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
          
          {/* Content Skeleton */}
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="animate-pulse h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
              <div className="space-y-2">
                <div className="animate-pulse h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="animate-pulse h-3 w-16 bg-gray-300 dark:bg-gray-600 rounded" />
              </div>
            </div>
            <div className="animate-pulse h-64 w-full bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="space-y-2">
              <div className="animate-pulse h-4 w-full bg-gray-300 dark:bg-gray-600 rounded" />
              <div className="animate-pulse h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded" />
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/community')}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-gray-900 dark:text-white">Post</h1>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Post Content */}
        <div className="space-y-4">
          {/* Author Info */}
          <div className="flex items-center space-x-3 p-4 pb-2">
            <Avatar className="h-12 w-12 ring-2 ring-gray-200 dark:ring-gray-600">
              <AvatarImage src={post.authorAvatar} />
              <AvatarFallback className="text-lg dark:text-gray-300">
                {post.authorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-gray-900 dark:text-white">{post.authorName}</p>
                {post.isAdmin && (
                  <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs">
                    Leader
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {post.timestamp?.toDate?.()?.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Media - Full width for single media */}
          {post.mediaUrl && (
            <div className="w-full bg-black/5 dark:bg-white/5">
              {post.mediaType === 'image' ? (
                <LazyImage
                  src={post.mediaUrl}
                  alt="Post media"
                  className="w-full h-auto max-h-[70vh] object-cover"
                />
              ) : (
                <LazyVideo
                  src={post.mediaUrl}
                  className="w-full h-auto max-h-[70vh] object-cover"
                />
              )}
            </div>
          )}

          {/* Post Text and Interactions */}
          <div className="px-4 space-y-4">
            {/* Post Text */}
            <div className="text-gray-900 dark:text-gray-100">
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {formatPostContent(post.content, handleHashtagClick)}
              </p>
            </div>

            {/* Engagement Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 py-2">
              <div className="flex items-center space-x-4">
                {post.likeCount > 0 && (
                  <span>{post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}</span>
                )}
                {post.commentCount > 0 && (
                  <span>{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</span>
                )}
                {post.shareCount > 0 && (
                  <span>{post.shareCount} {post.shareCount === 1 ? 'share' : 'shares'}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interactions */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4">
          <PostInteractions
            post={post}
            user={user}
            likeAnimation={likeAnimations[post.id]}
            bookmarked={bookmarkedPosts.has(post.id)}
            bookmarkAnimation={bookmarkAnimations[post.id]}
            onLike={() => handleLike(post.id)}
            onComment={handleOpenComments}
            onShare={() => sharePost(post.id)}
            onBookmark={() => toggleBookmark(post.id)}
          />
        </div>

        {/* Comments Modal */}
        <CommentsSlideUp
          postId={post.id}
          isOpen={showComments}
          onClose={() => setShowComments(false)}
        />
      </div>
    </div>
  );
};

export default PostDetail;
