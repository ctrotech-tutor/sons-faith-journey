
import { useState } from 'react';
import { motion } from 'framer-motion';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/hooks/use-toast';
import { ArrowLeft, Send, Image, Video, Smile, Hash } from 'lucide-react';

const CreatePost = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || !user || !userProfile) return;

    setLoading(true);
    try {
      const postData = {
        authorId: user.uid,
        authorName: userProfile.displayName,
        content: content.trim(),
        mediaUrl: mediaUrl || null,
        mediaType: mediaUrl ? mediaType : null,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        likes: [],
        likeCount: 0,
        comments: [],
        commentCount: 0,
        status: userProfile.isAdmin ? 'approved' : 'pending',
        timestamp: new Date(),
        isAdmin: userProfile.isAdmin
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

  const handleMediaUpload = () => {
    // This would integrate with image/video upload service
    toast({
      title: 'Media Upload',
      description: 'Media upload feature coming soon!'
    });
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/community')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Create New Post</h1>
          </div>

          {/* Main Form */}
          <Card>
            <CardHeader>
              <CardTitle>Share with the Community</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content */}
              <div>
                <Label htmlFor="content">What's on your heart?</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts, testimonies, prayer requests, or encouragement..."
                  className="mt-2"
                  rows={6}
                />
                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                  <span>Share authentically and build community</span>
                  <span>{content.length}/2000</span>
                </div>
              </div>

              {/* Media URL */}
              <div>
                <Label htmlFor="mediaUrl">Media URL (Optional)</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    id="mediaUrl"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1"
                  />
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags">Tags (Optional)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="prayer, testimony, encouragement (separate with commas)"
                  className="mt-2"
                />
              </div>

              {/* Media Preview */}
              {mediaUrl && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Media Preview:</p>
                  {mediaType === 'image' ? (
                    <img 
                      src={mediaUrl} 
                      alt="Preview" 
                      className="max-w-full h-48 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <video 
                      src={mediaUrl} 
                      controls 
                      className="max-w-full h-48 rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMediaUpload}
                    className="flex items-center space-x-2"
                  >
                    <Image className="h-4 w-4" />
                    <span>Add Photo</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMediaUpload}
                    className="flex items-center space-x-2"
                  >
                    <Video className="h-4 w-4" />
                    <span>Add Video</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Smile className="h-4 w-4" />
                    <span>Emoji</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Hash className="h-4 w-4" />
                    <span>Tags</span>
                  </Button>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !content.trim()}
                    className="flex-1 bg-[#FF9606] hover:bg-[#FF9606]/90 text-white"
                  >
                    {loading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {userProfile?.isAdmin ? 'Publish Post' : 'Submit for Review'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/community')}
                  >
                    Cancel
                  </Button>
                </div>
              </div>

              {/* Guidelines */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Community Guidelines</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Share with kindness and respect</li>
                  <li>• Keep content family-friendly</li>
                  <li>• No spam or promotional content</li>
                  <li>• Encourage others in their faith journey</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatePost;
