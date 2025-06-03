
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { Heart, MessageCircle, Share2, MoreVertical, Bookmark, Send } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CommentsModal from '@/components/community/CommentsModal';

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
  likes: string[];
}

const Community = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filter, setFilter] = useState<'recent' | 'liked' | 'admin'>('recent');
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const [quickComment, setQuickComment] = useState<{[key: string]: string}>({});

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

  const sharePost = async (postId: string) => {
    try {
      const shareUrl = `${window.location.origin}/community?post=${postId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link Copied',
        description: 'Post link has been copied to clipboard.'
      });
    } catch (error) {
      toast({
        title: 'Share Failed',
        description: 'Unable to copy link to clipboard.',
        variant: 'destructive'
      });
    }
  };

  const addQuickComment = async (postId: string) => {
    const comment = quickComment[postId];
    if (!comment?.trim() || !user || !userProfile) return;

    try {
      await addDoc(collection(db, 'comments'), {
        postId,
        authorId: user.uid,
        authorName: userProfile.displayName,
        content: comment,
        likes: [],
        timestamp: new Date()
      });

      setQuickComment(prev => ({ ...prev, [postId]: '' }));
      toast({
        title: 'Comment Added',
        description: 'Your comment has been posted.'
      });
    } catch (error) {
      console.error('Error adding comment:', error);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header - Instagram-like */}
        <div className="bg-white rounded-lg p-4 shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Community</h1>
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
                Popular
              </Button>
              <Button
                variant={filter === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('admin')}
              >
                Leaders
              </Button>
            </div>
          </div>
        </div>

        {/* Admin pending posts */}
        {userProfile?.isAdmin && (
          <div className="space-y-4">
            {posts.filter(post => post.status === 'pending').map((post) => (
              <Card key={post.id} className="p-4 border-yellow-200 bg-yellow-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
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
                    Approve
                  </Button>
                  <Button
                    onClick={() => rejectPost(post.id)}
                    variant="destructive"
                    size="sm"
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Posts Feed - Instagram-like */}
        <div className="space-y-6">
          {getFilteredPosts().map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden">
                {/* Post Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold">{post.authorName}</p>
                        {post.isAdmin && (
                          <Badge className="bg-[#FF9606] text-white text-xs">Leader</Badge>
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

                {/* Post Media */}
                {post.mediaUrl && (
                  <div className="w-full">
                    {post.mediaType === 'image' ? (
                      <img 
                        src={post.mediaUrl} 
                        alt="Post media" 
                        className="w-full max-h-96 object-cover"
                      />
                    ) : (
                      <video 
                        src={post.mediaUrl} 
                        controls 
                        className="w-full max-h-96"
                      />
                    )}
                  </div>
                )}

                {/* Post Content */}
                <div className="p-4">
                  <p className="text-gray-800 mb-3">{post.content}</p>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(post.id)}
                        className={`${
                          post.likes.includes(user.uid)
                            ? 'text-red-600 hover:text-red-700'
                            : 'text-gray-500 hover:text-red-600'
                        } p-1`}
                      >
                        <Heart
                          className={`h-6 w-6 ${
                            post.likes.includes(user.uid) ? 'fill-current' : ''
                          }`}
                        />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 p-1"
                        onClick={() => setSelectedPostForComments(post.id)}
                      >
                        <MessageCircle className="h-6 w-6" />
                      </Button>

                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 p-1"
                        onClick={() => sharePost(post.id)}
                      >
                        <Share2 className="h-6 w-6" />
                      </Button>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="text-gray-500 p-1">
                      <Bookmark className="h-6 w-6" />
                    </Button>
                  </div>

                  {/* Like Count */}
                  {post.likeCount > 0 && (
                    <p className="font-semibold text-sm mb-2">
                      {post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}
                    </p>
                  )}

                  {/* Comments Count */}
                  {post.commentCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 p-0 h-auto"
                      onClick={() => setSelectedPostForComments(post.id)}
                    >
                      View all {post.commentCount} comments
                    </Button>
                  )}

                  {/* Quick Comment */}
                  <div className="flex items-center space-x-2 mt-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex space-x-2">
                      <Textarea
                        value={quickComment[post.id] || ''}
                        onChange={(e) => setQuickComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Add a comment..."
                        className="resize-none flex-1"
                        rows={1}
                      />
                      <Button
                        onClick={() => addQuickComment(post.id)}
                        disabled={!quickComment[post.id]?.trim()}
                        size="sm"
                        className="bg-[#FF9606] hover:bg-[#FF9606]/90"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {getFilteredPosts().length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No posts yet</h3>
            <p className="text-gray-500">Check back soon for community updates!</p>
          </div>
        )}
      </div>

      {/* Comments Modal */}
      <CommentsModal
        postId={selectedPostForComments || ''}
        isOpen={!!selectedPostForComments}
        onClose={() => setSelectedPostForComments(null)}
      />
    </div>
  );
};

export default Community;
