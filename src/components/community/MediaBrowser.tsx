
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Download, Play, Image as ImageIcon, Video, Upload, FileImage, Smile, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { convertFileToBase64, getFileType, validateFileSize } from '@/lib/fileUtils';
import { useToast } from '@/lib/hooks/use-toast';
import { Keys } from '@/data/data';
import { Drawer } from '../ui/drawer';
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

const popularEmojis = [
  '😀', '😂', '🥰', '😍', '🤗', '🙏', '❤️', '💕', '👏', '🎉',
  '🔥', '💯', '✨', '🌟', '💪', '👍', '🙌', '💖', '🎊', '🎈',
  '🌈', '☀️', '🌸', '🦋', '🕊️', '🎵', '🎶', '📖', '✝️', '⛪'
];

const commonHashtags = [
  '#faith', '#blessed', '#prayer', '#testimony', '#worship', '#praise',
  '#bible', '#jesus', '#god', '#love', '#hope', '#peace', '#joy',
  '#inspiration', '#motivation', '#community', '#church', '#fellowship',
  '#grace', '#mercy', '#strength', '#healing', '#grateful', '#thankful'
];

const MediaBrowser = ({ isOpen, onClose, onSelectMedia, onSelectHashtag, onSelectEmoji }: MediaBrowserProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);

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
        title: 'File too large',
        description: 'Please select a file smaller than 10MB.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const base64 = await convertFileToBase64(file);
      const fileType = getFileType(file);
      onSelectMedia(base64, fileType === 'video' ? 'video' : 'image');
      onClose();
      toast({
        title: 'File uploaded',
        description: 'Your media has been added to the post.'
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to process the file. Please try again.',
        variant: 'destructive'
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

  useEffect(() => {
    if (isOpen && activeTab === 'images' && !searchQuery) {
      searchImages('inspiration faith');
    } else if (isOpen && activeTab === 'videos' && !searchQuery) {
      searchVideos('christian worship');
    }
  }, [isOpen, activeTab]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Slide up panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-50 max-h-[85vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-4">
              <h3 className="text-lg font-semibold dark:text-white">Add Media & More</h3>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="px-4 pb-4 overflow-y-auto max-h-[calc(85vh-100px)]">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
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

                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <FileImage className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Select an image or video from your device
                    </p>
                    <label className="cursor-pointer">
                      <Button variant="outline" disabled={loading}>
                        {loading ? 'Processing...' : 'Choose File'}
                      </Button>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={loading}
                      />
                    </label>
                    {loading && (
                      <div className="flex justify-center mt-4">
                        <div className="animate-spin h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full" />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search for images..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                      {loading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {images.map((image) => (
                        <motion.div
                          key={image.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative aspect-square cursor-pointer group"
                          onClick={() => handleImageSelect(image)}
                        >
                          <img
                            src={image.urls.small}
                            alt={image.alt_description}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Download className="h-6 w-6 text-white" />
                          </div>
                          <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {image.user.name}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="videos" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search for videos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                      {loading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {videos.map((video) => (
                        <motion.div
                          key={video.id.videoId}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => handleVideoSelect(video)}
                        >
                          <div className="relative">
                            <img
                              src={video.snippet.thumbnails.medium.url}
                              alt={video.snippet.title}
                              className="w-24 h-16 object-cover rounded"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="h-6 w-6 text-white drop-shadow-lg" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2 dark:text-white">{video.snippet.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">{video.snippet.channelTitle}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="emoji" className="space-y-4">
                  <div className="grid grid-cols-8 gap-3">
                    {popularEmojis.map((emoji, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="hashtags" className="space-y-4">
                  <div className="space-y-2">
                    {commonHashtags.map((hashtag, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="block w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-purple-600 dark:text-purple-400 font-medium"
                        onClick={() => handleHashtagSelect(hashtag)}
                      >
                        {hashtag}
                      </motion.button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MediaBrowser;
