
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/lib/hooks/use-toast';
import { ArrowLeft, Send, Image, Video, X, Hash, Smile, Loader2, Sparkles } from 'lucide-react';
import MediaBrowser from '@/components/community/MediaBrowser';
import AIContentGenerator from '@/components/community/AIContentGenerator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PostData {
  id: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  authorId: string;
  status: 'approved' | 'pending' | 'rejected';
}

const EditPost = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { postId } = useParams();
  const { toast } = useToast();
  
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(true);
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const [originalPost, setOriginalPost] = useState<PostData | null>(null);
  const [activeTab, setActiveTab] = useState<"write" | "ai">("write");

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId || !user) {
        navigate('/post-manager');
        return;
      }

      try {
        const postDoc = await getDoc(doc(db, 'communityPosts', postId));
        
        if (!postDoc.exists()) {
          toast({
            title: 'Post Not Found',
            description: 'The post you are trying to edit does not exist.',
            variant: 'destructive'
          });
          navigate('/post-manager');
          return;
        }

        const postData = { id: postDoc.id, ...postDoc.data() } as PostData;
        
        // Check if user owns this post
        if (postData.authorId !== user.uid) {
          toast({
            title: 'Access Denied',
            description: 'You can only edit your own posts.',
            variant: 'destructive'
          });
          navigate('/post-manager');
          return;
        }

        setOriginalPost(postData);
        setContent(postData.content);
        setMediaUrl(postData.mediaUrl || '');
        setMediaType(postData.mediaType || 'image');
      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          title: 'Error',
          description: 'Failed to load post. Please try again.',
          variant: 'destructive'
        });
        navigate('/post-manager');
      } finally {
        setLoadingPost(false);
      }
    };

    fetchPost();
  }, [postId, user, navigate, toast]);

  const handleSubmit = async () => {
    if (!content.trim() || !user || !userProfile || !postId || !originalPost) return;

    setLoading(true);
    try {
      const updateData = {
        content: content.trim(),
        mediaUrl: mediaUrl || null,
        mediaType: mediaUrl ? mediaType : null,
        status: userProfile.isAdmin ? 'approved' : 'pending',
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'communityPosts', postId), updateData);
      
      toast({
        title: userProfile.isAdmin ? 'Post Updated' : 'Edit Submitted',
        description: userProfile.isAdmin 
          ? 'Your post has been updated successfully.'
          : 'Your edit has been submitted for admin approval.'
      });

      navigate('/post-manager');
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update post. Please try again.',
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

  const handleAIContentGenerated = (generatedContent: string, hashtags: string[], keywords?: string[]) => {
    setContent(generatedContent + " " + hashtags.join(" "));
    
    if (keywords && keywords.length > 0) {
      toast({
        title: "Content Generated!",
        description: `Try searching for: ${keywords.join(", ")}`,
      });
    }
  };

  const removeMedia = () => {
    setMediaUrl('');
    setMediaType('image');
  };

  if (!user) {
    navigate('/');
    return null;
  }

  if (loadingPost) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading post...</p>
        </div>
      </div>
    );
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
                onClick={() => {
                if (window.history.length > 2) {
                  navigate(-1);
                } else {
                  navigate("/post-manager");
                }
              }}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 via-purple-700 to-fuchsia-600 bg-clip-text text-transparent">
                Edit Post
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
                  {userProfile?.isAdmin ? 'Update' : 'Submit Edit'}
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
                  {userProfile?.isAdmin ? 'Admin • Changes will be published immediately' : 'Edits pending admin approval'}
                </p>
              </div>
            </div>

            {/* Status Notice */}
            {originalPost?.status === 'pending' && (
              <div className="mx-4 mb-3 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-800 dark:text-yellow-400">
                  This post is currently pending approval. Your edits will also need approval.
                </p>
              </div>
            )}

            {/* Content Input with AI Tab */}
            <div className="px-4 pb-3">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "write" | "ai")}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="write" className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Enhance
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="write" className="space-y-3">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your heart? Share your thoughts, testimonies, prayer requests, or encouragement..."
                    className="border-0 resize-none focus:ring-0 p-0 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-transparent"
                    rows={6}
                    maxLength={2000}
                  />
                  
                  {/* Character count */}
                  <div className="flex justify-end">
                    <span className="text-xs text-gray-400">
                      {content.length}/2000
                    </span>
                  </div>
                </TabsContent>

                <TabsContent value="ai">
                  <AIContentGenerator
                    onContentGenerated={handleAIContentGenerated}
                    onSelectMedia={handleMediaSelect}
                  />
                </TabsContent>
              </Tabs>
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
                        className="w-full h-full aspect-video object-cover"
                        allowFullScreen
                        title="Selected video"
                      />
                    ) : (
                      <video
                        src={mediaUrl}
                        controls
                        className="w-full h-full aspect-video object-cover"
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
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1 text-sm">Editing Guidelines</h4>
              <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-0.5">
                <li>• Maintain the original spirit of your post</li>
                <li>• Major changes may require re-approval</li>
                <li>• Keep content family-friendly and respectful</li>
                <li>• Consider notifying if you're changing the main message</li>
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

export default EditPost;
