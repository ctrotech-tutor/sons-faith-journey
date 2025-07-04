import { useState, useEffect } from 'react';
import { Search, X, Download, Play, Image as ImageIcon, Video, Upload, FileImage, Smile, Hash, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { getFileType, validateFileSize } from '@/lib/fileUtils';
import { useToast } from '@/lib/hooks/use-toast';
import { Keys, hashtags, emojis } from '@/data/data';
import LazyVideo from '../LazyVideo';
import LazyImage from '../LazyImage';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { UploadTab } from './UploadTab';
import ImageTab from './ImageTab';
import VideoTab from './VideoTab';
import HashtagTab from './HashtagTab';
import EmojiTab from './EmojiTab';
import { cn } from '@/lib/utils';
import { geminiService } from '@/lib/gemini';
import { useAuth } from '@/lib/hooks/useAuth';

interface MediaBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (url: string, type: 'image' | 'video') => void;
  onSelectHashtag?: (hashtag: string) => void;
  onSelectEmoji?: (emoji: string) => void;
}

interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
}

interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    channelTitle: string;
  };
}

const UNSPLASH_ACCESS_KEY = Keys.UNSPLASH_ACCESS_KEY;
const YOUTUBE_API_KEY = Keys.YOUTUBE_API_KEY;

const popularEmojis = emojis;
const commonHashtags = hashtags;

const MediaBrowser = ({ isOpen, onClose, onSelectMedia, onSelectHashtag, onSelectEmoji }: MediaBrowserProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"image" | "video" | null>(null);
  
  // ML-powered states
  const [dynamicHashtags, setDynamicHashtags] = useState<string[]>([]);
  const [hashtagsLoading, setHashtagsLoading] = useState(false);
  const [smartKeywords, setSmartKeywords] = useState<{ image: string[], video: string[] }>({
    image: [],
    video: []
  });

  const searchImages = async (query: string) => {
    if (!query.trim()) return;

    if (!UNSPLASH_ACCESS_KEY) {
      console.error('UNSPLASH_ACCESS_KEY is missing or undefined.');
      toast({
        title: 'Configuration Error',
        description: 'Unsplash API key is missing. Please check your environment setup.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=20&orientation=landscape`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid response format from Unsplash API.');
      }

      if (data.results.length === 0) {
        toast({
          title: 'No Results',
          description: 'No images found for your search query.',
        });
      }

      setImages(data.results);
    } catch (error) {
      console.error('Error searching images:', (error as Error).message || error);

      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to search images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const searchVideos = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=20&key=${YOUTUBE_API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setVideos(data.items || []);

      if (data.items.length === 0) {
        toast({
          title: 'No Results',
          description: 'No videos found for your search query.',
        });
      }
    } catch (error) {
      console.error('Error searching videos:', error);
      toast({
        title: 'Error',
        description: 'Failed to search videos. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (activeTab === 'images') {
      searchImages(searchQuery);
    } else if (activeTab === 'videos') {
      searchVideos(searchQuery);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFileSize(file, 10)) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    const fileType = getFileType(file);
    const previewUrl = URL.createObjectURL(file);
    setSelectedPreview(previewUrl);
    if (fileType === "image" || fileType === "video") {
      setSelectedType(fileType);
    } else {
      setSelectedType(null);
    }

    try {
      setLoading(true);
      const url = await uploadToCloudinary(file);
      onSelectMedia(url, fileType === "video" ? "video" : "image");
      onClose();
      toast({
        title: "File uploaded",
        description: "Your media has been added to the post."
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "Failed to process the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (image: UnsplashImage) => {
    onSelectMedia(image.urls.regular, 'image');
    onClose();
    toast({
      title: 'Image selected',
      description: 'Image has been added to your post.'
    });
  };

  const handleVideoSelect = (video: YouTubeVideo) => {
    const embedUrl = `https://www.youtube.com/embed/${video.id.videoId}`;
    onSelectMedia(embedUrl, 'video');
    onClose();
    toast({
      title: 'Video selected',
      description: 'Video has been added to your post.'
    });
  };

  const handleEmojiSelect = (emoji: string) => {
    if (onSelectEmoji) {
      onSelectEmoji(emoji);
    }
    toast({
      title: 'Emoji added',
      description: 'Emoji has been added to your post.'
    });
  };

  const handleHashtagSelect = (hashtag: string) => {
    if (onSelectHashtag) {
      onSelectHashtag(hashtag);
    }
    toast({
      title: 'Hashtag added',
      description: 'Hashtag has been added to your post.'
    });
  };

  // ML-powered functions
  const generateDynamicHashtags = async () => {
    if (hashtagsLoading) return;
    
    setHashtagsLoading(true);
    try {
      const context = {
        userInterests: user ? ['faith', 'community', 'worship'] : [],
        recentTopics: ['prayer', 'devotion', 'scripture'],
        seasonalContext: new Date().getMonth() === 11 ? 'Christmas' : 'General'
      };
      
      const hashtags = await geminiService.generateTrendingHashtags(context);
      setDynamicHashtags(hashtags);
    } catch (error) {
      console.error('Error generating hashtags:', error);
      // Fall back to static hashtags
      setDynamicHashtags(commonHashtags);
    } finally {
      setHashtagsLoading(false);
    }
  };

  const generateSmartKeywords = async () => {
    try {
      const context = {
        userInterests: user ? ['christian', 'inspiration', 'faith'] : [],
        currentSeason: new Date().getMonth() === 11 ? 'Christmas' : 'General',
        recentActivity: ['worship', 'prayer', 'community']
      };

      const [imageKeywords, videoKeywords] = await Promise.all([
        geminiService.generateSearchKeywords('image', context),
        geminiService.generateSearchKeywords('video', context)
      ]);

      setSmartKeywords({
        image: imageKeywords,
        video: videoKeywords
      });
    } catch (error) {
      console.error('Error generating smart keywords:', error);
      // Use fallback keywords
      setSmartKeywords({
        image: ['faith inspiration', 'christian art', 'biblical landscape', 'prayer'],
        video: ['christian worship', 'praise music', 'sermon', 'gospel']
      });
    }
  };

  const getRandomSmartKeyword = (type: 'image' | 'video'): string => {
    const keywords = smartKeywords[type];
    if (keywords.length === 0) {
      return type === 'image' ? 'inspiration faith' : 'christian worship';
    }
    return keywords[Math.floor(Math.random() * keywords.length)];
  };

  useEffect(() => {
    if (isOpen) {
      // Generate smart keywords when drawer opens
      generateSmartKeywords();
      
      // Generate default content based on active tab
      if (activeTab === 'images' && !searchQuery) {
        if (smartKeywords.image.length > 0) {
          searchImages(getRandomSmartKeyword('image'));
        } else {
          searchImages('inspiration faith');
        }
      } else if (activeTab === 'videos' && !searchQuery) {
        if (smartKeywords.video.length > 0) {
          searchVideos(getRandomSmartKeyword('video'));
        } else {
          searchVideos('christian worship');
        }
      } else if (activeTab === 'hashtags' && dynamicHashtags.length === 0) {
        generateDynamicHashtags();
      }
    }
  }, [isOpen, activeTab, smartKeywords]);

  // Generate hashtags when hashtag tab is accessed
  useEffect(() => {
    if (activeTab === 'hashtags' && dynamicHashtags.length === 0 && !hashtagsLoading) {
      generateDynamicHashtags();
    }
  }, [activeTab]);

  function scrollToCategory(i: number): void {
    const grid = document.querySelector('.grid.grid-cols-8');
    if (grid) {
      const emojisPerCategory = 12;
      const targetIndex = i * emojisPerCategory;
      const emojiButtons = grid.querySelectorAll('button');
      if (emojiButtons[targetIndex]) {
        (emojiButtons[targetIndex] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="rounded-t-3xl max-h-[85vh] overflow-hidden">
        <DrawerHeader className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold">Add Media & More</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto max-h-[calc(85vh-100px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full overflow-x-auto no-scrollbar">
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
              dynamicHashtags={dynamicHashtags.length > 0 ? dynamicHashtags : commonHashtags}
              loadingHashtags={hashtagsLoading}
              handleHashtagSelect={handleHashtagSelect}
            />
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MediaBrowser;
