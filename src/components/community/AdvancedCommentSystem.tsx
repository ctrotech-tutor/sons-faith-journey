import React, { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  increment,
  where,
  limit,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMLInsights } from '@/lib/hooks/useMLInsights';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  MessageCircle, 
  MoreVertical, 
  Send,
  ChevronDown,
  ChevronUp,
  Reply,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  parentId?: string;
  likes: string[];
  likeCount: number;
  replyCount: number;
  timestamp: any;
  isApproved: boolean;
  mlAnalysis?: {
    sentiment: string;
    appropriateness: number;
    toxicity: number;
  };
}

interface AdvancedCommentSystemProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CommentItem: React.FC<{
  comment: Comment;
  onLike: (commentId: string) => void;
  onReply: (commentId: string) => void;
  showReplies: boolean;
  onToggleReplies: () => void;
  replies: Comment[];
  currentUserId?: string;
}> = ({ comment, onLike, onReply, showReplies, onToggleReplies, replies, currentUserId }) => {
  const isLiked = currentUserId ? comment.likes.includes(currentUserId) : false;

  return (
    <div className="space-y-3">
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.authorAvatar} />
          <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-semibold text-sm">{comment.authorName}</span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(comment.timestamp?.toDate?.() || new Date(), { addSuffix: true })}
              </span>
              {comment.mlAnalysis && comment.mlAnalysis.appropriateness < 70 && (
                <Badge variant="outline" className="text-xs text-yellow-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Review
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(comment.id)}
              className={`h-8 px-2 ${isLiked ? 'text-red-600' : 'text-gray-600'}`}
            >
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {comment.likeCount > 0 && comment.likeCount}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(comment.id)}
              className="h-8 px-2 text-gray-600"
            >
              <Reply className="h-4 w-4 mr-1" />
              Reply
            </Button>
            
            {comment.replyCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleReplies}
                className="h-8 px-2 text-blue-600"
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Hide {comment.replyCount} replies
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    View {comment.replyCount} replies
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Replies */}
      {showReplies && replies.length > 0 && (
        <div className="ml-11 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onLike={onLike}
              onReply={onReply}
              showReplies={false}
              onToggleReplies={() => {}}
              replies={[]}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AdvancedCommentSystem: React.FC<AdvancedCommentSystemProps> = ({
  postId,
  isOpen,
  onClose
}) => {
  const { user, userProfile } = useAuth();
  const { moderateContent, analyzeContent } = useMLInsights();
  const { toast } = useToast();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<{ [commentId: string]: Comment[] }>({});
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Load comments with pagination
  const loadComments = useCallback(async (loadMore = false) => {
    if (!postId) return;
    
    setLoading(!loadMore);
    
    try {
      let q = query(
        collection(db, 'comments'),
        where('postId', '==', postId),
        where('parentId', '==', null),
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      if (loadMore && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newComments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Comment[];

        if (loadMore) {
          setComments(prev => [...prev, ...newComments]);
        } else {
          setComments(newComments);
        }

        if (snapshot.docs.length > 0) {
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        }
        
        setHasMore(snapshot.docs.length === 10);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading comments:', error);
      setLoading(false);
    }
  }, [postId, lastVisible]);

  // Load replies for a specific comment
  const loadReplies = useCallback(async (commentId: string) => {
    try {
      const q = query(
        collection(db, 'comments'),
        where('parentId', '==', commentId),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const commentReplies = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Comment[];

        setReplies(prev => ({
          ...prev,
          [commentId]: commentReplies
        }));
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen && postId) {
      let unsubscribe: (() => void) | undefined;
      loadComments().then(unsub => {
        unsubscribe = unsub;
      });
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [isOpen, postId, loadComments]);

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      // Moderate content with ML
      const moderation = await moderateContent(newComment);
      const analysis = await analyzeContent(newComment, 'comment');

      if (!moderation.isAppropriate) {
        toast({
          title: 'Comment flagged',
          description: 'Your comment may contain inappropriate content. Please review and try again.',
          variant: 'destructive'
        });
        setSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'comments'), {
        postId,
        authorId: user.uid,
        authorName: userProfile?.displayName || user.displayName || 'Anonymous',
        authorAvatar: user.photoURL || '',
        content: newComment.trim(),
        parentId: null,
        likes: [],
        likeCount: 0,
        replyCount: 0,
        timestamp: new Date(),
        isApproved: moderation.isAppropriate,
        mlAnalysis: {
          sentiment: analysis?.sentiment || 'neutral',
          appropriateness: analysis?.appropriatenessScore || 100,
          toxicity: 0
        }
      });

      // Update post comment count
      const postRef = doc(db, 'communityPosts', postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });

      setNewComment('');
      toast({
        title: 'Comment posted',
        description: 'Your comment has been added successfully.'
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to post comment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;

    setSubmitting(true);
    try {
      const moderation = await moderateContent(replyContent);
      const analysis = await analyzeContent(replyContent, 'comment');

      await addDoc(collection(db, 'comments'), {
        postId,
        authorId: user.uid,
        authorName: userProfile?.displayName || user.displayName || 'Anonymous',
        authorAvatar: user.photoURL || '',
        content: replyContent.trim(),
        parentId,
        likes: [],
        likeCount: 0,
        replyCount: 0,
        timestamp: new Date(),
        isApproved: moderation.isAppropriate,
        mlAnalysis: {
          sentiment: analysis?.sentiment || 'neutral',
          appropriateness: analysis?.appropriatenessScore || 100,
          toxicity: 0
        }
      });

      // Update parent comment reply count
      const parentRef = doc(db, 'comments', parentId);
      await updateDoc(parentRef, {
        replyCount: increment(1)
      });

      setReplyContent('');
      setReplyingTo(null);
      toast({
        title: 'Reply posted',
        description: 'Your reply has been added successfully.'
      });
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to post reply. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) return;

    try {
      const commentRef = doc(db, 'comments', commentId);
      const comment = comments.find(c => c.id === commentId) || 
                    Object.values(replies).flat().find(c => c.id === commentId);
      
      if (!comment) return;

      const isLiked = comment.likes.includes(user.uid);
      const newLikes = isLiked
        ? comment.likes.filter(id => id !== user.uid)
        : [...comment.likes, user.uid];

      await updateDoc(commentRef, {
        likes: newLikes,
        likeCount: newLikes.length
      });
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
      // Load replies if not loaded yet
      if (!replies[commentId]) {
        loadReplies(commentId);
      }
    }
    setExpandedReplies(newExpanded);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-t-xl sm:rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold">Comments</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && comments.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <>
              {comments.map(comment => (
                <div key={comment.id}>
                  <CommentItem
                    comment={comment}
                    onLike={handleLikeComment}
                    onReply={setReplyingTo}
                    showReplies={expandedReplies.has(comment.id)}
                    onToggleReplies={() => toggleReplies(comment.id)}
                    replies={replies[comment.id] || []}
                    currentUserId={user?.uid}
                  />
                  
                  {/* Reply Input */}
                  {replyingTo === comment.id && (
                    <div className="ml-11 mt-3 space-y-2">
                      <Textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        className="min-h-[80px]"
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={!replyContent.trim() || submitting}
                        >
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reply'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Load More */}
              {hasMore && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => loadComments(true)}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Load more comments
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Comment Input */}
        {user && (
          <div className="border-t dark:border-gray-700 p-4 space-y-3">
            <div className="flex space-x-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback>
                  {(userProfile?.displayName || user.displayName || 'U').charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="min-h-[80px] resize-none"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedCommentSystem;