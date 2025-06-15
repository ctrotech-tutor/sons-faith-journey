
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Trash2, MoreVertical, Eye, Heart, MessageCircle } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import LazyImage from '@/components/LazyImage';
import LazyVideo from '@/components/LazyVideo';
import PostSkeleton from '@/components/community/PostSkeleton';

interface UserPost {
  id: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likeCount: number;
  commentCount: number;
  shareCount: number;
  status: 'approved' | 'pending' | 'rejected';
  timestamp: any;
}

const PostManager = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const postsQuery = query(
      collection(db, 'communityPosts'),
      where('authorId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const userPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserPost[];

      setPosts(userPosts);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, navigate]);

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    
    setDeletingId(postId);
    try {
      await deleteDoc(doc(db, 'communityPosts', postId));
      toast({
        title: 'Post Deleted',
        description: 'Your post has been successfully deleted.'
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditPost = (postId: string) => {
    navigate(`/edit-post/${postId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Published</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Rejected</Badge>;
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 w-full z-40 backdrop-blur-md bg-white/70 dark:bg-gray-900/60 border-b border-white/20 dark:border-white/10 shadow-sm"
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
                My Posts
              </h1>
            </div>
            <Badge variant="outline" className="text-xs">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="pt-14 pb-20">
        <div className="max-w-md mx-auto">
          {loading ? (
            <div className="space-y-4 px-4">
              {[...Array(3)].map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No Posts Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">
                Share your first post with the community!
              </p>
              <Button
                onClick={() => navigate('/create-post')}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                Create Your First Post
              </Button>
            </div>
          ) : (
            <div className="space-y-0">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="rounded-none border-x-0 border-t-0 last:border-b-0 shadow-none dark:bg-gray-900/60 dark:border-gray-700">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(post.status)}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {post.timestamp?.toDate?.()?.toLocaleDateString()}
                        </span>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditPost(post.id)}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => navigate(`/community?post=${post.id}`)}
                            disabled={post.status !== 'approved'}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this post? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deletingId === post.id}
                                >
                                  {deletingId === post.id ? (
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                  )}
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Media */}
                    {post.mediaUrl && (
                      <div className="w-full bg-black/5 dark:bg-white/5">
                        {post.mediaType === 'image' ? (
                          <LazyImage 
                            src={post.mediaUrl} 
                            alt="Post media"
                            className="w-full aspect-square object-cover"
                          />
                        ) : (
                          <LazyVideo 
                            src={post.mediaUrl}
                            className="w-full aspect-video object-cover"
                          />
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="px-4 py-3 space-y-2">
                      <p className="text-sm dark:text-gray-200 line-clamp-3">
                        {post.content}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>{post.likeCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{post.commentCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{post.shareCount}</span>
                        </div>
                      </div>
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

export default PostManager;
