import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Bookmark, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/hooks/useAuth";

interface CommunityHeaderProps {
  hashtagFilter: string | null;
  clearHashtagFilter: () => void;
}

const CommunityHeader = ({
  hashtagFilter,
  clearHashtagFilter,
}: CommunityHeaderProps) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 left-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/60 border-b border-white/20 dark:border-white/10 shadow-sm"
    >
      <div className="max-w-md mx-auto px-4 py-3">
        {/* Logo + Action Buttons */}
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
              The Son Hub
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {userProfile?.isAdmin && (
              <Button
                size="sm"
                onClick={() => navigate("/post-approval")}
                variant="outline"
                className="flex items-center gap-1 text-xs"
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => navigate("/bookmarks")}
              variant="outline"
              className="flex items-center gap-1 text-xs"
            >
              <Bookmark className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/create-post")}
              className="flex items-center gap-2 text-white bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-semibold hidden sm:block">
                Post
              </span>
            </Button>
          </div>
        </div>

        {/* Hashtag Filter */}
        {hashtagFilter && (
          <div className="mt-2 flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              {hashtagFilter}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearHashtagFilter}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CommunityHeader;
