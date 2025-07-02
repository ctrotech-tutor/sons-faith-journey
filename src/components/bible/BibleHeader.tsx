
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Check, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import BibleVersionSelector from './BibleVersionSelector';
import { BibleChapter } from '@/lib/bibleStorage';

interface BibleHeaderProps {
  selectedVersion: string;
  onVersionChange: (version: string) => void;
  isOnline: boolean;
  currentChapter: BibleChapter | null;
  onBack: () => void;
}

const BibleHeader = ({ 
  selectedVersion, 
  onVersionChange, 
  isOnline, 
  currentChapter,
  onBack 
}: BibleHeaderProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    if (!currentChapter) return;

    const textToCopy = currentChapter.verses
      .map(verse => `${verse.chapter}:${verse.verse} ${verse.text}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(`${currentChapter.book} ${currentChapter.chapter}\n\n${textToCopy}`);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Bible passage copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!currentChapter) return;

    const shareText = `${currentChapter.book} ${currentChapter.chapter} - ${selectedVersion.toUpperCase()}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: currentChapter.verses.slice(0, 3).map(v => v.text).join(' '),
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              disabled={!currentChapter}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>

            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              disabled={!currentChapter}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <BibleVersionSelector
          selectedVersion={selectedVersion}
          onVersionChange={onVersionChange}
          isOnline={isOnline}
        />
      </div>
    </div>
  );
};

export default BibleHeader;
