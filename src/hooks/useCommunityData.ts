
import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, where, getDocs, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { extractHashtags } from '@/lib/postUtils';

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

export const useCommunityData = (user: any, userProfile: any) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

  const loadInitialPosts = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const postsQuery = query(
        collection(db, 'communityPosts'),
        where('status', '==', 'approved'),
        orderBy('timestamp', 'desc'),
        limit(POSTS_PER_PAGE)
      );

      const snapshot = await getDocs(postsQuery);
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

      setPosts(newPosts);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasNextPage(snapshot.docs.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error loading initial posts:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadNextPage = useCallback(async () => {
    if (!user || !hasNextPage || isNextPageLoading || !lastDoc) return;

    setIsNextPageLoading(true);
    try {
      const postsQuery = query(
        collection(db, 'communityPosts'),
        where('status', '==', 'approved'),
        orderBy('timestamp', 'desc'),
        startAfter(lastDoc),
        limit(POSTS_PER_PAGE)
      );

      const snapshot = await getDocs(postsQuery);
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

      setPosts(prev => [...prev, ...newPosts]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasNextPage(snapshot.docs.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error loading next page:', error);
    } finally {
      setIsNextPageLoading(false);
    }
  }, [user, hasNextPage, isNextPageLoading, lastDoc]);

  useEffect(() => {
    loadInitialPosts();
  }, [loadInitialPosts]);

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

  const getFilteredPosts = (filter: string, hashtagFilter: string | null) => {
    let approvedPosts = posts.filter(post => post.status === 'approved');

    if (hashtagFilter) {
      approvedPosts = approvedPosts.filter(post => {
        const hashtags = extractHashtags(post.content);
        return hashtags.includes(hashtagFilter.toLowerCase());
      });
    }

    switch (filter) {
      case 'trending':
        return approvedPosts
          .filter(post => (post.trendingScore || 0) > 0)
          .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
      case 'popular':
        return approvedPosts
          .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));
      case 'admin':
        return approvedPosts.filter(post => post.isAdmin);
      default:
        return approvedPosts.sort((a, b) => {
          const timeA = a.timestamp?.toDate()?.getTime() || 0;
          const timeB = b.timestamp?.toDate()?.getTime() || 0;
          return timeB - timeA;
        });
    }
  };

  return {
    posts,
    loading,
    unreadCount,
    bookmarkedPosts,
    hasNextPage,
    isNextPageLoading,
    loadNextPage,
    getFilteredPosts
  };
};
