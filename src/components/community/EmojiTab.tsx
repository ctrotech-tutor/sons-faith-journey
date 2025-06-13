"use client";

import { TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import React from "react";

type EmojiTabProps = {
  popularEmojis: string[];
  scrollToCategory: (index: number) => void;
  handleEmojiSelect: (emoji: string) => void;
};

const EmojiTab: React.FC<EmojiTabProps> = ({
  popularEmojis,
  scrollToCategory,
  handleEmojiSelect,
}) => {
  return (
    <TabsContent value="emoji" className="pt-2 space-y-2">
      {/* Optional: Emoji categories */}
      <div className="flex overflow-x-auto gap-2 px-2 no-scrollbar">
        {["😀", "🔥", "🙏", "🎉", "💖", "✝️", "🌟"].map((categoryEmoji, i) => (
          <button
            key={i}
            className="text-xl p-2 rounded-xl hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur border border-white/10 transition"
            onClick={() => scrollToCategory(i)}
          >
            {categoryEmoji}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-8 gap-3 max-h-[300px] overflow-y-auto px-2 py-4 rounded-2xl backdrop-blur-md border border-white/10 bg-white/30 dark:bg-white/5 shadow-inner scrollbar-thin scrollbar-thumb-purple-400 dark:scrollbar-thumb-purple-700 scrollbar-track-transparent">
        {popularEmojis.map((emoji, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="text-2xl flex items-center justify-center hover:bg-white/20 dark:hover:bg-white/10 p-2 rounded-xl transition-colors"
            onClick={() => handleEmojiSelect(emoji)}
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </TabsContent>
  );
};

export default EmojiTab;
