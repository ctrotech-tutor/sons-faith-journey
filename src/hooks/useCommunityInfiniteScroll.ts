import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, orderBy, limit, startAfter, onSnapshot, where, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { extractHashtags } from '@/lib/postUtils';
import debounce from 'lodash.debounce';
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
  comments: any[];
  commentCount: number;
  shareCount: number;
  status: 'approved' | 'pending' | 'rejected';
  timestamp: any;
  isAdmin: boolean;
  engagementScore?: number;
  trendingScore?: number;
}

const POSTS_PER_PAGE = 10;

const calculateEngagementScore = (post: CommunityPost) => {
  const hoursSincePost = (Date.now() - post.timestamp?.toDate()?.getTime()) / (1000 * 60 * 60);
  const timeDecay = Math.exp(-hoursSincePost / 24);

  const likeWeight = 1;
  const commentWeight = 3;
  const shareWeight = 5;
  const adminBonus = post.isAdmin ? 2 : 1;

  const engagementPoints =
    (post.likeCount * likeWeight) +
    (post.commentCount * commentWeight) +
    ((post.shareCount || 0) * shareWeight);

  return engagementPoints * timeDecay * adminBonus;
};

const calculateTrendingScore = (post: CommunityPost) => {
  const now = Date.now();
  const postTime = post.timestamp?.toDate()?.getTime() || now;
  const hoursSincePost = (now - postTime) / (1000 * 60 * 60);

  if (hoursSincePost > 48) return 0;

  const recentEngagement = post.likeCount + (post.commentCount * 2) + ((post.shareCount || 0) * 3);
  const timeBoost = Math.max(0, 48 - hoursSincePost) / 48;
  const velocityScore = recentEngagement / Math.max(hoursSincePost, 1);

  const adminBonus = post.isAdmin ? 1.5 : 1;
  const recencyBonus = hoursSincePost < 6 ? 1.3 : 1;

  return velocityScore * timeBoost * adminBonus * recencyBonus;
};

export const useCommunityInfiniteScroll = (user: any, userProfile: any) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [filter, setFilter] = useState<'recent' | 'trending' | 'popular' | 'admin'>('recent');
  const [hashtagFilter, setHashtagFilter] = useState<string | null>(null);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Debounced filter change to prevent excessive queries
  const debouncedFilterChange = useCallback(
    debounce((newFilter: string, newHashtagFilter: string | null) => {
      setFilter(newFilter as any);
      setHashtagFilter(newHashtagFilter);
      setPosts([]);
      setLastDoc(null);
      setHasNextPage(true);
      setLoading(true);
    }, 300),
    []
  );

  // Throttled scroll handler
  const throttledLoadMore = useCallback(
    throttle(() => {
      if (hasNextPage && !isNextPageLoading) {
        loadNextPage();
      }
    }, 1000),
    [hasNextPage, isNextPageLoading]
  );

  const buildQuery = useCallback((isFirstLoad = true) => {
    let baseQuery = query(
      collection(db, 'communityPosts'),
      where('status', '==', 'approved'),
      orderBy('timestamp', 'desc'),
      limit(POSTS_PER_PAGE)
    );

    if (!isFirstLoad && lastDoc) {
      baseQuery = query(
        collection(db, 'communityPosts'),
        where('status', '==', 'approved'),
        orderBy('timestamp', 'desc'),
        startAfter(lastDoc),
        limit(POSTS_PER_PAGE)
      );
    }

    return baseQuery;
  }, [lastDoc]);

  const loadNextPage = useCallback(async () => {
    if (!user || isNextPageLoading || !hasNextPage) return;

    setIsNextPageLoading(true);
    
    try {
      const nextQuery = buildQuery(false);
      
      // Use getDocs for pagination instead of onSnapshot
      const { getDocs } = await import('firebase/firestore');
      const snapshot = await getDocs(nextQuery);
      
      if (snapshot.empty) {
        setHasNextPage(false);
        setIsNextPageLoading(false);
        return;
      }

      const newPosts = snapshot.docs.map(doc => {
        const data = doc.data();
        const post = {
          id: doc.id,
          ...data,
          shareCount: data.shareCount || 0
        } as CommunityPost;

        post.engagementScore = calculateEngagementScore(post);
        post.trendingScore = calculateTrendingScore(post);

        return post;
      });

      const filteredNewPosts = applyFilters(newPosts, filter, hashtagFilter);
      
      setPosts(prevPosts => [...prevPosts, ...filteredNewPosts]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      
      if (snapshot.docs.length < POSTS_PER_PAGE) {
        setHasNextPage(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsNextPageLoading(false);
    }
  }, [user, isNextPageLoading, hasNextPage, buildQuery, filter, hashtagFilter]);

  const applyFilters = useCallback((postsToFilter: CommunityPost[], currentFilter: string, currentHashtagFilter: string | null) => {
    let filtered = [...postsToFilter];

    if (currentHashtagFilter) {
      filtered = filtered.filter(post => {
        const hashtags = extractHashtags(post.content);
        return hashtags.includes(currentHashtagFilter.toLowerCase());
      });
    }

    switch (currentFilter) {
      case 'trending':
        return filtered
          .filter(post => (post.trendingScore || 0) > 0)
          .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
      case 'popular':
        return filtered
          .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));
      case 'admin':
        return filtered.filter(post => post.isAdmin);
      default:
        return filtered.sort((a, b) => {
          const timeA = a.timestamp?.toDate()?.getTime() || 0;
          const timeB = b.timestamp?.toDate()?.getTime() || 0;
          return timeB - timeA;
        });
    }
  }, []);

  // Initial load and real-time updates for first page
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const initialQuery = buildQuery(true);
    
    const unsubscribe = onSnapshot(initialQuery, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => {
        const data = doc.data();
        const post = {
          id: doc.id,
          ...data,
          shareCount: data.shareCount || 0
        } as CommunityPost;

        post.engagementScore = calculateEngagementScore(post);
        post.trendingScore = calculateTrendingScore(post);

        return post;
      });

      const filteredPosts = applyFilters(newPosts, filter, hashtagFilter);
      
      setPosts(filteredPosts);
      setLoading(false);
      
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
      
      if (snapshot.docs.length < POSTS_PER_PAGE) {
        setHasNextPage(false);
      } else {
        setHasNextPage(true);
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user, filter, hashtagFilter, buildQuery, applyFilters]);

  // Load bookmarks
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

  const handleFilterChange = useCallback((newFilter: string) => {
    debouncedFilterChange(newFilter, hashtagFilter);
  }, [debouncedFilterChange, hashtagFilter]);

  const handleHashtagFilter = useCallback((hashtag: string | null) => {
    debouncedFilterChange(filter, hashtag);
  }, [debouncedFilterChange, filter]);

  return {
    posts,
    loading,
    hasNextPage,
    isNextPageLoading,
    bookmarkedPosts,
    filter,
    hashtagFilter,
    handleFilterChange,
    handleHashtagFilter,
    loadNextPage: throttledLoadMore
  };
};