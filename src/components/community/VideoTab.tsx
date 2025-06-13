"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Search, Play } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

type Video = {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium: { url: string };
    };
  };
};

type VideoTabProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  loading: boolean;
  videos: Video[];
  handleVideoSelect: (video: Video) => void;
};

const VideoTab: React.FC<VideoTabProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  loading,
  videos,
  handleVideoSelect,
}) => {
  return (
    <TabsContent value="videos" className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2 items-center backdrop-blur-md bg-white/30 dark:bg-white/5 border border-white/10 p-2 rounded-xl shadow-sm">
        <Input
          className="flex-1 bg-transparent text-sm placeholder:text-purple-500 dark:placeholder:text-purple-300"
          placeholder="Search for faith videos, bible topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button
          onClick={handleSearch}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4"
        >
          {loading ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Loader or Videos */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 italic py-8">
          No videos found.
        </div>
      ) : (
        <div className="space-y-3 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400 dark:scrollbar-thumb-purple-600 scrollbar-track-transparent pr-1">
          {videos.map((video) => (
            <motion.div
              key={video.id.videoId}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex gap-3 p-3 border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-xl cursor-pointer hover:bg-white/50 dark:hover:bg-white/10 transition-all"
              onClick={() => handleVideoSelect(video)}
            >
              {/* Thumbnail */}
              <div className="relative rounded overflow-hidden w-28 h-16">
                <img
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="h-5 w-5 text-white drop-shadow" />
                </div>
              </div>

              {/* Video Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm md:text-base text-black dark:text-white line-clamp-2">
                  {video.snippet.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                  {video.snippet.channelTitle}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </TabsContent>
  );
};

export default VideoTab;
