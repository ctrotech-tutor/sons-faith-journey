
import React, { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreVertical, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import LazyImage from '../LazyImage';
import LazyVideo from '../LazyVideo';
import { formatPostContent } from '@/lib/postUtils';

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
  timestamp: any;
  isAdmin: boolean;
}

interface PostCardProps {
  post: CommunityPost;
  onInteraction: (postId: string, action: string) => void;
}

const PostCard = memo(({ post, onInteraction }: PostCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleLike = useCallback(() => {
    setLikeAnimation(true);
    onInteraction(post.id, 'like');
    setTimeout(() => setLikeAnimation(false), 300);
  }, [post.id, onInteraction]);

  const handleComment = useCallback(() => {
    onInteraction(post.id, 'comment');
  }, [post.id, onInteraction]);

  const handleShare = useCallback(() => {
    onInteraction(post.id, 'share');
  }, [post.id, onInteraction]);

  const handleBookmark = useCallback(() => {
    setBookmarked(!bookmarked);
    onInteraction(post.id, 'bookmark');
  }, [bookmarked, post.id, onInteraction]);

  const toggleExpanded = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  return (
    <Card className="rounded-none border-x-0 border-t-0 last:border-b-0 shadow-none dark:bg-gray-900/60 dark:border-gray-700">
      {/* Header */}
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
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400">
          <MoreVertical className="h-4 w-4" />
        </Button>
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
              className="w-full aspect-square object-cover"
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={handleLike}
              className="h-8 w-8 p-0"
              animate={{ scale: likeAnimation ? 1.2 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <Heart
                className={`h-6 w-6 transition-colors duration-300 ${
                  post.likes.includes('user-id') // Replace with actual user ID
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              />
            </motion.button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-700 dark:text-gray-300"
              onClick={handleComment}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-700 dark:text-gray-300"
              onClick={handleShare}
            >
              <Share2 className="h-6 w-6" />
            </Button>
          </div>

          <motion.button
            onClick={handleBookmark}
            className="h-8 w-8 p-0"
            animate={{ scale: bookmarked ? 1.2 : 1 }}
          >
            {bookmarked ? (
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
            {post.shareCount > 0 && (
              <span>{post.shareCount} shares</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-900/60">
          <p className="text-sm dark:text-gray-200">
            <span className="font-semibold">{post.authorName}</span>{" "}
            {expanded || post.content.length <= 150 ? (
              <span>{formatPostContent(post.content)}</span>
            ) : (
              <>
                <span>{formatPostContent(post.content.slice(0, 150))}...</span>
                <button
                  onClick={toggleExpanded}
                  className="text-blue-500 font-medium ml-1 hover:underline dark:text-blue-400"
                >
                  Read more
                </button>
              </>
            )}
            {post.content.length > 150 && expanded && (
              <button
                onClick={toggleExpanded}
                className="text-blue-500 font-medium ml-1 hover:underline dark:text-blue-400"
              >
                Show less
              </button>
            )}
          </p>
        </div>
      </div>
    </Card>
  );
});

PostCard.displayName = 'PostCard';

export default PostCard;