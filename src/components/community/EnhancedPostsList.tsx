import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Bookmark,
  BookmarkCheck,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Eye,
  TrendingUp,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import LazyImage from "@/components/LazyImage";
import LazyVideo from "@/components/LazyVideo";
import PostSkeleton from "./PostSkeleton";
import { formatPostContent } from "@/lib/postUtils";
import { useAuth } from "@/lib/hooks/useAuth";
import { useActivitySync } from "@/lib/hooks/useActivitySync";

interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  likes: string[];
  likeCount: number;
  comments: Comment[];
  commentCount: number;
  shareCount: number;
  viewCount?: number;
  status: "approved" | "pending" | "rejected";
  timestamp: any;
  isAdmin: boolean;
  engagementScore?: number;
  trendingScore?: number;
  hashtags?: string[];
  location?: string;
  isSponsored?: boolean;
  isPinned?: boolean;
}

interface EnhancedPostsListProps {
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

const EnhancedPostsList = ({
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
}: EnhancedPostsListProps) => {
  const { user, userProfile } = useAuth();
  const { trackEngagement } = useActivitySync();
  const navigate = useNavigate();
  const [viewedPosts, setViewedPosts] = useState<Set<string>>(new Set());
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Track post views
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postId = entry.target.getAttribute("data-post-id");
            if (postId && !viewedPosts.has(postId)) {
              setViewedPosts((prev) => new Set(prev).add(postId));
              trackEngagement("page_view", {
                type: "post_view",
                postId,
                filter,
                timestamp: Date.now(),
              });
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [viewedPosts, trackEngagement, filter]);

  const handlePostClick = (postId: string, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest('[role="button"]')
    ) {
      return;
    }

    trackEngagement("page_view", {
      type: "post_detail_view",
      postId,
      source: "post_click",
    });

    navigate(`/community/post/${postId}`);
  };

  const handleLikeWithTracking = (postId: string) => {
    onHandleLike(postId);
    trackEngagement("post_like", { postId, timestamp: Date.now() });
  };

  const handleShareWithTracking = (postId: string) => {
    onSharePost(postId);
    trackEngagement("post_share", { postId, timestamp: Date.now() });
  };

  const handleCommentWithTracking = (postId: string) => {
    onOpenCommentsModal(postId);
    trackEngagement("post_comment", { postId, action: "open_comments" });
  };

  const toggleVideoPlay = (postId: string) => {
    setPlayingVideos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const formatEngagementStats = (post: CommunityPost) => {
    const stats = [];
    if (post.likeCount > 0) stats.push(`${post.likeCount} likes`);
    if (post.commentCount > 0) stats.push(`${post.commentCount} comments`);
    if (post.shareCount > 0) stats.push(`${post.shareCount} shares`);
    if (post.viewCount && post.viewCount > 0)
      stats.push(`${post.viewCount} views`);
    return stats.join(" • ");
  };

  const getPostPriorityBadge = (post: CommunityPost) => {
    if (post.isPinned) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          📌 Pinned
        </Badge>
      );
    }
    if (post.isSponsored) {
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          Sponsored
        </Badge>
      );
    }
    if (
      filter === "trending" &&
      post.trendingScore &&
      post.trendingScore > 15
    ) {
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
          🔥 Trending
        </Badge>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-0">
        {[...Array(5)].map((_, i) => (
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
          {hashtagFilter
            ? `No posts with ${hashtagFilter}`
            : filter === "trending"
            ? "No Trending Posts"
            : filter === "popular"
            ? "No Popular Posts Yet"
            : filter === "admin"
            ? "No Leader Posts"
            : "Start the Conversation"}
        </h3>
        <p className="text-gray-500 dark:text-gray-500 mb-6">
          {hashtagFilter
            ? "Try a different hashtag or create a post with this tag!"
            : filter === "trending"
            ? "Posts will appear here when they gain traction!"
            : filter === "popular"
            ? "Posts will appear here based on engagement!"
            : filter === "admin"
            ? "Leaders haven't posted yet!"
            : "Be the first to share something meaningful with the community!"}
        </p>
        <Button
          onClick={() => navigate("/create-post")}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
          transition={{ delay: index * 0.03 }}
          data-post-id={post.id}
          ref={(el) => {
            if (el && observerRef.current) {
              observerRef.current.observe(el);
            }
          }}
          onClick={(e) => handlePostClick(post.id, e)}
          className="cursor-pointer group"
        >
          <Card className="rounded-none border-x-0 border-t-0 last:border-b-0 shadow-none dark:bg-gray-900/60 dark:border-gray-700 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/80 hover:shadow-sm">
            {/* Enhanced Post Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-10 w-10 ring-2 ring-gray-200 dark:ring-gray-700">
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

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-semibold text-sm dark:text-white">
                      {post.authorName}
                    </p>
                    {post.isAdmin && (
                      <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-2 py-0.5">
                        Leader
                      </Badge>
                    )}
                    {getPostPriorityBadge(post)}
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {post.timestamp?.toDate?.()?.toLocaleDateString()}
                    </span>
                    {post.location && (
                      <>
                        <span>•</span>
                        <span>{post.location}</span>
                      </>
                    )}
                    {userProfile?.isAdmin && post.engagementScore && (
                      <>
                        <span>•</span>
                        <span className="text-purple-600">
                          E: {post.engagementScore.toFixed(1)}
                        </span>
                      </>
                    )}
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

            {/* Enhanced Media Display */}
            {post.mediaUrl && (
              <div className="relative w-full bg-black/5 dark:bg-white/5">
                {post.mediaType === "image" ? (
                  <LazyImage
                    src={post.mediaUrl}
                    alt="Post media"
                    className="w-full aspect-square object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="relative">
                    <LazyVideo
                      src={post.mediaUrl}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="lg"
                        className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVideoPlay(post.id);
                        }}
                      >
                        {playingVideos.has(post.id) ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Post Actions */}
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikeWithTracking(post.id);
                    }}
                    className="flex items-center space-x-1 group"
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={{
                        scale: likeAnimations[post.id] ? [1, 1.3, 1] : 1,
                      }}
                      transition={{
                        duration: 0.3,
                        type: "spring",
                        stiffness: 300,
                      }}
                    >
                      <Heart
                        className={`h-6 w-6 transition-all duration-300 ${
                          post.likes.includes(user?.uid || "")
                            ? "fill-red-500 text-red-500"
                            : "text-gray-700 dark:text-gray-300 group-hover:text-red-500"
                        }`}
                      />
                    </motion.div>
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
                      handleCommentWithTracking(post.id);
                    }}
                  >
                    <MessageCircle className="h-6 w-6 mr-1" />
                    {post.commentCount > 0 && (
                      <span className="text-sm font-medium">
                        {post.commentCount}
                      </span>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-gray-700 dark:text-gray-300 hover:text-green-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareWithTracking(post.id);
                    }}
                  >
                    <Share2 className="h-6 w-6 mr-1" />
                    {post.shareCount > 0 && (
                      <span className="text-sm font-medium">
                        {post.shareCount}
                      </span>
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
                    onToggleBookmark(post.id);
                  }}
                  className="h-8 w-8 p-0 group"
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={{
                      scale: bookmarkAnimations[post.id] ? [1, 1.2, 1] : 1,
                    }}
                    transition={{
                      duration: 0.3,
                      type: "spring",
                      stiffness: 300,
                    }}
                  >
                    {bookmarkedPosts.has(post.id) ? (
                      <BookmarkCheck className="h-6 w-6 text-purple-600 fill-purple-600" />
                    ) : (
                      <Bookmark className="h-6 w-6 text-gray-700 dark:text-gray-300 group-hover:text-purple-600" />
                    )}
                  </motion.div>
                </motion.button>
              </div>

              {/* Engagement Stats */}
              {formatEngagementStats(post) && (
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {formatEngagementStats(post)}
                </p>
              )}

              {/* Enhanced Post Content */}
              <motion.div layout className="space-y-2">
                <p className="text-sm dark:text-gray-200 leading-relaxed">
                  <span className="font-semibold">{post.authorName}</span>{" "}
                  {expandedPosts[post.id] || post.content.length <= 200 ? (
                    <span>
                      {formatPostContent(post.content, onHashtagClick)}
                    </span>
                  ) : (
                    <>
                      <span>
                        {formatPostContent(
                          post.content.slice(0, 200),
                          onHashtagClick
                        )}
                        ...
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleExpanded(post.id);
                        }}
                        className="text-blue-500 font-medium ml-1 hover:underline dark:text-blue-400"
                      >
                        more
                      </button>
                    </>
                  )}
                  {post.content.length > 200 && expandedPosts[post.id] && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpanded(post.id);
                      }}
                      className="text-blue-500 font-medium ml-1 hover:underline dark:text-blue-400"
                    >
                      less
                    </button>
                  )}
                </p>

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.hashtags.map((hashtag, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          onHashtagClick(hashtag);
                        }}
                        className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                      >
                        {hashtag}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* View Comments */}
              {post.commentCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 dark:text-gray-400 p-0 h-auto text-sm hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCommentWithTracking(post.id);
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

export default EnhancedPostsList;
