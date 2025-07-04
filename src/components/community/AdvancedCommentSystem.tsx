import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Reply, MoreVertical, Trash2, Edit3, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likes: string[];
  likeCount: number;
  parentId?: string;
  replies?: Comment[];
  timestamp: any;
  isEdited?: boolean;
}

interface AdvancedCommentSystemProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

const AdvancedCommentSystem: React.FC<AdvancedCommentSystemProps> = ({
  postId,
  isOpen,
  onClose
}) => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (!isOpen || !postId) return;

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
      const repliesMap = new Map<string, Comment[]>();

      commentsData.forEach(comment => {
        if (comment.parentId) {
          if (!repliesMap.has(comment.parentId)) {
            repliesMap.set(comment.parentId, []);
          }
          repliesMap.get(comment.parentId)!.push(comment);
        }
      });

      const commentsWithReplies = topLevelComments.map(comment => ({
        ...comment,
        replies: repliesMap.get(comment.id) || []
      }));

      setComments(commentsWithReplies);
      setLoading(false);
    });

    return unsubscribe;
  }, [isOpen, postId]);

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
      const postRef = doc(db, 'communityPosts', postId);
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

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        content: editContent.trim(),
        isEdited: true
      });

      setEditingComment(null);
      setEditContent('');
      toast({
        title: 'Comment updated',
        description: 'Your comment has been updated successfully.'
      });
    } catch (error) {
      console.error('Error editing comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update comment. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      
      // Update post comment count
      const postRef = doc(db, 'communityPosts', postId);
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const currentCount = postDoc.data().commentCount || 0;
        await updateDoc(postRef, {
          commentCount: Math.max(0, currentCount - 1)
        });
      }

      toast({
        title: 'Comment deleted',
        description: 'Your comment has been deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete comment. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ comment, isReply = false }) => (
    <div className={cn("flex gap-3", isReply && "ml-8 mt-3")}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.authorAvatar} />
        <AvatarFallback className="text-xs">
          {comment.authorName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-foreground">{comment.authorName}</span>
          <span className="text-muted-foreground">
            {comment.timestamp?.toDate?.()?.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          {comment.isEdited && (
            <span className="text-muted-foreground italic">(edited)</span>
          )}
        </div>
        
        {editingComment === comment.id ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[60px] text-sm"
              placeholder="Edit your comment..."
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleEditComment(comment.id)}
                className="h-7 px-3 text-xs"
              >
                Save
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => {
                  setEditingComment(null);
                  setEditContent('');
                }}
                className="h-7 px-3 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
            
            <div className="flex items-center gap-4 pt-1">
              <button
                onClick={() => handleLikeComment(comment.id, comment.likes)}
                className={cn(
                  "flex items-center gap-1 text-xs hover:text-primary transition-colors",
                  comment.likes.includes(user?.uid || '') && "text-primary"
                )}
              >
                <Heart className={cn("h-3 w-3", comment.likes.includes(user?.uid || '') && "fill-current")} />
                <span>{comment.likeCount || 0}</span>
              </button>
              
              {!isReply && (
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Reply className="h-3 w-3" />
                  <span>Reply</span>
                </button>
              )}
              
              {comment.authorId === user?.uid && (
                <>
                  <button
                    onClick={() => {
                      setEditingComment(comment.id);
                      setEditContent(comment.content);
                    }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          </>
        )}
        
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
          <div className="space-y-3 mt-3">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comments ({comments.length})</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="animate-pulse h-8 w-8 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="animate-pulse h-3 w-24 bg-muted rounded" />
                    <div className="animate-pulse h-4 w-full bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
        
        {/* Add Comment */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={userProfile?.profilePhoto} />
              <AvatarFallback className="text-xs">
                {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
                placeholder="Write a comment..."
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="px-6"
            >
              <Send className="h-4 w-4 mr-2" />
              Comment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedCommentSystem;