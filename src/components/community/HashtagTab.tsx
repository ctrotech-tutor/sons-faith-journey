"use client";

import { TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import React from "react";

type HashtagTabProps = {
  commonHashtags: string[];
  handleHashtagSelect: (hashtag: string) => void;
};

const HashtagTab: React.FC<HashtagTabProps> = ({
  commonHashtags,
  handleHashtagSelect,
}) => {
  return (
    <TabsContent value="hashtags" className="pt-2 space-y-3">
      <div className="rounded-2xl backdrop-blur-md border border-white/10 bg-white/30 dark:bg-white/5 shadow-inner max-h-[250px] overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-purple-400 dark:scrollbar-thumb-purple-600 scrollbar-track-transparent">
        <div className="space-y-2">
          {commonHashtags.map((hashtag, index) => (
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
      </div>
    </TabsContent>
  );
};

export default HashtagTab;
