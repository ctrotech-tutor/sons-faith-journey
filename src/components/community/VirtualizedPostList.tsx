
import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { VariableSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { motion } from 'framer-motion';
import OptimizedPostCard from './OptimizedPostCard';
import PostSkeleton from './PostSkeleton';
import throttle from 'lodash.throttle';

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
  onPostInteraction: (postId: string, action: string) => void;
}

const ITEM_HEIGHT = 420; // Optimized post height
const CONTAINER_HEIGHT = Math.min(window.innerHeight - 200, 800); // Responsive height
const OVERSCAN_COUNT = 5; // Render extra items for smoother scrolling

const VirtualizedPostList = memo(({ 
  posts, 
  hasNextPage, 
  isNextPageLoading, 
  loadNextPage,
  onPostInteraction 
}: VirtualizedPostListProps) => {
  const itemCount = hasNextPage ? posts.length + 1 : posts.length;
  const listRef = useRef<any>(null);
  
  // Throttled load more to prevent excessive calls
  const throttledLoadMore = useCallback(
    throttle(() => {
      if (hasNextPage && !isNextPageLoading) {
        loadNextPage();
      }
    }, 1000),
    [hasNextPage, isNextPageLoading, loadNextPage]
  );

  // Check if item is loaded
  const isItemLoaded = useCallback((index: number) => {
    return !!posts[index];
  }, [posts]);

  // Dynamic item size based on content
  const getItemSize = useCallback((index: number) => {
    const post = posts[index];
    if (!post) return ITEM_HEIGHT;
    
    let baseHeight = 200; // Base post height
    
    // Add height for media
    if (post.mediaUrl) {
      baseHeight += post.mediaType === 'video' ? 250 : 300;
    }
    
    // Add height for long content
    if (post.content && post.content.length > 200) {
      baseHeight += Math.min(post.content.length / 4, 100);
    }
    
    return baseHeight;
  }, [posts]);

  const PostItem = memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const post = posts[index];

    // Show skeleton for loading items
    if (!post) {
      return (
        <div style={style} className="px-2">
          <PostSkeleton />
        </div>
      );
    }

    // Optimized post rendering with reduced animations for performance
    return (
      <div style={style} className="px-2">
        <OptimizedPostCard 
          post={post} 
          onInteraction={onPostInteraction}
          isVirtualized={true}
        />
      </div>
    );
  });

  PostItem.displayName = 'VirtualizedPostItem';

  // Optimized list with infinite loading
  const memoizedList = useMemo(() => (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={throttledLoadMore}
      threshold={3} // Load more when 3 items from the end
    >
      {({ onItemsRendered, ref }) => (
        <List
          ref={(list) => {
            listRef.current = list;
            if (ref) ref.current = list;
          }}
          height={CONTAINER_HEIGHT}
          width="100%"
          itemCount={itemCount}
          itemSize={getItemSize}
          overscanCount={OVERSCAN_COUNT}
          onItemsRendered={onItemsRendered}
          className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
          style={{
            scrollBehavior: 'smooth'
          }}
        >
          {PostItem}
        </List>
      )}
    </InfiniteLoader>
  ), [itemCount, posts, isItemLoaded, throttledLoadMore, getItemSize, PostItem]);

  // Scroll to top when filter changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(0, 'start');
    }
  }, [posts.length === 0]); // Reset when posts are cleared

  return (
    <div className="w-full max-w-md mx-auto">
      {memoizedList}
    </div>
  );
});

VirtualizedPostList.displayName = 'VirtualizedPostList';

export default VirtualizedPostList;
