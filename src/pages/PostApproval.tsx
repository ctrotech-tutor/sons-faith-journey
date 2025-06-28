import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  where,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Check,
  X,
  Eye,
  Clock,
  User,
  Calendar,
  Image,
  Video,
  ArrowLeft,
  MessageCircle,
  Heart,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/lib/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface PendingPost {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  timestamp: any;
  status: "pending" | "approved" | "rejected";
  isAdmin: boolean;
  likes: string[];
  likeCount: number;
  comments: any[];
  commentCount: number;
  shareCount?: number;
}

const PostApproval = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (user && userProfile && !userProfile.isAdmin) {
      navigate("/community");
      toast({
        title: "Access Denied",
        description: "Only admins can access post approval.",
        variant: "destructive",
      });
    }
  }, [user, userProfile, navigate, toast]);

  // Real-time pending posts listener
  useEffect(() => {
    if (!user || !userProfile?.isAdmin) return;

    const postsQuery = query(
      collection(db, "communityPosts"),
      where("status", "==", "pending"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        likes: doc.data().likes || [],
        likeCount: doc.data().likeCount || 0,
        comments: doc.data().comments || [],
        commentCount: doc.data().commentCount || 0,
        shareCount: doc.data().shareCount || 0,
      })) as PendingPost[];

      setPendingPosts(newPosts);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, userProfile]);

  const approvePost = async (postId: string) => {
    try {
      await updateDoc(doc(db, "communityPosts", postId), {
        status: "approved",
        approvedBy: user?.uid,
        approvedAt: new Date(),
      });

      // Send notification to post author
      const post = pendingPosts.find((p) => p.id === postId);
      if (post) {
        await addDoc(collection(db, "notifications"), {
          userId: post.authorId,
          type: "post_approved",
          title: "Post Approved",
          message:
            "Your post has been approved and is now visible to the community.",
          postId: postId,
          timestamp: new Date(),
          read: false,
        });
      }

      toast({
        title: "Post Approved",
        description:
          "The post has been approved and is now visible to the community.",
      });
    } catch (error) {
      console.error("Error approving post:", error);
      toast({
        title: "Error",
        description: "Failed to approve post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const rejectPost = async (postId: string) => {
    try {
      await updateDoc(doc(db, "communityPosts", postId), {
        status: "rejected",
        rejectedBy: user?.uid,
        rejectedAt: new Date(),
      });

      // Send notification to post author
      const post = pendingPosts.find((p) => p.id === postId);
      if (post) {
        await addDoc(collection(db, "notifications"), {
          userId: post.authorId,
          type: "post_rejected",
          title: "Post Rejected",
          message:
            "Your post did not meet our community guidelines and has been rejected.",
          postId: postId,
          timestamp: new Date(),
          read: false,
        });
      }

      toast({
        title: "Post Rejected",
        description: "The post has been rejected and author has been notified.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error rejecting post:", error);
      toast({
        title: "Error",
        description: "Failed to reject post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await deleteDoc(doc(db, "communityPosts", postId));

      toast({
        title: "Post Deleted",
        description: "The post has been permanently deleted.",
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!userProfile?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/60 border-b border-white/20 dark:border-white/10 shadow-sm"
      >
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (window.history.length > 2) {
                    navigate(-1);
                  } else {
                    navigate("/dashboard");
                  }
                }}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 via-purple-700 to-fuchsia-600 bg-clip-text text-transparent">
                Post Approval
              </h1>
            </div>
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
            >
              {pendingPosts.length} Pending
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Posts List */}
      <div className="pt-20 pb-20">
        <div className="max-w-md mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full" />
            </div>
          ) : pendingPosts.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                All Caught Up!
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                No posts pending approval at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {pendingPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="rounded-none border-x-0 border-t-0 last:border-b-0 shadow-none dark:bg-gray-900/60 dark:border-gray-700 transition-colors bg-purple-50/50 border-l-4 border-l-purple-400">
                    {/* Post Header */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8 ring-1 ring-gray-300 dark:ring-gray-600">
                          <AvatarFallback className="text-xs dark:text-gray-300">
                            {post.authorName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-sm dark:text-white">
                              {post.authorName}
                            </p>
                            <Badge className="bg-orange-200 text-orange-900 dark:bg-orange-400/20 dark:text-orange-300 text-xs px-2 py-0">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {post.timestamp?.toDate?.()?.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Media */}
                    {post.mediaUrl && (
                      <div className="w-full bg-black/5 dark:bg-white/5">
                        {post.mediaType === "image" ? (
                          <img
                            src={post.mediaUrl}
                            alt="Post"
                            className="w-full aspect-square object-cover"
                          />
                        ) : (
                          <video
                            src={post.mediaUrl}
                            controls
                            className="w-full aspect-square object-cover"
                          />
                        )}
                      </div>
                    )}

                    {/* Post Content */}
                    <div className="px-4 py-3 space-y-3">
                      {/* Post Text */}
                      <p className="text-sm dark:text-gray-200 break-all">
                        <span className="font-semibold">{post.authorName}</span>{" "}
                        {post.content}
                      </p>

                      {/* Post Stats Preview */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>{post.likeCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{post.commentCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Share2 className="h-3 w-3" />
                          <span>{post.shareCount || 0}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 pt-2">
                        <Button
                          onClick={() => approvePost(post.id)}
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => rejectPost(post.id)}
                          size="sm"
                          variant="destructive"
                          className="flex-1 shadow-sm"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => deletePost(post.id)}
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostApproval;
