
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { ArrowLeft, Heart, MessageCircle, Share2, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/lib/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { formatPostContent, extractHashtags, isYouTubeUrl, getYouTubeEmbedUrl } from '@/lib/postUtils';


interface BookmarkedPost {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: string[];
  likeCount: number;
  commentCount: number;
  timestamp: any;
  bookmarkedAt: any;
  isAdmin: boolean;
}

const Bookmarks = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<BookmarkedPost[]>([]);
  const [filter, setFilter] = useState<'all' | 'recent' | 'popular'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const bookmarksQuery = query(
      collection(db, 'bookmarks'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(bookmarksQuery, (snapshot) => {
      const bookmarkData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BookmarkedPost[];

      setBookmarks(bookmarkData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const removeBookmark = async (bookmarkId: string) => {
    try {
      await deleteDoc(doc(db, 'bookmarks', bookmarkId));
      toast({
        title: 'Bookmark Removed',
        description: 'Post has been removed from your bookmarks.'
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove bookmark. Please try again.',
        variant: 'destructive'
      });
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

  const getFilteredBookmarks = () => {
    switch (filter) {
      case 'recent':
        return [...bookmarks].sort((a, b) => b.bookmarkedAt?.seconds - a.bookmarkedAt?.seconds);
      case 'popular':
        return [...bookmarks].sort((a, b) => b.likeCount - a.likeCount);
      default:
        return bookmarks;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-lg max-w-md">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Sign In Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please sign in to view your bookmarks.</p>
          <Button onClick={() => navigate('/auth/login')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="sticky top-0 left-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/60 border-b border-white/20 dark:border-white/10 shadow-sm"
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
                Bookmarks
              </h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              {bookmarks.length} saved
            </Badge>
          </div>

          {/* Filter Tabs */}
          <div className="mt-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm p-1 rounded-xl flex justify-between shadow-inner border border-white/20 dark:border-white/10">
            {[
              { key: 'all', label: 'All' },
              { key: 'recent', label: 'Recent' },
              { key: 'popular', label: 'Popular' }
            ].map((filterType) => (
              <button
                key={filterType.key}
                onClick={() => setFilter(filterType.key as any)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${filter === filterType.key
                    ? 'bg-white dark:bg-gray-800 text-purple-800 dark:text-purple-200 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-300'
                  }`}
              >
                {filterType.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="pb-20">
        <div className="max-w-md mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full" />
            </div>
          ) : getFilteredBookmarks().length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="text-6xl mb-4">🔖</div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No Bookmarks Yet</h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">Save posts you want to read later!</p>
              <Button
                onClick={() => navigate('/community')}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                Explore Community
              </Button>
            </div>
          ) : (
            <div className="space-y-0">
              {getFilteredBookmarks().map((bookmark, index) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="rounded-none border-x-0 border-t-0 last:border-b-0 shadow-none dark:bg-gray-900/60 dark:border-gray-700">
                    {/* Post Header */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center text-white font-semibold">
                              <AvatarImage
                            src={bookmark?.authorAvatar || './default-avatar.png'}
                             alt={bookmark?.authorName || 'User Avatar'}
                           />
                          <AvatarFallback className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center text-white font-semibold">
                            {bookmark.authorName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-sm dark:text-white">{bookmark.authorName}</p>
                            {bookmark.isAdmin && (
                              <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-2 py-0">
                                Leader
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Saved {bookmark.bookmarkedAt?.toDate?.()?.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBookmark(bookmark.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Media */}
                    {bookmark.mediaUrl && (
                      <div className="w-full bg-black/5 dark:bg-white/5">
                        {bookmark.mediaType === 'image' ? (
                          <img
                            src={bookmark.mediaUrl}
                            alt="Post"
                            className="w-full aspect-square object-cover"
                          />
                        ) : bookmark.mediaType === 'video' ? (
                          isYouTubeUrl(bookmark.mediaUrl) ? (
                            <div className="w-full aspect-video">
                              <iframe
                                src={getYouTubeEmbedUrl(bookmark.mediaUrl)}
                                className="w-full h-full"
                                allowFullScreen
                                title="YouTube video"
                              />
                            </div>
                          ) : (
                            <video
                              src={bookmark.mediaUrl}
                              controls
                              className="w-full aspect-square object-cover"
                            />
                          )
                        ) : null}
                      </div>
                    )}

                    {/* Content */}
                    <div className="px-4 py-3 space-y-2">
                      <p className="text-sm dark:text-gray-200">
                        <span className="font-semibold">{bookmark.authorName}</span>{" "}
                        {bookmark.content}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{bookmark.likeCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{bookmark.commentCount}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => sharePost(bookmark.postId)}
                          className="h-auto p-1"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
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

export default Bookmarks;
