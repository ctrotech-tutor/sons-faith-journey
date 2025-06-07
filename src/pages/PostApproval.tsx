
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { Check, X, Eye, Clock, User, Calendar, Image, Video, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/lib/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface PendingPost {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  timestamp: any;
  status: 'pending' | 'approved' | 'rejected';
  isAdmin: boolean;
}

const PostApproval = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (user && userProfile && !userProfile.isAdmin) {
      navigate('/community');
      toast({
        title: 'Access Denied',
        description: 'Only admins can access post approval.',
        variant: 'destructive'
      });
    }
  }, [user, userProfile, navigate, toast]);

  // Real-time pending posts listener
  useEffect(() => {
    if (!user || !userProfile?.isAdmin) return;

    const postsQuery = query(
      collection(db, 'communityPosts'),
      where('status', '==', 'pending'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PendingPost[];
      
      setPendingPosts(newPosts);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, userProfile]);

  const approvePost = async (postId: string) => {
    try {
      await updateDoc(doc(db, 'communityPosts', postId), {
        status: 'approved',
        approvedBy: user?.uid,
        approvedAt: new Date()
      });

      toast({
        title: 'Post Approved',
        description: 'The post has been approved and is now visible to the community.'
      });
    } catch (error) {
      console.error('Error approving post:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve post. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const rejectPost = async (postId: string) => {
    try {
      await updateDoc(doc(db, 'communityPosts', postId), {
        status: 'rejected',
        rejectedBy: user?.uid,
        rejectedAt: new Date()
      });

      toast({
        title: 'Post Rejected',
        description: 'The post has been rejected.',
        variant: 'destructive'
      });
    } catch (error) {
      console.error('Error rejecting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject post. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'communityPosts', postId));

      toast({
        title: 'Post Deleted',
        description: 'The post has been permanently deleted.'
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (!userProfile?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/60 border-b border-white/20 dark:border-white/10 shadow-sm"
      >
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/community')}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 via-purple-700 to-fuchsia-600 bg-clip-text text-transparent">
                Post Approval
              </h1>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              {pendingPosts.length} Pending
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Posts List */}
      <div className="pt-20 pb-20">
        <div className="max-w-md mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full" />
            </div>
          ) : pendingPosts.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">All Caught Up!</h3>
              <p className="text-gray-500 dark:text-gray-500">No posts pending approval at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4 px-4">
              {pendingPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 dark:bg-gray-800 border border-orange-200 dark:border-orange-400/30 bg-white/50 dark:bg-orange-900/20 backdrop-blur-sm shadow-md">
                    {/* Post Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="text-sm">
                            {post.authorName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm dark:text-white">{post.authorName}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>{post.timestamp?.toDate?.()?.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-orange-200 text-orange-900 dark:bg-orange-400/20 dark:text-orange-300">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>

                    {/* Post Content */}
                    <p className="text-sm dark:text-gray-200 mb-3 whitespace-pre-wrap">{post.content}</p>

                    {/* Media */}
                    {post.mediaUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {post.mediaType === 'image' ? (
                          <div className="relative">
                            <Image className="h-4 w-4 absolute top-2 left-2 text-white bg-black/50 rounded p-1" />
                            <img
                              src={post.mediaUrl}
                              alt="Post media"
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        ) : (
                          <div className="relative">
                            <Video className="h-4 w-4 absolute top-2 left-2 text-white bg-black/50 rounded p-1" />
                            <video
                              src={post.mediaUrl}
                              className="w-full h-48 object-cover"
                              controls
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => approvePost(post.id)}
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => rejectPost(post.id)}
                        size="sm"
                        variant="destructive"
                        className="flex-1 shadow-sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => deletePost(post.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostApproval;
