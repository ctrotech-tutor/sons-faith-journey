import React, { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreVertical, 
  Bookmark, 
  BookmarkCheck,
  Eye,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LazyImage from '@/components/LazyImage';
import LazyVideo from '@/components/LazyVideo';
import { formatPostContent } from '@/lib/postUtils';
import { useAuth } from '@/lib/hooks/useAuth';
import debounce from 'lodash.debounce';

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
  viewCount?: number;
  status: 'approved' | 'pending' | 'rejected';
  timestamp: any;
  isAdmin: boolean;
  engagementScore?: number;
  trendingScore?: number;
  isPinned?: boolean;
  isSponsored?: boolean;
}

interface OptimizedPostCardProps {
  post: CommunityPost;
  onInteraction: (postId: string, action: string) => void;
  isVirtualized?: boolean;
  expandedPosts?: { [postId: string]: boolean };
  likeAnimations?: { [postId: string]: boolean };
  bookmarkedPosts?: Set<string>;
  bookmarkAnimations?: { [postId: string]: boolean };
}

const OptimizedPostCard = memo(({
  post,
  onInteraction,
  isVirtualized = false,
  expandedPosts = {},
  likeAnimations = {},
  bookmarkedPosts = new Set(),
  bookmarkAnimations = {}
}: OptimizedPostCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Debounced click handlers for performance
  const debouncedLike = useCallback(
    debounce(() => onInteraction(post.id, 'like'), 100),
    [post.id, onInteraction]
  );

  const debouncedBookmark = useCallback(
    debounce(() => onInteraction(post.id, 'bookmark'), 100),
    [post.id, onInteraction]
  );

  const handlePostClick = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
      return;
    }
    navigate(`/community/post/${post.id}`);
  }, [navigate, post.id]);

  const formatEngagementStats = useCallback(() => {
    const stats = [];
    if (post.likeCount > 0) stats.push(`${post.likeCount} likes`);
    if (post.commentCount > 0) stats.push(`${post.commentCount} comments`);
    if (post.shareCount > 0) stats.push(`${post.shareCount} shares`);
    if (post.viewCount && post.viewCount > 0) stats.push(`${post.viewCount} views`);
    return stats.join(' • ');
  }, [post]);

  const getPriorityBadge = useCallback(() => {
    if (post.isPinned) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
          📌 Pinned
        </Badge>
      );
    }
    if (post.isSponsored) {
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
          Sponsored
        </Badge>
      );
    }
    if (post.trendingScore && post.trendingScore > 15) {
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs">
          🔥 Trending
        </Badge>
      );
    }
    return null;
  }, [post]);

  return (
    <motion.div
      layout={!isVirtualized}
      onClick={handlePostClick}
      className="cursor-pointer group"
      initial={false}
    >
      <Card className="rounded-none border-x-0 border-t-0 last:border-b-0 shadow-none dark:bg-gray-900/60 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/80">
        {/* Optimized Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-10 w-10 ring-1 ring-gray-200 dark:ring-gray-700">
                <AvatarImage src={post.authorAvatar} />
                <AvatarFallback className="text-sm font-semibold dark:text-gray-300">
                  {post.authorName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {post.isAdmin && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <Crown className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="font-semibold text-sm dark:text-white truncate">{post.authorName}</p>
                {post.isAdmin && (
                  <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-2 py-0.5">
                    Leader
                  </Badge>
                )}
                {getPriorityBadge()}
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{post.timestamp?.toDate?.()?.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        {/* Optimized Media */}
        {post.mediaUrl && (
          <div className="relative w-full bg-black/5 dark:bg-white/5">
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

        {/* Optimized Actions */}
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  debouncedLike();
                }}
                className="flex items-center space-x-1 group"
                whileTap={{ scale: 0.95 }}
              >
                <Heart
                  className={`h-6 w-6 transition-colors ${
                    post.likes.includes(user?.uid || '')
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-700 dark:text-gray-300 group-hover:text-red-500'
                  }`}
                />
                {post.likeCount > 0 && (
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {post.likeCount}
                  </span>
                )}
              </motion.button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-gray-700 dark:text-gray-300 hover:text-blue-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onInteraction(post.id, 'comment');
                }}
              >
                <MessageCircle className="h-6 w-6 mr-1" />
                {post.commentCount > 0 && (
                  <span className="text-sm font-medium">{post.commentCount}</span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-gray-700 dark:text-gray-300 hover:text-green-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onInteraction(post.id, 'share');
                }}
              >
                <Share2 className="h-6 w-6 mr-1" />
                {post.shareCount > 0 && (
                  <span className="text-sm font-medium">{post.shareCount}</span>
                )}
              </Button>

              {post.viewCount && post.viewCount > 0 && (
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">{post.viewCount}</span>
                </div>
              )}
            </div>

            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                debouncedBookmark();
              }}
              className="h-8 w-8 p-0 group"
              whileTap={{ scale: 0.95 }}
            >
              {bookmarkedPosts.has(post.id) ? (
                <BookmarkCheck className="h-6 w-6 text-purple-600 fill-purple-600" />
              ) : (
                <Bookmark className="h-6 w-6 text-gray-700 dark:text-gray-300 group-hover:text-purple-600" />
              )}
            </motion.button>
          </div>

          {/* Engagement Stats */}
          {formatEngagementStats() && (
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {formatEngagementStats()}
            </p>
          )}

          {/* Optimized Content */}
          <div className="space-y-2">
            <p className="text-sm dark:text-gray-200 leading-relaxed">
              <span className="font-semibold">{post.authorName}</span>{" "}
              {expandedPosts[post.id] || post.content.length <= 200 ? (
                <span>{formatPostContent(post.content, () => {})}</span>
              ) : (
                <>
                  <span>{formatPostContent(post.content.slice(0, 200), () => {})}...</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInteraction(post.id, 'expand');
                    }}
                    className="text-blue-500 font-medium ml-1 hover:underline dark:text-blue-400"
                  >
                    more
                  </button>
                </>
              )}
            </p>
          </div>

          {/* View Comments */}
          {post.commentCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 dark:text-gray-400 p-0 h-auto text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onInteraction(post.id, 'comment');
              }}
            >
              View all {post.commentCount} comments
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
});

OptimizedPostCard.displayName = 'OptimizedPostCard';

export default OptimizedPostCard;