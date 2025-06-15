import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreVertical, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LazyImage from '@/components/LazyImage';
import LazyVideo from '@/components/LazyVideo';
import PostSkeleton from './PostSkeleton';
import { formatPostContent } from '@/lib/postUtils';
import { useAuth } from '@/lib/hooks/useAuth';

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
  comments: Comment[];
  commentCount: number;
  shareCount: number;
  status: 'approved' | 'pending' | 'rejected';
  timestamp: any;
  isAdmin: boolean;
  engagementScore?: number;
  trendingScore?: number;
}

interface PostsListProps {
  posts: CommunityPost[];
  loading: boolean;
  filter: string;
  hashtagFilter: string | null;
  expandedPosts: { [postId: string]: boolean };
  likeAnimations: { [postId: string]: boolean };
  bookmarkedPosts: Set<string>;
  bookmarkAnimations: { [postId: string]: boolean };
  onToggleExpanded: (postId: string) => void;
  onHandleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onSharePost: (postId: string) => void;
  onOpenCommentsModal: (postId: string) => void;
  onHashtagClick: (hashtag: string) => void;
}

const PostsList = ({
  posts,
  loading,
  filter,
  hashtagFilter,
  expandedPosts,
  likeAnimations,
  bookmarkedPosts,
  bookmarkAnimations,
  onToggleExpanded,
  onHandleLike,
  onToggleBookmark,
  onSharePost,
  onOpenCommentsModal,
  onHashtagClick,
}: PostsListProps) => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const handlePostClick = (postId: string, event: React.MouseEvent) => {
    // Prevent navigation if clicking on interactive elements
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
      return;
    }
    navigate(`/community/post/${postId}`);
  };

  if (loading) {
    return (
      <div className="space-y-0">
        {[...Array(4)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
          {hashtagFilter ? `No posts with ${hashtagFilter}` :
            filter === 'trending' ? 'No Trending Posts' :
              filter === 'popular' ? 'No Popular Posts Yet' :
                filter === 'admin' ? 'No Leader Posts' :
                  'Start the Conversation'}
        </h3>
        <p className="text-gray-500 dark:text-gray-500 mb-6">
          {hashtagFilter ? 'Try a different hashtag or create a post with this tag!' :
            filter === 'trending' ? 'Posts will appear here when they gain traction!' :
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
    );
  }

  return (
    <div className="space-y-0">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={(e) => handlePostClick(post.id, e)}
          className="cursor-pointer"
        >
          <Card className="rounded-none border-x-0 border-t-0 last:border-b-0 shadow-none dark:bg-gray-900/60 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/80">
            {/* Post Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8 ring-1 ring-gray-300 dark:ring-gray-600">
                  <AvatarImage src={post.authorAvatar} />
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
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Media */}
            {post.mediaUrl && (
              <div className="w-full bg-black/5 dark:bg-white/5 relative">
                {post.mediaType === 'image' ? (
                  <LazyImage
                    src={post.mediaUrl}
                    alt="Post media"
                    className="w-full max-w- aspect-square object-cover"
                  />
                ) : (
                  <LazyVideo
                    src={post.mediaUrl}
                    className="w-full aspect-video max-w-full object-cover"
                  />
                )}
              </div>
            )}

            {/* Post Actions */}
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onHandleLike(post.id);
                    }}
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
                        post.likes.includes(user?.uid || '')
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    />
                  </motion.button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-700 dark:text-gray-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCommentsModal(post.id);
                    }}
                  >
                    <MessageCircle className="h-6 w-6" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-700 dark:text-gray-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSharePost(post.id);
                    }}
                  >
                    <Share2 className="h-6 w-6" />
                  </Button>
                </div>

                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(post.id);
                  }}
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
                {userProfile?.isAdmin && (
                  <span className="text-xs text-purple-600">
                    E: {post.engagementScore?.toFixed(1)} | T: {post.trendingScore?.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Post Text with formatting */}
              <motion.div
                layout
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className='bg-white dark:bg-gray-900/60'
              >
                <p className="text-sm dark:text-gray-200 break-all">
                  <span className="font-semibold">{post.authorName}</span>{" "}
                  {expandedPosts[post.id] || post.content.length <= 150 ? (
                    <span>{formatPostContent(post.content, onHashtagClick)}</span>
                  ) : (
                    <>
                      <span>{formatPostContent(post.content.slice(0, 150), onHashtagClick)}...</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleExpanded(post.id);
                        }}
                        className="text-blue-500 font-medium ml-1 hover:underline dark:text-blue-400"
                      >
                        Read more
                      </button>
                    </>
                  )}
                  {post.content.length > 150 && expandedPosts[post.id] && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpanded(post.id);
                      }}
                      className="text-blue-500 font-medium ml-1 hover:underline dark:text-blue-400"
                    >
                      Show less
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCommentsModal(post.id);
                  }}
                >
                  View all {post.commentCount} comments
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default PostsList;
