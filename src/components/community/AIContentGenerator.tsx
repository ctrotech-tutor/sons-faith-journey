import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/lib/hooks/use-toast';
import { geminiService } from '@/lib/gemini';
import { Sparkles, Image, Video, FileText, Loader2, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AIContentGeneratorProps {
  onContentGenerated: (content: string, hashtags: string[], mediaKeywords?: string[]) => void;
  onSelectMedia?: (url: string, type: 'image' | 'video') => void;
  className?: string;
}

const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  onContentGenerated,
  onSelectMedia,
  className = ''
}) => {
  const { toast } = useToast();
  const [hint, setHint] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [mediaKeywords, setMediaKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [includeMedia, setIncludeMedia] = useState<'none' | 'image' | 'video'>('none');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('generator');

  const handleGenerateContent = async () => {
    if (!hint.trim()) {
      toast({
        title: 'Hint Required',
        description: 'Please provide a hint for the AI to generate content.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Generating AI content with hint:', hint, 'includeMedia:', includeMedia);
      const result = await geminiService.generatePostContent(hint, includeMedia);
      console.log('AI Content result:', result);
      
      if (result && result.content) {
        setGeneratedContent(result.content);
        setSuggestedHashtags(result.suggestedHashtags || []);
        
        if (result.mediaKeywords) {
          setMediaKeywords(result.mediaKeywords);
        }

        toast({
          title: 'Content Generated!',
          description: 'AI has created engaging content based on your hint.'
        });

        setActiveTab('preview');
      } else {
        throw new Error('No content generated');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate content. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUseContent = () => {
    onContentGenerated(generatedContent, suggestedHashtags, mediaKeywords);
    toast({
      title: 'Content Applied',
      description: 'Generated content has been added to your post.'
    });
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Content copied to clipboard.'
      });
    } catch {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy content to clipboard.',
        variant: 'destructive'
      });
    }
  };

  const handleRegenerateWithMedia = async (mediaType: 'image' | 'video') => {
    if (!hint.trim()) return;
    
    setIncludeMedia(mediaType);
    setLoading(true);
    try {
      const result = await geminiService.generatePostContent(hint, mediaType);
      setGeneratedContent(result.content);
      setSuggestedHashtags(result.suggestedHashtags);
      if (result.mediaKeywords) {
        setMediaKeywords(result.mediaKeywords);
      }
      
      toast({
        title: 'Content Regenerated',
        description: `Content updated with ${mediaType} suggestions.`
      });
    } catch (error) {
      console.error('Error regenerating content:', error);
      toast({
        title: 'Regeneration Failed',
        description: 'Failed to regenerate content.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedContent}>
            <FileText className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                What would you like to post about?
              </label>
              <Textarea
                placeholder="E.g., Share an inspiring Bible verse about hope, Tell about overcoming challenges through faith, Encourage others in their spiritual journey..."
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <div className="text-right mt-1">
                <span className="text-xs text-muted-foreground">
                  {hint.length}/500
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Include Media Suggestion?
              </label>
              <div className="flex gap-2">
                <Button
                  variant={includeMedia === 'none' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIncludeMedia('none')}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Text Only
                </Button>
                <Button
                  variant={includeMedia === 'image' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIncludeMedia('image')}
                >
                  <Image className="h-4 w-4 mr-1" />
                  With Image
                </Button>
                <Button
                  variant={includeMedia === 'video' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIncludeMedia('video')}
                >
                  <Video className="h-4 w-4 mr-1" />
                  With Video
                </Button>
              </div>
            </div>

            <Button
              onClick={handleGenerateContent}
              disabled={loading || !hint.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <AnimatePresence>
            {generatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-card border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Generated Content</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyContent}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="bg-muted rounded-md p-3">
                    <p className="text-sm whitespace-pre-wrap">{generatedContent}</p>
                  </div>

                  {suggestedHashtags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Suggested Hashtags:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestedHashtags.map((hashtag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {hashtag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {mediaKeywords.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Media Search Keywords:</p>
                      <div className="flex flex-wrap gap-1">
                        {mediaKeywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleUseContent}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Use This Content
                  </Button>
                  
                  {includeMedia === 'none' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerateWithMedia('image')}
                        disabled={loading}
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerateWithMedia('video')}
                        disabled={loading}
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('generator')}
                  className="w-full"
                >
                  Generate Different Content
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIContentGenerator;