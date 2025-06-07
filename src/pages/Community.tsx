
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { Heart, MessageCircle, Share2, MoreVertical, Bookmark, Send, Plus, Check, X, BookmarkCheck, Flame, TrendingUp, Clock } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CommentsSlideUp from '@/components/community/CommentsSlideUp';

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
  shareCount: number;
  status: 'approved' | 'pending' | 'rejected';
  timestamp: any;
  isAdmin: boolean;
  engagementScore?: number;
  trendingScore?: number;
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
  const [filter, setFilter] = useState<'recent' | 'trending' | 'popular' | 'admin'>('recent');
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const [quickComment, setQuickComment] = useState<{ [key: string]: string }>({});
  const [expandedPosts, setExpandedPosts] = useState<{ [postId: string]: boolean }>({});
  const [likeAnimations, setLikeAnimations] = useState<{ [postId: string]: boolean }>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [bookmarkAnimations, setBookmarkAnimations] = useState<{ [postId: string]: boolean }>({});
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

  // Advanced algorithm for calculating post scores
  const calculateEngagementScore = (post: CommunityPost) => {
    const hoursSincePost = (Date.now() - post.timestamp?.toDate()?.getTime()) / (1000 * 60 * 60);
    const timeDecay = Math.exp(-hoursSincePost / 24); // Decay over 24 hours
    
    const likeWeight = 1;
    const commentWeight = 3;
    const shareWeight = 5;
    
    const engagementPoints = 
      (post.likeCount * likeWeight) + 
      (post.commentCount * commentWeight) + 
      ((post.shareCount || 0) * shareWeight);
    
    return engagementPoints * timeDecay;
  };

  const calculateTrendingScore = (post: CommunityPost) => {
    const now = Date.now();
    const postTime = post.timestamp?.toDate()?.getTime() || now;
    const hoursSincePost = (now - postTime) / (1000 * 60 * 60);
    
    // Only consider posts from last 48 hours for trending
    if (hoursSincePost > 48) return 0;
    
    const recentEngagement = post.likeCount + (post.commentCount * 2);
    const timeBoost = Math.max(0, 48 - hoursSincePost) / 48;
    
    return recentEngagement * timeBoost;
  };

  useEffect(() => {
    if (!user) return;

    const postsQuery = query(
      collection(db, 'communityPosts'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => {
        const data = doc.data();
        const post = {
          id: doc.id,
          ...data,
          shareCount: data.shareCount || 0
        } as CommunityPost;
        
        // Calculate advanced scores
        post.engagementScore = calculateEngagementScore(post);
        post.trendingScore = calculateTrendingScore(post);
        
        return post;
      });

      const filteredPosts = newPosts.filter(post => {
        if (userProfile?.isAdmin) {
          return true;
        }
        return post.status === 'approved';
      });

      setPosts(filteredPosts);
      
      // Count unread posts (posts created in last 24 hours that user hasn't seen)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentPosts = filteredPosts.filter(post => 
        post.timestamp?.toDate() > oneDayAgo && post.authorId !== user.uid
      );
      setUnreadCount(recentPosts.length);
    });

    return unsubscribe;
  }, [user, userProfile]);

  // Load user's bookmarks with real-time updates
  useEffect(() => {
    if (!user) return;

    const bookmarksQuery = query(
      collection(db, 'bookmarks'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(bookmarksQuery, (snapshot) => {
      const bookmarkIds = new Set(snapshot.docs.map(doc => doc.data().postId));
      setBookmarkedPosts(bookmarkIds);
    });

    return unsubscribe;
  }, [user]);

  const toggleExpanded = (postId: string) => {
    setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
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

      // Trigger haptic feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
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

  const handleLike = (postId: string) => {
    toggleLike(postId);
    setLikeAnimations((prev) => ({ ...prev, [postId]: true }));

    setTimeout(() => {
      setLikeAnimations((prev) => ({ ...prev, [postId]: false }));
    }, 300);
  };

  const toggleBookmark = async (postId: string) => {
    if (!user) return;

    try {
      const isBookmarked = bookmarkedPosts.has(postId);
      
      if (isBookmarked) {
        // Remove bookmark
        const bookmarkQuery = query(
          collection(db, 'bookmarks'),
          where('userId', '==', user.uid),
          where('postId', '==', postId)
        );
        const snapshot = await getDocs(bookmarkQuery);
        snapshot.docs.forEach(async (docSnapshot) => {
          await deleteDoc(doc(db, 'bookmarks', docSnapshot.id));
        });
        
        toast({
          title: 'Bookmark Removed',
          description: 'Post removed from your bookmarks.'
        });
      } else {
        // Add bookmark with complete post data
        const postDoc = await getDoc(doc(db, 'communityPosts', postId));
        if (postDoc.exists()) {
          const postData = postDoc.data();
          await addDoc(collection(db, 'bookmarks'), {
            userId: user.uid,
            postId: postId,
            authorId: postData.authorId,
            authorName: postData.authorName,
            content: postData.content,
            mediaUrl: postData.mediaUrl,
            mediaType: postData.mediaType,
            likes: postData.likes || [],
            likeCount: postData.likeCount || 0,
            commentCount: postData.commentCount || 0,
            timestamp: postData.timestamp,
            isAdmin: postData.isAdmin || false,
            bookmarkedAt: new Date()
          });
          
          toast({
            title: 'Post Bookmarked',
            description: 'Post saved to your bookmarks.'
          });
        }
      }

      // Trigger animation
      setBookmarkAnimations(prev => ({ ...prev, [postId]: true }));
      setTimeout(() => {
        setBookmarkAnimations(prev => ({ ...prev, [postId]: false }));
      }, 300);
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
      
      // Update share count in database
      const post = posts.find(p => p.id === postId);
      if (post) {
        await updateDoc(doc(db, 'communityPosts', postId), {
          shareCount: (post.shareCount || 0) + 1
        });
      }

      // Use native share API if available, otherwise copy to clipboard
      if (navigator.share) {
        await navigator.share({
          title: 'Community Post - THE SONS',
          text: `Check out this post from ${post?.authorName}`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Link Copied',
          description: 'Post link has been copied to clipboard.'
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast({
        title: 'Share Failed',
        description: 'Unable to share post. Please try again.',
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
        authorName: userProfile.displayName || user.email,
        content: comment,
        likes: [],
        likeCount: 0,
        replies: [],
        replyCount: 0,
        timestamp: new Date()
      });

      // Update post comment count
      const post = posts.find(p => p.id === postId);
      if (post) {
        await updateDoc(doc(db, 'communityPosts', postId), {
          commentCount: (post.commentCount || 0) + 1
        });
      }

      setQuickComment(prev => ({ ...prev, [postId]: '' }));
      toast({
        title: 'Comment Added',
        description: 'Your comment has been posted.'
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const approvePost = async (postId: string) => {
    try {
      await updateDoc(doc(db, 'communityPosts', postId), {
        status: 'approved'
      });
      toast({
        title: 'Post Approved',
        description: 'The post has been approved and is now visible to all users.'
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
        status: 'rejected'
      });
      toast({
        title: 'Post Rejected',
        description: 'The post has been rejected and will not be visible to users.'
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

  const getFilteredPosts = () => {
    const approvedPosts = posts.filter(post => post.status === 'approved');
    
    switch (filter) {
      case 'trending':
        return approvedPosts
          .filter(post => (post.trendingScore || 0) > 0)
          .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
      case 'popular':
        return approvedPosts
          .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));
      case 'admin':
        return approvedPosts.filter(post => post.isAdmin);
      default: // recent
        return approvedPosts.sort((a, b) => {
          const timeA = a.timestamp?.toDate()?.getTime() || 0;
          const timeB = b.timestamp?.toDate()?.getTime() || 0;
          return timeB - timeA;
        });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-lg max-w-md">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Join Our Community</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Connect with like-minded believers and share your journey.</p>
          <Button onClick={() => window.location.href = '/auth/login'}>
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/60 border-b border-white/20 dark:border-white/10 shadow-sm"
      >
        <div className="max-w-md mx-auto px-4 py-3">
          {/* Logo + Action Buttons */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-500 via-purple-700 to-fuchsia-600 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
              The Son Hub
            </h1>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => navigate("/bookmarks")}
                variant="outline"
                className="flex items-center gap-1 text-xs"
              >
                <Bookmark className="h-3 w-3" />
                Saved
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/create-post")}
                className="flex items-center gap-2 text-white bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 rounded-lg"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-semibold">Post</span>
              </Button>
            </div>
          </div>

          {/* Enhanced Filter Tabs */}
          <div className="mt-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm p-1 rounded-xl flex justify-between shadow-inner border border-white/20 dark:border-white/10">
            {[
              { key: 'recent', label: 'Recent', icon: Clock },
              { key: 'trending', label: 'Trending', icon: Flame },
              { key: 'popular', label: 'Popular', icon: TrendingUp },
              { key: 'admin', label: 'Leaders', icon: null }
            ].map((filterType) => (
              <button
                key={filterType.key}
                onClick={() => setFilter(filterType.key as any)}
                className={`flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                  filter === filterType.key
                    ? 'bg-white dark:bg-gray-800 text-purple-800 dark:text-purple-200 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-300'
                }`}
              >
                {filterType.icon && <filterType.icon className="h-3 w-3" />}
                {filterType.label}
                {filterType.key === 'recent' && unreadCount > 0 && (
                  <Badge variant="destructive" className="h-4 w-4 p-0 text-xs flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Feed */}
      <div className="pt-32 pb-20">
        <div className="max-w-md mx-auto">
          {/* Admin pending posts */}
          {userProfile?.isAdmin && posts.filter(p => p.status === 'pending').length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 px-4"
            >
              <h3 className="text-xl font-bold mb-4 text-orange-700 dark:text-orange-300 tracking-tight">
                Pending Approval
              </h3>

              <div className="space-y-4">
                {posts.filter(p => p.status === 'pending').map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-xl border border-orange-200 dark:border-orange-400/30 bg-white/50 dark:bg-orange-900/20 backdrop-blur-sm shadow-md p-4"
                  >
                    {/* Author Info */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {post.authorName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{post.authorName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {post.timestamp?.toDate?.()?.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-orange-200 text-orange-900 dark:bg-orange-400/20 dark:text-orange-300">
                        Pending
                      </Badge>
                    </div>

                    {/* Post Content */}
                    <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => approvePost(post.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                      >
                        ✅ Approve
                      </Button>
                      <Button
                        onClick={() => rejectPost(post.id)}
                        variant="destructive"
                        size="sm"
                        className="shadow-sm"
                      >
                        ❌ Reject
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Posts Feed */}
          <div className="space-y-0">
            {getFilteredPosts().map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="rounded-none border-x-0 border-t-0 last:border-b-0 shadow-none dark:bg-gray-900/60 dark:border-gray-700 transition-colors">
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
                          {/* Trending indicator */}
                          {filter === 'trending' && post.trendingScore && post.trendingScore > 10 && (
                            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-1 py-0">
                              🔥
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {post.timestamp?.toDate?.()?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400">
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

                  {/* Post Actions */}
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Like */}
                        <motion.button
                          onClick={() => handleLike(post.id)}
                          className="h-8 w-8 p-0"
                          animate={{
                            scale: likeAnimations[post.id] ? 1.2 : 1,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 10,
                          }}
                        >
                          <Heart
                            className={`h-6 w-6 transition-colors duration-300 ${
                              post.likes.includes(user.uid)
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          />
                        </motion.button>

                        {/* Comment */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-700 dark:text-gray-300"
                          onClick={() => setSelectedPostForComments(post.id)}
                        >
                          <MessageCircle className="h-6 w-6" />
                        </Button>

                        {/* Share */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-700 dark:text-gray-300"
                          onClick={() => sharePost(post.id)}
                        >
                          <Share2 className="h-6 w-6" />
                        </Button>
                      </div>

                      {/* Bookmark */}
                      <motion.button
                        onClick={() => toggleBookmark(post.id)}
                        className="h-8 w-8 p-0"
                        animate={{
                          scale: bookmarkAnimations[post.id] ? 1.2 : 1,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 10,
                        }}
                      >
                        {bookmarkedPosts.has(post.id) ? (
                          <BookmarkCheck className="h-6 w-6 text-purple-600 fill-purple-600" />
                        ) : (
                          <Bookmark className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                        )}
                      </motion.button>
                    </div>

                    {/* Enhanced Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        {post.likeCount > 0 && (
                          <span className="font-medium">
                            {post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}
                          </span>
                        )}
                        {post.commentCount > 0 && (
                          <span>{post.commentCount} comments</span>
                        )}
                        {(post.shareCount || 0) > 0 && (
                          <span>{post.shareCount} shares</span>
                        )}
                      </div>
                      {/* Engagement Score for debugging (admin only) */}
                      {userProfile?.isAdmin && (
                        <span className="text-xs text-purple-600">
                          E: {post.engagementScore?.toFixed(1)} | T: {post.trendingScore?.toFixed(1)}
                        </span>
                      )}
                    </div>

                    {/* Post Text */}
                    <motion.div
                      layout
                      initial={false}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className='bg-white dark:bg-gray-900/60'
                    >
                      <p className="text-sm dark:text-gray-200">
                        <span className="font-semibold">{post.authorName}</span>{" "}
                        {expandedPosts[post.id] || post.content.length <= 150
                          ? post.content
                          : `${post.content.slice(0, 150)}... `}
                        {post.content.length > 150 && (
                          <button
                            onClick={() => toggleExpanded(post.id)}
                            className="text-blue-500 font-medium ml-1 hover:underline dark:text-blue-400"
                          >
                            {expandedPosts[post.id] ? "Show less" : "Read more"}
                          </button>
                        )}
                      </p>
                    </motion.div>

                    {/* View Comments */}
                    {post.commentCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 dark:text-gray-400 p-0 h-auto text-sm"
                        onClick={() => setSelectedPostForComments(post.id)}
                      >
                        View all {post.commentCount} comments
                      </Button>
                    )}

                    {/* Add Comment */}
                    <div className="flex items-center space-x-2 pt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs dark:text-gray-300">
                          {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex items-center border-b border-gray-200 dark:border-neutral-700">
                        <input
                          value={quickComment[post.id] || ''}
                          onChange={(e) =>
                            setQuickComment((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          placeholder="Add a comment..."
                          className="flex-1 text-sm border-none outline-none bg-transparent placeholder-gray-500 dark:placeholder-gray-400 dark:text-white"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addQuickComment(post.id);
                            }
                          }}
                        />
                        {quickComment[post.id]?.trim() && (
                          <Button
                            onClick={() => addQuickComment(post.id)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-500 hover:text-blue-600 p-0 h-auto text-sm font-semibold"
                          >
                            Post
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {getFilteredPosts().length === 0 && (
            <div className="text-center py-20 px-4">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {filter === 'trending' ? 'No Trending Posts' : 
                 filter === 'popular' ? 'No Popular Posts Yet' :
                 filter === 'admin' ? 'No Leader Posts' :
                 'Start the Conversation'}
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">
                {filter === 'trending' ? 'Posts will appear here when they gain traction!' :
                 filter === 'popular' ? 'Posts will appear here based on engagement!' :
                 filter === 'admin' ? 'Leaders haven\'t posted yet!' :
                 'Be the first to share something meaningful with the community!'}
              </p>
              <Button
                onClick={() => navigate('/create-post')}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                Create First Post
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Comments Slide Up */}
      <CommentsSlideUp
        postId={selectedPostForComments || ''}
        isOpen={!!selectedPostForComments}
        onClose={() => setSelectedPostForComments(null)}
      />
    </div>
  );
};

export default Community;
