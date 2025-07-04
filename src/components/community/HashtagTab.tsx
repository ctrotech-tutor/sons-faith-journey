import React, { useState, useEffect } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { geminiService } from '@/lib/gemini';
import { Hash, Loader2, TrendingUp } from 'lucide-react';

interface HashtagTabProps {
  commonHashtags: string[];
  handleHashtagSelect: (hashtag: string) => void;
  loading: boolean;
}

const HashtagTab: React.FC<HashtagTabProps> = ({
  commonHashtags,
  handleHashtagSelect,
  loading
}) => {
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(false);

  useEffect(() => {
    generateTrendingHashtags();
  }, []);

  const generateTrendingHashtags = async () => {
    setLoadingTrending(true);
    try {
      const trending = await geminiService.generateTrendingHashtags();
      setTrendingHashtags(trending);
    } catch (error) {
      console.error('Error generating trending hashtags:', error);
      // Fallback hashtags
      setTrendingHashtags([
        '#Faith', '#Blessed', '#Prayer', '#Hope', '#Love', '#Grace',
        '#Worship', '#Scripture', '#Community', '#Inspiration'
      ]);
    } finally {
      setLoadingTrending(false);
    }
  };

  const allHashtags = [...new Set([...commonHashtags, ...trendingHashtags])];

  return (
    <TabsContent value="hashtag" className="pt-2 space-y-4">
      <div className="space-y-3">
        {/* Popular Hashtags */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Popular</h3>
          </div>
          {loading || loadingTrending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allHashtags.slice(0, 20).map((hashtag, index) => (
                <motion.div
                  key={hashtag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleHashtagSelect(hashtag)}
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    {hashtag.replace('#', '')}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={generateTrendingHashtags}
            disabled={loadingTrending}
            className="text-xs"
          >
            {loadingTrending ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Hash className="h-3 w-3 mr-1" />
            )}
            Refresh Hashtags
          </Button>
        </div>
      </div>
    </TabsContent>
  );
};

export default HashtagTab;