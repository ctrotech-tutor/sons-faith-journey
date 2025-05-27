
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Heart, MessageCircle, Share2, MoreVertical, Plus, Image, Video, Send, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Navigation from '@/components/Navigation';

interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: string[];
  likeCount: number;
  comments: Comment[];
  commentCount: number;
  status: 'approved' | 'pending' | 'rejected';
  timestamp: any;
  isAdmin: boolean;
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: any;
}

const Community = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'recent' | 'liked' | 'admin'>('recent');

  useEffect(() => {
    if (!user) return;

    const postsQuery = query(
      collection(db, 'communityPosts'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityPost[];
      
      // Filter posts based on user role and post status
      const filteredPosts = newPosts.filter(post => {
        if (userProfile?.isAdmin) {
          return true; // Admins see all posts
        }
        return post.status === 'approved'; // Regular users only see approved posts
      });
      
      setPosts(filteredPosts);
    });

    return unsubscribe;
  }, [user, userProfile]);

  const createPost = async () => {
    if (!newPost.trim() || !user || !userProfile) return;

    setLoading(true);
    try {
      const postData = {
        authorId: user.uid,
        authorName: userProfile.displayName,
        content: newPost,
        likes: [],
        likeCount: 0,
        comments: [],
        commentCount: 0,
        status: userProfile.isAdmin ? 'approved' : 'pending',
        timestamp: new Date(),
        isAdmin: userProfile.isAdmin
      };

      await addDoc(collection(db, 'communityPosts'), postData);
      
      setNewPost('');
      setShowCreatePost(false);
      
      toast({
        title: userProfile.isAdmin ? 'Post Published' : 'Post Submitted',
        description: userProfile.isAdmin 
          ? 'Your post is now live in the community.'
          : 'Your post has been submitted for admin approval.'
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      const isLiked = post.likes.includes(user.uid);
      const updatedLikes = isLiked 
        ? post.likes.filter(id => id !== user.uid)
        : [...post.likes, user.uid];

      await updateDoc(doc(db, 'communityPosts', postId), {
        likes: updatedLikes,
        likeCount: updatedLikes.length
      });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const approvePost = async (postId: string) => {
    try {
      await updateDoc(doc(db, 'communityPosts', postId), {
        status: 'approved'
      });
      toast({
        title: 'Post Approved',
        description: 'The post is now visible to all members.'
      });
    } catch (error) {
      console.error('Error approving post:', error);
    }
  };

  const rejectPost = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'communityPosts', postId));
      toast({
        title: 'Post Rejected',
        description: 'The post has been removed.'
      });
    } catch (error) {
      console.error('Error rejecting post:', error);
    }
  };

  const getFilteredPosts = () => {
    switch (filter) {
      case 'liked':
        return posts.filter(post => post.status === 'approved').sort((a, b) => b.likeCount - a.likeCount);
      case 'admin':
        return posts.filter(post => post.isAdmin && post.status === 'approved');
      default:
        return posts.filter(post => post.status === 'approved');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600">Please sign in to access the community.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation />
      
      <div className="flex-1 lg:ml-64">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">Community</h1>
              <Button
                onClick={() => setShowCreatePost(true)}
                className="bg-[#FF9606] hover:bg-[#FF9606]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>
            
            {/* Filter buttons */}
            <div className="flex space-x-2">
              <Button
                variant={filter === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('recent')}
              >
                Recent
              </Button>
              <Button
                variant={filter === 'liked' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('liked')}
              >
                Most Liked
              </Button>
              <Button
                variant={filter === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('admin')}
              >
                Admin Only
              </Button>
            </div>
          </div>

          {/* Create Post Modal */}
          {showCreatePost && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create New Post</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreatePost(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share something with the community..."
                className="mb-4"
                rows={4}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Image className="h-4 w-4 mr-2" />
                    Photo
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    Video
                  </Button>
                </div>
                
                <Button
                  onClick={createPost}
                  disabled={loading || !newPost.trim()}
                  className="bg-[#FF9606] hover:bg-[#FF9606]/90"
                >
                  {loading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {userProfile?.isAdmin ? 'Publish' : 'Submit for Review'}
                </Button>
              </div>
            </Card>
          )}

          {/* Admin pending posts */}
          {userProfile?.isAdmin && (
            <div className="space-y-4">
              {posts.filter(post => post.status === 'pending').map((post) => (
                <Card key={post.id} className="p-6 border-yellow-200 bg-yellow-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{post.authorName}</p>
                        <p className="text-sm text-gray-500">
                          {post.timestamp?.toDate?.()?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Pending Approval</Badge>
                  </div>
                  
                  <p className="text-gray-800 mb-4">{post.content}</p>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => approvePost(post.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => rejectPost(post.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Posts Feed */}
          <div className="space-y-6">
            {getFilteredPosts().map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{post.authorName}</p>
                          {post.isAdmin && (
                            <Badge className="bg-[#FF9606] text-white">Admin</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {post.timestamp?.toDate?.()?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-gray-800 mb-4">{post.content}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(post.id)}
                        className={`${
                          post.likes.includes(user.uid)
                            ? 'text-red-600 hover:text-red-700'
                            : 'text-gray-500 hover:text-red-600'
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 mr-2 ${
                            post.likes.includes(user.uid) ? 'fill-current' : ''
                          }`}
                        />
                        {post.likeCount}
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="text-gray-500">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {post.commentCount}
                      </Button>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {getFilteredPosts().length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No posts yet</h3>
              <p className="text-gray-500">Be the first to share something with the community!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
