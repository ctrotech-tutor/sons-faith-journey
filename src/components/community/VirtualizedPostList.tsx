
import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { motion } from 'framer-motion';
import PostCard from './PostCard';
import PostSkeleton from './PostSkeleton';

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
  onPostInteraction: (postId: string, action: string) => void;
}

const ITEM_HEIGHT = 400; // Average post height
const CONTAINER_HEIGHT = window.innerHeight - 200; // Viewport minus header/nav

const VirtualizedPostList = memo(({ 
  posts, 
  hasNextPage, 
  isNextPageLoading, 
  loadNextPage,
  onPostInteraction 
}: VirtualizedPostListProps) => {
  const itemCount = hasNextPage ? posts.length + 1 : posts.length;

  const PostItem = memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const post = posts[index];

    if (!post) {
      return (
        <div style={style}>
          <PostSkeleton />
        </div>
      );
    }

    return (
      <div style={style}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02 }}
          className="px-1"
        >
          <PostCard 
            post={post} 
            onInteraction={onPostInteraction}
          />
        </motion.div>
      </div>
    );
  });

  const memoizedList = useMemo(() => (
    <List
      height={CONTAINER_HEIGHT}
      width={'100%'}
      itemCount={itemCount}
      itemSize={ITEM_HEIGHT}
      overscanCount={2}
      className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
      onItemsRendered={({ visibleStopIndex }) => {
        // Load more when near the end
        if (hasNextPage && !isNextPageLoading && visibleStopIndex >= posts.length - 5) {
          loadNextPage();
        }
      }}
    >
      {PostItem}
    </List>
  ), [itemCount, posts, hasNextPage, isNextPageLoading, loadNextPage, PostItem]);

  return (
    <div className="w-full max-w-md mx-auto">
      {memoizedList}
    </div>
  );
});

VirtualizedPostList.displayName = 'VirtualizedPostList';

export default VirtualizedPostList;
