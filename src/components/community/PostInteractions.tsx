
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface PostInteractionsProps {
  post: CommunityPost;
  user: any;
  likeAnimation: boolean;
  bookmarked: boolean;
  bookmarkAnimation: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onBookmark: () => void;
}

const PostInteractions = ({
  post,
  user,
  likeAnimation,
  bookmarked,
  bookmarkAnimation,
  onLike,
  onComment,
  onShare,
  onBookmark
}: PostInteractionsProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <motion.button
          onClick={onLike}
          className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          animate={{ scale: likeAnimation ? 1.2 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
          <Heart
            className={`h-6 w-6 transition-colors duration-300 ${
              post.likes.includes(user?.uid || '')
                ? 'fill-red-500 text-red-500'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {post.likeCount}
          </span>
        </motion.button>

        <Button
          variant="ghost"
          className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onComment}
        >
          <MessageCircle className="h-6 w-6" />
          <span className="text-sm font-medium">{post.commentCount}</span>
        </Button>

        <Button
          variant="ghost"
          className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onShare}
        >
          <Share2 className="h-6 w-6" />
          <span className="text-sm font-medium">{post.shareCount}</span>
        </Button>
      </div>

      <motion.button
        onClick={onBookmark}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        animate={{ scale: bookmarkAnimation ? 1.2 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
      >
        {bookmarked ? (
          <BookmarkCheck className="h-6 w-6 text-purple-600 fill-purple-600" />
        ) : (
          <Bookmark className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        )}
      </motion.button>
    </div>
  );
};

export default PostInteractions;
