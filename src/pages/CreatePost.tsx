
import { useState } from 'react';
import { motion } from 'framer-motion';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/lib/hooks/use-toast';
import { ArrowLeft, Send, Image, Video, X, Hash, Smile } from 'lucide-react';
import MediaBrowser from '@/components/community/MediaBrowser';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const CreatePost = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [loading, setLoading] = useState(false);
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || !user || !userProfile) return;

    setLoading(true);
    try {
      const postData = {
        authorId: user.uid,
        authorName: userProfile.displayName || user.email?.split('@')[0] || 'Anonymous',
        authorAvatar: userProfile.profilePhoto || './assets/default.png',
        content: content.trim(),
        mediaUrl: mediaUrl || null,
        mediaType: mediaUrl ? mediaType : null,
        likes: [],
        likeCount: 0,
        comments: [],
        commentCount: 0,
        shareCount: 0,
        status: userProfile.isAdmin ? 'approved' : 'pending',
        timestamp: new Date(),
        isAdmin: userProfile.isAdmin || false
      };

      await addDoc(collection(db, 'communityPosts'), postData);
      
      toast({
        title: userProfile.isAdmin ? 'Post Published' : 'Post Submitted',
        description: userProfile.isAdmin 
          ? 'Your post is now live in the community.'
          : 'Your post has been submitted for admin approval.'
      });

      navigate('/community');
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMediaSelect = (url: string, type: 'image' | 'video') => {
    setMediaUrl(url);
    setMediaType(type);
  };

  const handleEmojiSelect = (emoji: string) => {
    setContent(prev => prev + emoji);
  };

  const handleHashtagSelect = (hashtag: string) => {
    setContent(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + hashtag + ' ');
  };

  const removeMedia = () => {
    setMediaUrl('');
    setMediaType('image');
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 w-full z-40 backdrop-blur-md bg-white/70 dark:bg-gray-900/60 border-b border-white/20 dark:border-white/10 shadow-sm"
      >
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/community')}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 via-purple-700 to-fuchsia-600 bg-clip-text text-transparent">
                Create Post
              </h1>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700/90 text-white"
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  {userProfile?.isAdmin ? 'Publish' : 'Submit'}
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="pt-20 pb-20">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900/60 border-0 shadow-none"
          >
            {/* User Info */}
            <div className="flex items-center space-x-3 px-4 pt-4 pb-2">
              <Avatar className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center text-white font-semibold">
                {/* {(userProfile?.displayName || user.email || 'U').charAt(0).toUpperCase()} */}
                <AvatarImage
                    src={userProfile?.profilePhoto || '/default-avatar.png'}
                    alt={userProfile?.displayName || 'User Avatar'}
                  />
                  <AvatarFallback>
                    {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm dark:text-white">
                  {userProfile?.displayName || user.email?.split('@')[0] || 'Anonymous'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userProfile?.isAdmin ? 'Admin • Will be published immediately' : 'Pending admin approval'}
                </p>
              </div>
            </div>

            {/* Content Input */}
            <div className="px-4 pb-3">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your heart? Share your thoughts, testimonies, prayer requests, or encouragement... #blessed #faith"
                className="border-0 resize-none focus:ring-0 p-0 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-transparent"
                rows={6}
                maxLength={2000}
              />
              
              {/* Character count */}
              <div className="flex justify-end mt-2">
                <span className="text-xs text-gray-400">
                  {content.length}/2000
                </span>
              </div>
            </div>

            {/* Media Preview */}
            {mediaUrl && (
              <div className="mx-4 mb-3 relative rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
                
                {mediaType === 'image' ? (
                  <img
                    src={mediaUrl}
                    alt="Selected media"
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="w-full aspect-video">
                    {mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be') ? (
                      <iframe
                        src={mediaUrl}
                        className="w-full h-full"
                        allowFullScreen
                        title="Selected video"
                      />
                    ) : (
                      <video
                        src={mediaUrl}
                        controls
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-scroll no-scrollbar">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMediaBrowser(true)}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                  >
                    <Image className="h-4 w-4" />
                    <span className="text-sm">Photo</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMediaBrowser(true)}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                  >
                    <Video className="h-4 w-4" />
                    <span className="text-sm">Video</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMediaBrowser(true)}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                  >
                    <Smile className="h-4 w-4" />
                    <span className="text-sm">Emoji</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMediaBrowser(true)}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                  >
                    <Hash className="h-4 w-4" />
                    <span className="text-sm">Tags</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="mx-4 mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1 text-sm">Community Guidelines</h4>
              <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-0.5">
                <li>• Share with kindness and respect</li>
                <li>• Keep content family-friendly</li>
                <li>• No spam or promotional content</li>
                <li>• Encourage others in their faith journey</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Media Browser */}
      <MediaBrowser
        isOpen={showMediaBrowser}
        onClose={() => setShowMediaBrowser(false)}
        onSelectMedia={handleMediaSelect}
        onSelectEmoji={handleEmojiSelect}
        onSelectHashtag={handleHashtagSelect}
      />
    </div>
  );
};

export default CreatePost;
