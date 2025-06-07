
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, query, orderBy, onSnapshot, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { X, Send, Heart, Reply, MoreVertical } from 'lucide-react';
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

  useEffect(() => {
    if (!postId || !isOpen) return;

    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const newComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        replies: doc.data().replies || [],
        replyCount: doc.data().replyCount || 0
      })) as Comment[];
      setComments(newComments);
    });

    return unsubscribe;
  }, [postId, isOpen]);

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
      const currentPost = await import('firebase/firestore').then(({ getDoc }) => getDoc(postRef));
      if (currentPost.exists()) {
        await updateDoc(postRef, {
          commentCount: (currentPost.data().commentCount || 0) + 1
        });
      }

      setNewComment('');
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
        id: Date.now().toString(),
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
      toast({
        title: 'Reply Posted',
        description: 'Your reply has been added.'
      });
    } catch (error) {
      console.error('Error posting reply:', error);
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
    } catch (error) {
      console.error('Error toggling comment like:', error);
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
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl z-[70] max-h-[80vh] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold dark:text-white">Comments</h3>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">💬</div>
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="space-y-3">
                    {/* Main Comment */}
                    <div className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm">
                          {comment.authorName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-3">
                          <p className="font-medium text-sm dark:text-white">{comment.authorName}</p>
                          <p className="text-gray-800 dark:text-gray-200 mt-1">{comment.content}</p>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>{comment.timestamp?.toDate?.()?.toLocaleDateString()}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-gray-500 dark:text-gray-400"
                            onClick={() => toggleCommentLike(comment.id)}
                          >
                            <Heart
                              className={`h-4 w-4 mr-1 ${
                                comment.likes.includes(user?.uid || '') 
                                  ? 'fill-red-500 text-red-500' 
                                  : ''
                              }`}
                            />
                            {comment.likeCount || 0}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-gray-500 dark:text-gray-400"
                            onClick={() => setReplyTo(comment.id)}
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                        </div>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-6 mt-3 space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {reply.authorName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-2">
                                    <p className="font-medium text-xs dark:text-white">{reply.authorName}</p>
                                    <p className="text-sm text-gray-800 dark:text-gray-200">{reply.content}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Input */}
                        {replyTo === comment.id && (
                          <div className="mt-3 ml-6">
                            <div className="flex space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <Textarea
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder={`Reply to ${comment.authorName}...`}
                                  className="resize-none text-sm min-h-[60px]"
                                  rows={2}
                                />
                                <div className="flex justify-between items-center mt-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setReplyTo(null);
                                      setReplyContent('');
                                    }}
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
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t dark:border-gray-700">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-sm">
                    {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="resize-none min-h-[60px]"
                    rows={2}
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
