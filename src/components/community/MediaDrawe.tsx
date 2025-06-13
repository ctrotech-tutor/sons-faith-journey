"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, ImageIcon, Video, Smile, Hash, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import {UploadTab} from "./UploadTab";
import ImageTab from "./ImageTab";
import VideoTab from "./VideoTab";
import EmojiTab from "./EmojiTab";
import HashtagTab from "./HashtagTab";

import React, { useState } from "react";

type MediaDrawerProps = {
  open: boolean;
  setOpen: (open: boolean) => void;

  // Upload
  loading: boolean;
  selectedPreview: string | null;
  selectedType: string;
  handleFileUpload: (file: File) => void;

  // Image
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  images: any[];
  handleSearch: () => void;
  handleImageSelect: (image: any) => void;

  // Video
  videos: any[];
  handleVideoSelect: (video: any) => void;

  // Emoji
  popularEmojis: string[];
  scrollToCategory: (index: number) => void;
  handleEmojiSelect: (emoji: string) => void;

  // Hashtag
  commonHashtags: string[];
  handleHashtagSelect: (tag: string) => void;
};

const MediaDrawer: React.FC<MediaDrawerProps> = ({
  open,
  setOpen,
  loading,
  selectedPreview,
  selectedType,
  handleFileUpload,

  searchQuery,
  setSearchQuery,
  images,
  handleSearch,
  handleImageSelect,

  videos,
  handleVideoSelect,

  popularEmojis,
  scrollToCategory,
  handleEmojiSelect,

  commonHashtags,
  handleHashtagSelect,
}) => {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="rounded-t-3xl max-h-[85vh] overflow-hidden pb-4">
        <DrawerHeader className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold">Add Media & More</DrawerTitle>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="px-4 overflow-y-auto max-h-[calc(85vh-100px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full overflow-x-auto no-scrollbar mb-2">
              <TabsTrigger value="upload" className="flex items-center gap-1 text-xs">
                <Upload className="h-3 w-3" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-1 text-xs">
                <ImageIcon className="h-3 w-3" />
                Images
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-1 text-xs">
                <Video className="h-3 w-3" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="emoji" className="flex items-center gap-1 text-xs">
                <Smile className="h-3 w-3" />
                Emoji
              </TabsTrigger>
              <TabsTrigger value="hashtags" className="flex items-center gap-1 text-xs">
                <Hash className="h-3 w-3" />
                Tags
              </TabsTrigger>
            </TabsList>

            {/* Content per tab */}
            <UploadTab
              loading={loading}
              handleFileUpload={handleFileUpload}
              selectedPreview={selectedPreview}
              selectedType={selectedType}
            />
            <ImageTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
              loading={loading}
              images={images}
              handleImageSelect={handleImageSelect}
            />
            <VideoTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
              loading={loading}
              videos={videos}
              handleVideoSelect={handleVideoSelect}
            />
            <EmojiTab
              popularEmojis={popularEmojis}
              scrollToCategory={scrollToCategory}
              handleEmojiSelect={handleEmojiSelect}
            />
            <HashtagTab
              commonHashtags={commonHashtags}
              handleHashtagSelect={handleHashtagSelect}
            />
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MediaDrawer;
