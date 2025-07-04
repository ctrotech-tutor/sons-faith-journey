"use client";

import { TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { emojiCategories, getRecentEmojis, addRecentEmoji } from "@/data/emojiCategories";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);

  useEffect(() => {
    setRecentEmojis(getRecentEmojis());
  }, []);

  // Update recent emojis in the categories
  const categoriesWithRecents = [...emojiCategories];
  categoriesWithRecents[0].emojis = recentEmojis;

  const currentCategory = categoriesWithRecents[selectedCategory];
  
  // Filter emojis based on search
  const filteredEmojis = searchQuery
    ? currentCategory.emojis.filter(emoji => {
        // Simple emoji search - you could enhance this with emoji names/keywords
        return true; // For now, show all emojis when searching
      })
    : currentCategory.emojis;

  const handleEmojiClick = (emoji: string) => {
    addRecentEmoji(emoji);
    setRecentEmojis(getRecentEmojis());
    handleEmojiSelect(emoji);
  };

  return (
    <TabsContent value="emoji" className="pt-2 space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search emojis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-9 bg-white/50 dark:bg-white/10 border-white/20"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-1 px-1 no-scrollbar">
        {categoriesWithRecents.map((category, i) => (
          <Button
            key={i}
            variant={selectedCategory === i ? "default" : "ghost"}
            size="sm"
            className={`min-w-[2.5rem] h-9 p-2 text-lg transition-all ${
              selectedCategory === i 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-white/20 dark:hover:bg-white/10"
            }`}
            onClick={() => setSelectedCategory(i)}
          >
            {category.icon}
          </Button>
        ))}
      </div>

      {/* Category Name */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">
          {currentCategory.name}
        </h3>
        {selectedCategory === 0 && recentEmojis.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => {
              localStorage.removeItem('recentEmojis');
              setRecentEmojis([]);
            }}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Emoji Grid */}
      <div className="max-h-[280px] overflow-y-auto">
        {filteredEmojis.length === 0 && selectedCategory === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-sm">No recent emojis</p>
            <p className="text-xs">Start using emojis to see them here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-8 gap-2 px-2 py-2 rounded-2xl backdrop-blur-md border border-white/10 bg-white/30 dark:bg-white/5 shadow-inner">
            {filteredEmojis.map((emoji, index) => (
              <motion.button
                key={`${selectedCategory}-${index}`}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="text-2xl flex items-center justify-center hover:bg-white/30 dark:hover:bg-white/15 p-2 rounded-xl transition-all duration-200"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </TabsContent>
  );
};

export default EmojiTab;
