"use client";

import { TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import React from "react";

type HashtagTabProps = {
  dynamicHashtags: string[];
  loadingHashtags: boolean;
  handleHashtagSelect: (hashtag: string) => void;
};

const HashtagTab: React.FC<HashtagTabProps> = ({
  dynamicHashtags,
  loadingHashtags,
  handleHashtagSelect,
}) => {
  return (
    <TabsContent value="hashtags" className="pt-2 space-y-3">
      <div className="rounded-2xl backdrop-blur-md border border-white/10 bg-white/30 dark:bg-white/5 shadow-inner max-h-[250px] overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-purple-400 dark:scrollbar-thumb-purple-600 scrollbar-track-transparent">
        {loadingHashtags ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full" />
            <span className="ml-2 text-sm text-purple-600 dark:text-purple-300">Generating smart hashtags...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {dynamicHashtags.map((hashtag, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                className="block w-full text-left p-2 px-3 rounded-xl text-sm md:text-base font-semibold text-purple-700 dark:text-purple-300 hover:bg-white/20 dark:hover:bg-white/10 transition-all"
                onClick={() => handleHashtagSelect(hashtag)}
              >
                {hashtag}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </TabsContent>
  );
};

export default HashtagTab;
