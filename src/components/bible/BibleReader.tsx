import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Copy, 
  Check, 
  Globe,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { BibleBook, bibleVersions } from '@/data/bibleBooks';

interface BibleVerse {
  chapter: number;
  verse: number;
  text: string;
}

interface BibleReaderProps {
  book: BibleBook;
  chapter: number;
  onBack: () => void;
  initialVersion?: string;
}

const BibleReader: React.FC<BibleReaderProps> = ({ 
  book, 
  chapter, 
  onBack,
  initialVersion = 'kjv'
}) => {
  const { toast } = useToast();
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVersion, setSelectedVersion] = useState(initialVersion);
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);
  const [favoriteVerses, setFavoriteVerses] = useState<Set<string>>(new Set());

  const loadChapter = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://bible-api.com/${book.name}+${chapter}?translation=${selectedVersion}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${book.name} ${chapter}`);
      }
      
      const data = await response.json();
      
      if (data.verses && data.verses.length > 0) {
        const versesArray: BibleVerse[] = data.verses.map((verse: { verse: number; text: string }) => ({
          chapter,
          verse: verse.verse,
          text: verse.text.trim()
        }));
        setVerses(versesArray);
      } else {
        setError('No verses found for this chapter.');
      }
    } catch (error) {
      console.error('Error loading chapter:', error);
      setError('Failed to load chapter. Please try again.');
    } finally {
      setLoading(false);
    }
  },[chapter, selectedVersion, book.name]);

   useEffect(() => {
    loadChapter();
  }, [book, chapter, selectedVersion, loadChapter]);


  const copyVerse = async (verse: BibleVerse) => {
    const text = `${book.name} ${verse.chapter}:${verse.verse}\n"${verse.text}"`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVerse(verse.verse);
      toast({
        title: "Copied!",
        description: `${book.name} ${verse.chapter}:${verse.verse} copied to clipboard`,
      });
      setTimeout(() => setCopiedVerse(null), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy verse",
        variant: "destructive",
      });
    }
  };

  const copyChapter = async () => {
    const text = verses
      .map(verse => `${verse.verse}. ${verse.text}`)
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(`${book.name} ${chapter}\n\n${text}`);
      toast({
        title: "Copied!",
        description: `${book.name} ${chapter} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy chapter",
        variant: "destructive",
      });
    }
  };

  const toggleFavorite = (verse: BibleVerse) => {
    const verseKey = `${book.name}:${verse.chapter}:${verse.verse}`;
    const newFavorites = new Set(favoriteVerses);
    
    if (newFavorites.has(verseKey)) {
      newFavorites.delete(verseKey);
      toast({
        title: "Removed from favorites",
        description: `${book.name} ${verse.chapter}:${verse.verse}`,
      });
    } else {
      newFavorites.add(verseKey);
      toast({
        title: "Added to favorites",
        description: `${book.name} ${verse.chapter}:${verse.verse}`,
      });
    }
    
    setFavoriteVerses(newFavorites);
  };

  const shareVerse = async (verse: BibleVerse) => {
    const text = `"${verse.text}" - ${book.name} ${verse.chapter}:${verse.verse}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${book.name} ${verse.chapter}:${verse.verse}`,
          text,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      copyVerse(verse);
    }
  };

  const navigateChapter = (direction: 'prev' | 'next') => {
    const newChapter = direction === 'prev' ? chapter - 1 : chapter + 1;
    if (newChapter >= 1 && newChapter <= book.chapters) {
      window.location.href = `/bible/${encodeURIComponent(book.name)}/${newChapter}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading {book.name} {chapter}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Error Loading Chapter</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <div className="space-x-4">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={loadChapter}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFC] font-newsreader text-bible-text">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-[#F3F0EE] shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">Scripture Study</h2>
          </div>
        </div>
      </div>

      <main className="flex-1 px-16 py-8 md:px-24 lg:px-40">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center space-x-2 text-sm text-gray-500">
            <button 
              onClick={onBack}
              className="hover:text-primary hover:underline"
            >
              {book.name}
            </button>
            <span>/</span>
            <span className="font-semibold text-bible-text">Chapter {chapter}</span>
          </div>

          {/* Title and Navigation */}
          <div className="flex items-baseline justify-between mb-8">
            <h1 className="text-4xl font-bold text-bible-text tracking-tight">{book.name} {chapter}</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateChapter('prev')}
                disabled={chapter <= 1}
                className="flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateChapter('next')}
                disabled={chapter >= book.chapters}
                className="flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Verses */}
          <div className="space-y-6">
            <div className="mt-8 text-lg leading-loose text-gray-800 space-y-6">
              {verses.map((verse, index) => (
                <motion.p
                  key={verse.verse}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="group relative"
                >
                  <span className="verse-number text-xs font-bold text-bible-muted mr-1 align-super">
                    {verse.verse}
                  </span>
                  {verse.text}
                  
                  {/* Verse Actions */}
                  <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white rounded-md shadow-md p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyVerse(verse)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedVerse === verse.verse ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(verse)}
                      className="h-8 w-8 p-0"
                    >
                      <Heart 
                        className={`h-3 w-3 ${
                          favoriteVerses.has(`${book.name}:${verse.chapter}:${verse.verse}`)
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400'
                        }`}
                      />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => shareVerse(verse)}
                      className="h-8 w-8 p-0"
                    >
                      <Share className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BibleReader;