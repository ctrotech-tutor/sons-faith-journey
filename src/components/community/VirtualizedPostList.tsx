
import React, { memo, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { motion } from 'framer-motion';
import PostSkeleton from './PostSkeleton';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, MoreVertical, Bookmark, BookmarkCheck } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import LazyVideo from '@/components/LazyVideo';
import { formatPostContent } from '@/lib/postUtils';

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
  status: 'approved' | 'pending' | 'rejected';
  timestamp: any;
  isAdmin: boolean;
  engagementScore?: number;
  trendingScore?: number;
}

interface VirtualizedPostListProps {
  posts: CommunityPost[];
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  loadNextPage: () => Promise<void>;
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
  filter: string;
  userIsAdmin?: boolean;
}

const ITEM_HEIGHT = 400;
const CONTAINER_HEIGHT = Math.min(window.innerHeight - 200, 800);

// Memoized Post Item component to prevent unnecessary re-renders
const PostItem = memo(({ 
  index, 
  style, 
  data 
}: { 
  index: number; 
  style: React.CSSProperties;
  data: {
    posts: CommunityPost[];
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
    filter: string;
    userIsAdmin: boolean;
  };
}) => {
  const {
    posts,
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
    filter,
    userIsAdmin
  } = data;

  const post = posts[index];

  if (!post) {
    return (
      <div style={style} className="px-4">
        <PostSkeleton />
      </div>
    );
  }

  const isExpanded = expandedPosts[post.id];
  const isLikeAnimating = likeAnimations[post.id];
  const isBookmarked = bookmarkedPosts.has(post.id);
  const isBookmarkAnimating = bookmarkAnimations[post.id];

  return (
    <div style={style}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.02, 0.3) }}
        className="px-1"
      >
        <Card className="rounded-none border-x-0 border-t-0 last:border-b-0 shadow-none dark:bg-gray-900/60 dark:border-gray-700">
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
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400">
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

          {/* Post Actions */}
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={() => onHandleLike(post.id)}
                  className="h-8 w-8 p-0"
                  animate={{ scale: isLikeAnimating ? 1.2 : 1 }}
                >
                  <Heart
                    className={`h-6 w-6 transition-colors duration-300 ${
                      post.likes.includes('current-user')
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  />
                </motion.button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-700 dark:text-gray-300"
                  onClick={() => onOpenCommentsModal(post.id)}
                >
                  <MessageCircle className="h-6 w-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-700 dark:text-gray-300"
                  onClick={() => onSharePost(post.id)}
                >
                  <Share2 className="h-6 w-6" />
                </Button>
              </div>

              <motion.button
                onClick={() => onToggleBookmark(post.id)}
                className="h-8 w-8 p-0"
                animate={{ scale: isBookmarkAnimating ? 1.2 : 1 }}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="h-6 w-6 text-purple-600 fill-purple-600" />
                ) : (
                  <Bookmark className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                )}
              </motion.button>
            </div>

            {/* Stats */}
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
              {userIsAdmin && (
                <span className="text-xs text-purple-600">
                  E: {post.engagementScore?.toFixed(1)} | T: {post.trendingScore?.toFixed(1)}
                </span>
              )}
            </div>

            {/* Post Content */}
            <div className="bg-white dark:bg-gray-900/60">
              <p className="text-sm dark:text-gray-200 break-all">
                <span className="font-semibold">{post.authorName}</span>{" "}
                {isExpanded || post.content.length <= 150 ? (
                  <span>{formatPostContent(post.content, onHashtagClick)}</span>
                ) : (
                  <>
                    <span>{formatPostContent(post.content.slice(0, 150), onHashtagClick)}...</span>
                    <button
                      onClick={() => onToggleExpanded(post.id)}
                      className="text-blue-500 font-medium ml-1 hover:underline dark:text-blue-400"
                    >
                      Read more
                    </button>
                  </>
                )}
                {post.content.length > 150 && isExpanded && (
                  <button
                    onClick={() => onToggleExpanded(post.id)}
                    className="text-blue-500 font-medium ml-1 hover:underline dark:text-blue-400"
                  >
                    Show less
                  </button>
                )}
              </p>
            </div>

            {/* View Comments */}
            {post.commentCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 dark:text-gray-400 p-0 h-auto text-sm"
                onClick={() => onOpenCommentsModal(post.id)}
              >
                View all {post.commentCount} comments
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
});

PostItem.displayName = 'PostItem';

const VirtualizedPostList = memo(({
  posts,
  hasNextPage,
  isNextPageLoading,
  loadNextPage,
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
  filter,
  userIsAdmin = false
}: VirtualizedPostListProps) => {
  const itemCount = hasNextPage ? posts.length + 1 : posts.length;

  // Memoize the data object to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    posts,
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
    filter,
    userIsAdmin
  }), [
    posts,
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
    filter,
    userIsAdmin
  ]);

  // Memoize the scroll handler to prevent recreation
  const handleItemsRendered = useCallback(({ visibleStopIndex }: { visibleStopIndex: number }) => {
    if (hasNextPage && !isNextPageLoading && visibleStopIndex >= posts.length - 5) {
      loadNextPage();
    }
  }, [hasNextPage, isNextPageLoading, posts.length, loadNextPage]);

  return (
    <div className="w-full max-w-md mx-auto">
      <List
        height={CONTAINER_HEIGHT}
        width={'100%'}
        itemCount={itemCount}
        itemSize={ITEM_HEIGHT}
        itemData={itemData}
        overscanCount={2}
        className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
        onItemsRendered={handleItemsRendered}
      >
        {PostItem}
      </List>
    </div>
  );
});

VirtualizedPostList.displayName = 'VirtualizedPostList';

export default VirtualizedPostList;
