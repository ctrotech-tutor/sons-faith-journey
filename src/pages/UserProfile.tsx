import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { ArrowLeft, MapPin, Calendar, MessageCircle, Heart, Share2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LazyImage from '@/components/LazyImage';
import LazyVideo from '@/components/LazyVideo';
import MetaUpdater from '@/components/MetaUpdater';
import { formatPostContent } from '@/lib/postUtils';
import { useToast } from '@/lib/hooks/use-toast';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  bio?: string;
  location?: string;
  joinedDate: any;
  isAdmin: boolean;
  stats?: {
    postsCount: number;
    likesReceived: number;
    commentsReceived: number;
    followers: number;
    following: number;
  };
}

interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  timestamp: any;
  isAdmin: boolean;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  // Use current user if no userId provided
  const targetUserId = userId || user?.uid;

  useEffect(() => {
    if (!targetUserId) {
      toast({
        title: 'User not found',
        description: 'Please log in to view profiles',
        variant: 'destructive'
      });
      navigate('/community');
      return;
    }

    loadUserProfile();
  }, [targetUserId]);

  const loadUserProfile = async () => {
    if (!targetUserId) return;

    setLoading(true);
    try {
      // Load user profile
      const userDoc = await getDoc(doc(db, 'users', targetUserId));
      
      if (!userDoc.exists()) {
        toast({
          title: 'User not found',
          description: 'This user profile does not exist',
          variant: 'destructive'
        });
        navigate('/community');
        return;
      }

      const userData = userDoc.data();
      
      // Get user posts
      const postsQuery = query(
        collection(db, 'communityPosts'),
        where('authorId', '==', targetUserId),
        where('status', '==', 'approved'),
        orderBy('timestamp', 'desc')
      );
      
      const postsSnapshot = await getDocs(postsQuery);
      const posts = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityPost[];

      // Calculate stats
      const stats = {
        postsCount: posts.length,
        likesReceived: posts.reduce((sum, post) => sum + (post.likeCount || 0), 0),
        commentsReceived: posts.reduce((sum, post) => sum + (post.commentCount || 0), 0),
        followers: 0, // We'll implement followers later
        following: 0
      };

      setUserProfile({
        uid: targetUserId,
        displayName: userData.displayName || userData.email?.split('@')[0] || 'Anonymous',
        email: userData.email || '',
        photoURL: userData.photoURL || '',
        bio: userData.bio || '',
        location: userData.location || '',
        joinedDate: userData.createdAt,
        isAdmin: userData.isAdmin || false,
        stats
      });

      setUserPosts(posts);
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHashtagClick = (hashtag: string) => {
    navigate(`/community?hashtag=${encodeURIComponent(hashtag)}`);
  };

  const handlePostClick = (postId: string) => {
    navigate(`/community/post/${postId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-300 dark:bg-gray-700" />
            <div className="p-6 space-y-4">
              <div className="h-24 w-24 bg-gray-300 dark:bg-gray-700 rounded-full" />
              <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) return null;

  const isOwnProfile = targetUserId === user?.uid;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MetaUpdater
        title={`${userProfile.displayName}'s Profile`}
        description={userProfile.bio || `View ${userProfile.displayName}'s posts and activity on Son's Faith Journey`}
      />
      
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 min-h-screen">
        {/* Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500" />
          
          {/* Navigation */}
          <div className="absolute top-4 left-4 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="bg-black/20 hover:bg-black/30 text-white backdrop-blur-sm"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16">
              <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800 shadow-lg">
                    <AvatarImage src={userProfile.photoURL} />
                    <AvatarFallback className="text-3xl bg-gray-100 dark:bg-gray-700">
                      {userProfile.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {userProfile.isAdmin && (
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <Crown className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="text-center sm:text-left">
                  <div className="flex items-center space-x-2 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userProfile.displayName}
                    </h1>
                    {userProfile.isAdmin && (
                      <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                        Leader
                      </Badge>
                    )}
                  </div>
                  
                  {userProfile.bio && (
                    <p className="text-gray-600 dark:text-gray-300 mb-2 max-w-md">
                      {userProfile.bio}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {userProfile.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{userProfile.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {userProfile.joinedDate?.toDate?.()?.toLocaleDateString() || 'Recently'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {isOwnProfile && (
                <Button 
                  variant="outline"
                  onClick={() => navigate('/profile')}
                  className="mt-4 sm:mt-0"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 border-b dark:border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile.stats?.postsCount || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile.stats?.likesReceived || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile.stats?.commentsReceived || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile.stats?.followers || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b dark:border-gray-700">
            <TabsTrigger value="posts" className="rounded-none">
              Posts ({userProfile.stats?.postsCount || 0})
            </TabsTrigger>
            <TabsTrigger value="liked" className="rounded-none">
              Liked
            </TabsTrigger>
            <TabsTrigger value="media" className="rounded-none">
              Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            {userPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {userPosts.map((post) => (
                  <Card 
                    key={post.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200"
                    onClick={() => handlePostClick(post.id)}
                  >
                    {post.mediaUrl && (
                      <div className="aspect-square bg-black/5 dark:bg-white/5">
                        {post.mediaType === 'image' ? (
                          <LazyImage
                            src={post.mediaUrl}
                            alt="Post media"
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                        ) : (
                          <LazyVideo
                            src={post.mediaUrl}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                        )}
                      </div>
                    )}
                    
                    <div className="p-4">
                      <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-3 mb-3">
                        {formatPostContent(post.content, handleHashtagClick)}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{post.timestamp?.toDate?.()?.toLocaleDateString()}</span>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3" />
                            <span>{post.likeCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{post.commentCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Share2 className="h-3 w-3" />
                            <span>{post.shareCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  {isOwnProfile ? "You haven't posted yet" : "No posts yet"}
                </h3>
                <p className="text-gray-500 dark:text-gray-500 mb-6">
                  {isOwnProfile 
                    ? "Share your first post with the community!" 
                    : "This user hasn't shared any posts yet."
                  }
                </p>
                {isOwnProfile && (
                  <Button onClick={() => navigate('/create-post')}>
                    Create Your First Post
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="liked" className="mt-0">
            <div className="text-center py-20">
              <div className="text-6xl mb-4">❤️</div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Liked Posts
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Liked posts will appear here (coming soon)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="media" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-6">
              {userPosts
                .filter(post => post.mediaUrl)
                .map((post) => (
                  <div 
                    key={post.id}
                    className="aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handlePostClick(post.id)}
                  >
                    {post.mediaType === 'image' ? (
                      <LazyImage
                        src={post.mediaUrl!}
                        alt="Post media"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <LazyVideo
                        src={post.mediaUrl!}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                  </div>
                ))}
            </div>
            {userPosts.filter(post => post.mediaUrl).length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🖼️</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No Media Posts
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  {isOwnProfile 
                    ? "Share photos and videos with the community!" 
                    : "This user hasn't shared any media posts yet."
                  }
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;