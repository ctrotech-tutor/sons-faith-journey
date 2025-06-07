import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, arrayUnion, arrayRemove, where, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, MoreVertical, TrendingUp, Clock, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/lib/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import CommentsSlideUp from '@/components/community/CommentsSlideUp';
import Layout from '@/components/Layout';

interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  bookmarks: string[];
  bookmarkCount: number;
  timestamp: any;
  isAdmin: boolean;
  status: 'pending' | 'approved' | 'rejected';
  views: number;
  engagementScore: number;
  trendingScore: number;
}

const Community = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<CommunityPost[]>([]);
  const [filter, setFilter] = useState<'trending' | 'popular' | 'recent'>('trending');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time posts listener with better error handling
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const postsQuery = query(
        collection(db, 'communityPosts'),
        where('status', '==', 'approved'),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(
        postsQuery, 
        (snapshot) => {
          console.log('Posts snapshot received:', snapshot.docs.length, 'documents');
          
          const newPosts = snapshot.docs.map(doc => {
            const data = doc.data();
            const now = new Date();
            const postTime = data.timestamp?.toDate() || now;
            const hoursSincePost = (now.getTime() - postTime.getTime()) / (1000 * 60 * 60);
            
            // Calculate engagement score
            const engagementScore = (data.likeCount || 0) + ((data.commentCount || 0) * 2) + ((data.shareCount || 0) * 3);
            
            // Calculate trending score (engagement divided by time decay)
            const timeDecayFactor = Math.max(0.1, 1 / (1 + hoursSincePost / 24));
            const trendingScore = engagementScore * timeDecayFactor;

            return {
              id: doc.id,
              ...data,
              likes: data.likes || [],
              bookmarks: data.bookmarks || [],
              likeCount: data.likes?.length || 0,
              commentCount: data.commentCount || 0,
              shareCount: data.shareCount || 0,
              bookmarkCount: data.bookmarks?.length || 0,
              views: data.views || 0,
              engagementScore,
              trendingScore
            };
          }) as CommunityPost[];
          
          setPosts(newPosts);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('Error fetching posts:', error);
          setError('Failed to load posts. Please try again.');
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up posts listener:', error);
      setError('Failed to connect to posts. Please refresh.');
      setLoading(false);
    }
  }, [user]);

  // Filter posts based on selected filter
  useEffect(() => {
    let sorted = [...posts];
    
    switch (filter) {
      case 'trending':
        sorted.sort((a, b) => b.trendingScore - a.trendingScore);
        break;
      case 'popular':
        sorted.sort((a, b) => b.engagementScore - a.engagementScore);
        break;
      case 'recent':
        sorted.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
        break;
    }
    
    setFilteredPosts(sorted);
  }, [posts, filter]);

  const toggleLike = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      const isLiked = post.likes.includes(user.uid);
      const updatedLikes = isLiked
        ? post.likes.filter(id => id !== user.uid)
        : [...post.likes, user.uid];

      // Update local state immediately for better UX
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { ...p, likes: updatedLikes, likeCount: updatedLikes.length }
            : p
        )
      );

      await updateDoc(doc(db, 'communityPosts', postId), {
        likes: updatedLikes,
        likeCount: updatedLikes.length
      });

      // Haptic feedback
      if (!isLiked && 'vibrate' in navigator) {
        navigator.vibrate(30);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Error',
        description: 'Failed to update like. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const toggleBookmark = async (postId: string) => {
    if (!user || !userProfile) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      const isBookmarked = post.bookmarks?.includes(user.uid) || false;
      
      if (isBookmarked) {
        // Remove bookmark
        const updatedBookmarks = post.bookmarks.filter(id => id !== user.uid);
        
        // Update local state immediately
        setPosts(prevPosts => 
          prevPosts.map(p => 
            p.id === postId 
              ? { ...p, bookmarks: updatedBookmarks, bookmarkCount: updatedBookmarks.length }
              : p
          )
        );

        await updateDoc(doc(db, 'communityPosts', postId), {
          bookmarks: updatedBookmarks,
          bookmarkCount: updatedBookmarks.length
        });

        // Remove from user's bookmarks collection
        const bookmarkQuery = query(
          collection(db, 'bookmarks'),
          where('userId', '==', user.uid),
          where('postId', '==', postId)
        );
        const bookmarkSnapshot = await getDocs(bookmarkQuery);
        
        if (!bookmarkSnapshot.empty) {
          await deleteDoc(doc(db, 'bookmarks', bookmarkSnapshot.docs[0].id));
        }

        toast({
          title: 'Bookmark Removed',
          description: 'Post removed from your bookmarks.'
        });
      } else {
        // Add bookmark
        const updatedBookmarks = [...(post.bookmarks || []), user.uid];
        
        // Update local state immediately
        setPosts(prevPosts => 
          prevPosts.map(p => 
            p.id === postId 
              ? { ...p, bookmarks: updatedBookmarks, bookmarkCount: updatedBookmarks.length }
              : p
          )
        );

        await updateDoc(doc(db, 'communityPosts', postId), {
          bookmarks: updatedBookmarks,
          bookmarkCount: updatedBookmarks.length
        });

        // Add to user's bookmarks collection
        await addDoc(collection(db, 'bookmarks'), {
          userId: user.uid,
          postId: postId,
          authorId: post.authorId,
          authorName: post.authorName,
          content: post.content,
          mediaUrl: post.mediaUrl,
          mediaType: post.mediaType,
          likes: post.likes,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          timestamp: post.timestamp,
          bookmarkedAt: new Date(),
          isAdmin: post.isAdmin
        });

        toast({
          title: 'Bookmarked',
          description: 'Post saved to your bookmarks.'
        });
      }

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bookmark. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const sharePost = async (postId: string) => {
    try {
      const shareUrl = `${window.location.origin}/community?post=${postId}`;
      await navigator.clipboard.writeText(shareUrl);
      
      // Update share count
      const post = posts.find(p => p.id === postId);
      if (post) {
        await updateDoc(doc(db, 'communityPosts', postId), {
          shareCount: (post.shareCount || 0) + 1
        });
      }

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

  const openComments = (postId: string) => {
    setSelectedPost(postId);
    setShowComments(true);
  };

  const getFilterIcon = (filterType: string) => {
    switch (filterType) {
      case 'trending':
        return <TrendingUp className="h-4 w-4" />;
      case 'popular':
        return <Star className="h-4 w-4" />;
      case 'recent':
        return <Clock className="h-4 w-4" />;
      default:
        return <Filter className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <Card className="p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Join the Community</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sign in to share your faith journey and connect with fellow believers.
            </p>
            <Button onClick={() => navigate('/auth/login')}>
              Sign In
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/60 border-b border-white/20 dark:border-white/10 shadow-sm"
        >
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 via-purple-700 to-fuchsia-600 bg-clip-text text-transparent">
                Community
              </h1>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/bookmarks')}
                  className="h-8 w-8 p-0"
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/create-post')}
                  className="text-purple-600 hover:text-purple-700"
                >
                  Create Post
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white/50 dark:bg-white/10 backdrop-blur-sm p-1 rounded-xl flex justify-between shadow-inner border border-white/20 dark:border-white/10">
              {[
                { key: 'trending', label: 'Trending' },
                { key: 'popular', label: 'Popular' },
                { key: 'recent', label: 'Recent' }
              ].map((filterType) => (
                <button
                  key={filterType.key}
                  onClick={() => setFilter(filterType.key as any)}
                  className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    filter === filterType.key
                      ? 'bg-white dark:bg-gray-800 text-purple-800 dark:text-purple-200 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-300'
                  }`}
                >
                  {getFilterIcon(filterType.key)}
                  <span>{filterType.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Posts Feed */}
        <div className="pt-32 pb-20">
          <div className="max-w-md mx-auto">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full" />
              </div>
            ) : error ? (
              <div className="text-center py-20 px-4">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Posts</h3>
                <p className="text-gray-500 dark:text-gray-500 mb-6">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Retry
                </Button>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="text-6xl mb-4">🌟</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No Posts Yet</h3>
                <p className="text-gray-500 dark:text-gray-500 mb-6">Be the first to share your faith journey!</p>
                <Button
                  onClick={() => navigate('/create-post')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Create First Post
                </Button>
              </div>
            ) : (
              <div className="space-y-0">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="rounded-none border-x-0 border-t-0 last:border-b-0 shadow-none dark:bg-gray-900/60 dark:border-gray-700">
                      {/* Post Header */}
                      <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8 ring-1 ring-gray-300 dark:ring-gray-600">
                            <AvatarFallback className="text-xs dark:text-gray-300">
                              {post.authorName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-semibold text-sm dark:text-white">{post.authorName}</p>
                              {post.isAdmin && (
                                <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-2 py-0">
                                  Leader
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {post.timestamp?.toDate?.()?.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Media */}
                      {post.mediaUrl && (
                        <div className="w-full bg-black/5 dark:bg-white/5">
                          {post.mediaType === 'image' ? (
                            <img
                              src={post.mediaUrl}
                              alt="Post"
                              className="w-full aspect-square object-cover"
                            />
                          ) : (
                            <video
                              src={post.mediaUrl}
                              controls
                              className="w-full aspect-square object-cover"
                            />
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="px-4 py-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleLike(post.id)}
                              className="h-auto p-0"
                            >
                              <Heart
                                className={`h-6 w-6 mr-1 ${
                                  post.likes.includes(user.uid)
                                    ? 'fill-red-500 text-red-500'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openComments(post.id)}
                              className="h-auto p-0"
                            >
                              <MessageCircle className="h-6 w-6 mr-1 text-gray-700 dark:text-gray-300" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => sharePost(post.id)}
                              className="h-auto p-0"
                            >
                              <Share2 className="h-6 w-6 mr-1 text-gray-700 dark:text-gray-300" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(post.id)}
                            className="h-auto p-0"
                          >
                            <Bookmark
                              className={`h-6 w-6 ${
                                post.bookmarks?.includes(user.uid)
                                  ? 'fill-purple-500 text-purple-500'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            />
                          </Button>
                        </div>

                        {/* Stats */}
                        <div className="text-sm font-semibold dark:text-white">
                          {post.likeCount > 0 && `${post.likeCount} likes`}
                        </div>

                        {/* Content */}
                        <p className="text-sm dark:text-gray-200">
                          <span className="font-semibold">{post.authorName}</span> {post.content}
                        </p>

                        {/* View Comments */}
                        {post.commentCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openComments(post.id)}
                            className="h-auto p-0 text-gray-500 dark:text-gray-400"
                          >
                            View all {post.commentCount} comments
                          </Button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comments Slide Up */}
        <CommentsSlideUp
          postId={selectedPost || ''}
          isOpen={showComments}
          onClose={() => setShowComments(false)}
        />
      </div>
    </Layout>
  );
};

export default Community;
