import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCommunityActions } from '@/hooks/useCommunityActions';
import { ArrowLeft, MoreVertical, Home, Users, Plus, Heart, MessageCircle, Send, Bookmark, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import LazyImage from '@/components/LazyImage';
import LazyVideo from '@/components/LazyVideo';
import MetaUpdater from '@/components/MetaUpdater';
import { formatPostContent } from '@/lib/postUtils';
import { useToast } from '@/lib/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  postId: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likes: string[];
  likeCount: number;
  timestamp: any;
  isEdited?: boolean;
  replies?: Comment[];
}

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
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const {
    likeAnimations,
    bookmarkAnimations,
    handleLike,
    toggleBookmark,
    sharePost
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

  // Load comments
  useEffect(() => {
    if (!postId) return;

    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];

      // Organize comments with replies
      const topLevelComments = commentsData.filter(comment => !comment.parentId);
      const repliesMap = new Map();

      commentsData.forEach(comment => {
        if (comment.parentId) {
          if (!repliesMap.has(comment.parentId)) {
            repliesMap.set(comment.parentId, []);
          }
          repliesMap.get(comment.parentId).push(comment);
        }
      });

      const commentsWithReplies = topLevelComments.map(comment => ({
        ...comment,
        replies: repliesMap.get(comment.id) || []
      }));

      setComments(commentsWithReplies);
    });

    return unsubscribe;
  }, [postId]);

  const handleHashtagClick = (hashtag: string) => {
    navigate(`/community?hashtag=${encodeURIComponent(hashtag)}`);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      await addDoc(collection(db, 'comments'), {
        postId,
        authorId: user.uid,
        authorName: userProfile?.displayName || 'Anonymous',
        authorAvatar: userProfile?.profilePhoto || '',
        content: newComment.trim(),
        likes: [],
        likeCount: 0,
        timestamp: new Date(),
        isEdited: false
      });

      // Update post comment count
      const postRef = doc(db, 'communityPosts', postId!);
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const currentCount = postDoc.data().commentCount || 0;
        await updateDoc(postRef, {
          commentCount: currentCount + 1
        });
      }

      setNewComment('');
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted successfully.'
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to post comment. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim() || !user) return;

    try {
      await addDoc(collection(db, 'comments'), {
        postId,
        parentId,
        authorId: user.uid,
        authorName: userProfile?.displayName || 'Anonymous',
        authorAvatar: userProfile?.profilePhoto || '',
        content: replyContent.trim(),
        likes: [],
        likeCount: 0,
        timestamp: new Date(),
        isEdited: false
      });

      setReplyingTo(null);
      setReplyContent('');
      toast({
        title: 'Reply added',
        description: 'Your reply has been posted successfully.'
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to post reply. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleLikeComment = async (commentId: string, currentLikes: string[]) => {
    if (!user) return;

    const isLiked = currentLikes.includes(user.uid);
    const newLikes = isLiked 
      ? currentLikes.filter(id => id !== user.uid)
      : [...currentLikes, user.uid];

    try {
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        likes: newLikes,
        likeCount: newLikes.length
      });
    } catch (error) {
      console.error('Error liking comment:', error);
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
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground">
                <MessageCircle className="h-6 w-6" />
                <span className="text-sm font-semibold">{post.commentCount || 0}</span>
              </div>
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

            {/* Comments Section */}
            <div className="border-t border-border p-4 sm:p-6">
              <h2 className="text-lg font-bold text-foreground">Comments ({comments.length})</h2>
              <div className="flex flex-col gap-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex w-full items-start gap-4">
                    <img 
                      className="h-10 w-10 shrink-0 rounded-full object-cover" 
                      src={comment.authorAvatar || '/default-avatar.png'} 
                      alt={comment.authorName}
                    />
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{comment.authorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {comment.timestamp?.toDate?.()?.toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short'
                          }) || ''}
                        </p>
                      </div>
                      <p className="text-sm text-foreground">
                        {comment.content}
                      </p>
                      
                      {/* Comment Actions - Simple like button */}
                      <div className="flex items-center gap-4 mt-2">
                        <button
                          onClick={() => handleLikeComment(comment.id, comment.likes || [])}
                          className={cn(
                            "flex items-center gap-1 text-xs hover:text-primary transition-colors",
                            comment.likes?.includes(user?.uid || '') && "text-primary"
                          )}
                        >
                          <Heart className={cn("h-3 w-3", comment.likes?.includes(user?.uid || '') && "fill-current")} />
                          <span>{comment.likeCount || 0}</span>
                        </button>
                        
                        <button
                          onClick={() => setReplyingTo(comment.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Reply className="h-3 w-3" />
                          <span>Reply</span>
                        </button>
                      </div>

                      {/* Reply Input */}
                      {replyingTo === comment.id && (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="min-h-[60px] text-sm"
                            placeholder="Write a reply..."
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleAddReply(comment.id)}
                              className="h-7 px-3 text-xs"
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent('');
                              }}
                              className="h-7 px-3 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="space-y-3 mt-3 ml-4 border-l border-border pl-4">
                          {comment.replies.map((reply: Comment) => (
                            <div key={reply.id} className="flex items-start gap-3">
                              <img 
                                className="h-8 w-8 shrink-0 rounded-full object-cover" 
                                src={reply.authorAvatar || '/default-avatar.png'} 
                                alt={reply.authorName}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-medium text-foreground">{reply.authorName}</span>
                                  <span className="text-muted-foreground">
                                    {reply.timestamp?.toDate?.()?.toLocaleDateString('en-US', {
                                      day: 'numeric',
                                      month: 'short'
                                    }) || ''}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground mt-1">{reply.content}</p>
                                <button
                                  onClick={() => handleLikeComment(reply.id, reply.likes || [])}
                                  className={cn(
                                    "flex items-center gap-1 text-xs hover:text-primary transition-colors mt-1",
                                    reply.likes?.includes(user?.uid || '') && "text-primary"
                                  )}
                                >
                                  <Heart className={cn("h-3 w-3", reply.likes?.includes(user?.uid || '') && "fill-current")} />
                                  <span>{reply.likeCount || 0}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {comments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </div>
              
              <div className="sticky bottom-0 bg-background py-4">
                <div className="flex items-center gap-3">
                  <img 
                    className="h-10 w-10 shrink-0 rounded-full object-cover" 
                    src={userProfile?.profilePhoto || '/default-avatar.png'} 
                    alt="Your avatar"
                  />
                  <div className="relative flex-1">
                    <input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      className="w-full rounded-full border-gray-300 bg-gray-50 py-2 pl-4 pr-24 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                      placeholder="Add a comment..."
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="absolute inset-y-0 right-0 flex items-center justify-center rounded-r-full bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                      <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostDetail;
