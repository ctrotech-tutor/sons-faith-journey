
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, query, orderBy, onSnapshot, where, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { X, Send, Heart, Reply, MoreVertical, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/lib/hooks/use-toast';

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  likes: string[];
  likeCount: number;
  replies: Reply[];
  replyCount: number;
  timestamp: any;
  parentId?: string;
}

interface Reply {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  likes: string[];
  timestamp: any;
}

interface CommentsSlideUpProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CommentsSlideUp = ({ postId, isOpen, onClose }: CommentsSlideUpProps) => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyingToName, setReplyingToName] = useState('');
  const commentsListRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Real-time comments listener
  useEffect(() => {
    if (!postId || !isOpen) return;

    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('timestamp', 'asc') // Show oldest first, like YouTube
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const newComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        replies: doc.data().replies || [],
        replyCount: doc.data().replyCount || 0
      })) as Comment[];
      
      setComments(newComments);
    }, (error) => {
      console.error('Error listening to comments:', error);
    });

    return unsubscribe;
  }, [postId, isOpen]);

  // Auto-focus input when replying
  useEffect(() => {
    if (replyTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyTo]);

  const submitComment = async () => {
    if (!newComment.trim() || !user || !userProfile) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'comments'), {
        postId,
        authorId: user.uid,
        authorName: userProfile.displayName || user.email,
        content: newComment,
        likes: [],
        likeCount: 0,
        replies: [],
        replyCount: 0,
        timestamp: new Date()
      });

      // Update post comment count
      const postRef = doc(db, 'communityPosts', postId);
      // Use increment to avoid race conditions
      await updateDoc(postRef, {
        commentCount: arrayUnion(new Date().getTime()) // Use array to track individual comments
      }).then(async () => {
        // Get current count and update with actual number
        const currentComments = comments.length + 1;
        await updateDoc(postRef, {
          commentCount: currentComments
        });
      });

      setNewComment('');
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      toast({
        title: 'Comment Posted',
        description: 'Your comment has been added.'
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to post comment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const submitReply = async (parentCommentId: string) => {
    if (!replyContent.trim() || !user || !userProfile) return;

    try {
      const parentComment = comments.find(c => c.id === parentCommentId);
      if (!parentComment) return;

      const newReply = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        authorId: user.uid,
        authorName: userProfile.displayName || user.email,
        content: replyContent,
        likes: [],
        timestamp: new Date()
      };

      const updatedReplies = [...(parentComment.replies || []), newReply];
      
      await updateDoc(doc(db, 'comments', parentCommentId), {
        replies: updatedReplies,
        replyCount: updatedReplies.length
      });

      setReplyContent('');
      setReplyTo(null);
      setReplyingToName('');
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      toast({
        title: 'Reply Posted',
        description: 'Your reply has been added.'
      });
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to post reply. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const toggleCommentLike = async (commentId: string) => {
    if (!user) return;

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    try {
      const isLiked = comment.likes.includes(user.uid);
      const updatedLikes = isLiked
        ? comment.likes.filter(id => id !== user.uid)
        : [...comment.likes, user.uid];

      await updateDoc(doc(db, 'comments', commentId), {
        likes: updatedLikes,
        likeCount: updatedLikes.length
      });

      // Haptic feedback for likes
      if (!isLiked && 'vibrate' in navigator) {
        navigator.vibrate(30);
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  const toggleReplyLike = async (commentId: string, replyId: string) => {
    if (!user) return;

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const reply = comment.replies.find(r => r.id === replyId);
    if (!reply) return;

    try {
      const isLiked = reply.likes.includes(user.uid);
      const updatedLikes = isLiked
        ? reply.likes.filter(id => id !== user.uid)
        : [...reply.likes, user.uid];

      const updatedReplies = comment.replies.map(r => 
        r.id === replyId ? { ...r, likes: updatedLikes } : r
      );

      await updateDoc(doc(db, 'comments', commentId), {
        replies: updatedReplies
      });

      // Haptic feedback for likes
      if (!isLiked && 'vibrate' in navigator) {
        navigator.vibrate(30);
      }
    } catch (error) {
      console.error('Error toggling reply like:', error);
    }
  };

  const startReply = (commentId: string, authorName: string) => {
    setReplyTo(commentId);
    setReplyingToName(authorName);
    setReplyContent(`@${authorName} `);
  };

  const cancelReply = () => {
    setReplyTo(null);
    setReplyingToName('');
    setReplyContent('');
  };

  const scrollToTop = () => {
    if (commentsListRef.current) {
      commentsListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={onClose}
          />
          
          {/* Comments Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl z-[70] max-h-[85vh] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-900 rounded-t-2xl">
              <h3 className="text-lg font-semibold dark:text-white">
                Comments {comments.length > 0 && `(${comments.length})`}
              </h3>
              <div className="flex items-center space-x-2">
                {comments.length > 5 && (
                  <Button variant="ghost" size="sm" onClick={scrollToTop}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div 
              ref={commentsListRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">💬</div>
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment, index) => (
                  <motion.div 
                    key={comment.id} 
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {/* Main Comment */}
                    <div className="flex space-x-3">
                      <Avatar className="h-8 w-8 ring-1 ring-gray-200 dark:ring-gray-700">
                        <AvatarFallback className="text-sm dark:bg-gray-800 dark:text-gray-200">
                          {comment.authorName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-3">
                          <p className="font-medium text-sm dark:text-white">{comment.authorName}</p>
                          <p className="text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>{comment.timestamp?.toDate?.()?.toLocaleDateString()}</span>
                          <motion.button
                            onClick={() => toggleCommentLike(comment.id)}
                            className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                            whileTap={{ scale: 0.95 }}
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                comment.likes.includes(user?.uid || '') 
                                  ? 'fill-red-500 text-red-500' 
                                  : ''
                              }`}
                            />
                            <span>{comment.likeCount || 0}</span>
                          </motion.button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-gray-500 dark:text-gray-400 hover:text-blue-500"
                            onClick={() => startReply(comment.id, comment.authorName)}
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                        </div>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-6 mt-3 space-y-2">
                            {comment.replies.map((reply) => (
                              <motion.div 
                                key={reply.id} 
                                className="flex space-x-2"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs dark:bg-gray-700 dark:text-gray-300">
                                    {reply.authorName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-2">
                                    <p className="font-medium text-xs dark:text-white">{reply.authorName}</p>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{reply.content}</p>
                                  </div>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs text-gray-400">
                                      {reply.timestamp?.toDate?.()?.toLocaleDateString()}
                                    </span>
                                    <motion.button
                                      onClick={() => toggleReplyLike(comment.id, reply.id)}
                                      className="flex items-center space-x-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Heart
                                        className={`h-3 w-3 ${
                                          reply.likes?.includes(user?.uid || '') 
                                            ? 'fill-red-500 text-red-500' 
                                            : ''
                                        }`}
                                      />
                                      {reply.likes?.length > 0 && <span>{reply.likes.length}</span>}
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {/* Reply Input */}
                        {replyTo === comment.id && (
                          <motion.div 
                            className="mt-3 ml-6"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <div className="flex space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs dark:bg-gray-800 dark:text-gray-200">
                                  {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <Textarea
                                  ref={inputRef}
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder={`Reply to ${replyingToName}...`}
                                  className="resize-none text-sm min-h-[60px] dark:bg-gray-800 dark:border-gray-600"
                                  rows={2}
                                />
                                <div className="flex justify-between items-center mt-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={cancelReply}
                                    className="text-gray-500"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => submitReply(comment.id)}
                                    disabled={!replyContent.trim()}
                                    size="sm"
                                    className="bg-purple-600 hover:bg-purple-700"
                                  >
                                    Reply
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-sm dark:bg-gray-800 dark:text-gray-200">
                    {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="resize-none min-h-[60px] dark:bg-gray-800 dark:border-gray-600"
                    rows={2}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submitComment();
                      }
                    }}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={submitComment}
                      disabled={loading || !newComment.trim()}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {loading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommentsSlideUp;
