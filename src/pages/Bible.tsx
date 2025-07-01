import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, Loader2, Copy, Check, Bookmark, Share2 } from 'lucide-react';
import { useActivitySync } from '@/lib/hooks/useActivitySync';
import { useToast } from '@/components/ui/use-toast';
import PullToRefresh from '@/components/PullToRefresh';
import BibleReader from '@/components/bible/BibleReader';
import BibleNavigation from '@/components/bible/BibleNavigation';
import BibleVersionSelector from '@/components/bible/BibleVersionSelector';
import { BibleStorage, BibleChapter, BibleVerse } from '@/lib/bibleStorage';

const Bible = () => {
  const { passage, day } = useParams();
  const navigate = useNavigate();
  const { logActivity } = useActivitySync();
  const { toast } = useToast();
  
  // State management
  const [selectedVersion, setSelectedVersion] = useState('kjv');
  const [currentChapter, setCurrentChapter] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentBook, setCurrentBook] = useState('');
  const [currentChapterNumber, setCurrentChapterNumber] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);

  // Initialize Bible storage
  const [bibleStorage] = useState(() => BibleStorage.getInstance());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    console.log('Bible component mounted with params:', { passage, day });
    initializeBible();
  }, [passage, selectedVersion]);

  const initializeBible = async () => {
    try {
      console.log('Initializing Bible storage...');
      await bibleStorage.initialize();
      
      if (passage) {
        console.log('Loading passage from params:', passage);
        await loadPassageFromParams();
      } else {
        console.log('No passage provided, loading default Genesis 1');
        await loadChapter('Genesis', 1);
      }
    } catch (error) {
      console.error('Failed to initialize Bible:', error);
      setError('Failed to initialize Bible. Please try again.');
      setLoading(false);
    }
  };

  const loadPassageFromParams = async () => {
    if (!passage) return;
    
    try {
      console.log('Parsing passage:', passage);
      const { bookName, chapterNumber } = parsePassage(passage);
      console.log('Parsed:', { bookName, chapterNumber });
      
      await loadChapter(bookName, chapterNumber);
      await logBibleReading(bookName, chapterNumber);
    } catch (error) {
      console.error('Error loading passage:', error);
      setError(`Failed to load passage "${decodeURIComponent(passage)}". Please try again.`);
      setLoading(false);
    }
  };

  const parsePassage = (passage: string) => {
    console.log('Raw passage:', passage);
    const decodedPassage = decodeURIComponent(passage).trim();
    console.log('Decoded passage:', decodedPassage);
    
    // Handle different passage formats
    let bookName = '';
    let chapterNumber = 1;
    
    // Split by common separators and clean up
    const cleanPassage = decodedPassage.replace(/[,\-–]/g, ' ').replace(/\s+/g, ' ').trim();
    const parts = cleanPassage.split(' ');
    console.log('Split parts:', parts);
    
    // Handle numbered books (e.g., "1 Kings", "2 Corinthians")
    if (parts.length >= 2 && /^\d/.test(parts[0])) {
      bookName = `${parts[0]} ${parts[1]}`;
      // Look for chapter number
      const chapterPart = parts.find(part => /^\d+$/.test(part));
      if (chapterPart) {
        chapterNumber = parseInt(chapterPart);
      }
    } else if (parts.length >= 1) {
      bookName = parts[0];
      // Look for chapter number
      const chapterPart = parts.find(part => /^\d+$/.test(part));
      if (chapterPart) {
        chapterNumber = parseInt(chapterPart);
      }
    }
    
    // Fallback: if no chapter found, default to 1
    if (isNaN(chapterNumber) || chapterNumber < 1) {
      chapterNumber = 1;
    }
    
    console.log('Final parsed result:', { bookName, chapterNumber });
    return { bookName, chapterNumber };
  };

  const loadChapter = async (bookName: string, chapterNumber: number) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Loading chapter:', { bookName, chapterNumber, version: selectedVersion });
      
      // Validate inputs
      if (!bookName || bookName.trim() === '') {
        throw new Error('Invalid book name provided');
      }
      
      if (chapterNumber < 1) {
        throw new Error('Invalid chapter number provided');
      }
      
      const chapter = await bibleStorage.getChapter(bookName, chapterNumber, selectedVersion);
      console.log('Chapter loaded successfully:', chapter);
      
      setCurrentChapter(chapter);
      setCurrentBook(bookName);
      setCurrentChapterNumber(chapterNumber);
    } catch (error) {
      console.error('Error loading chapter:', error);
      if (!isOnline) {
        setError('This chapter is not available offline. Please connect to the internet to download it.');
      } else {
        setError(`Failed to load ${bookName} ${chapterNumber}. The book name might be incorrect or the chapter doesn't exist.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const logBibleReading = async (book: string, chapter: number) => {
    if (!day) return;
    
    try {
      await logActivity({
        type: 'bible_reading',
        timestamp: new Date(),
        data: { 
          book, 
          chapter, 
          day, 
          version: selectedVersion,
          offline: !isOnline
        }
      });
    } catch (error) {
      console.error('Failed to log Bible reading:', error);
    }
  };

  const handleRefresh = async () => {
    if (currentBook && currentChapterNumber) {
      await loadChapter(currentBook, currentChapterNumber);
    }
  };

  const handleNavigation = async (book: string, chapter: number) => {
    await loadChapter(book, chapter);
  };

  const handleSearch = async (query: string) => {
    // TODO: Implement search functionality
    toast({
      title: "Search",
      description: "Search functionality coming soon!",
    });
  };

  const copyToClipboard = async () => {
    if (!currentChapter) return;

    const textToCopy = currentChapter.verses
      .map(verse => `${verse.chapter}:${verse.verse} ${verse.text}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(`${currentBook} ${currentChapterNumber}\n\n${textToCopy}`);
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

    const shareText = `${currentBook} ${currentChapterNumber} - ${selectedVersion.toUpperCase()}`;
    
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

  const handleVerseSelect = (verse: BibleVerse) => {
    setSelectedVerse(verse);
    // TODO: Add verse highlighting, notes, bookmarks functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading Scripture...</p>
          {passage && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Loading: {decodeURIComponent(passage)}
            </p>
          )}
          {!isOnline && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
              Offline mode - Loading cached content
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <PullToRefresh onRefresh={handleRefresh} spinnerDuration={1500} checkDuration={400} />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
          <div className="max-w-md mx-auto p-4">
            <Card className="shadow-xl dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Error Loading Scripture</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2">{error}</p>
                {passage && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Attempted to load: {decodeURIComponent(passage)}
                  </p>
                )}
                <div className="space-y-3">
                  <Button onClick={() => navigate('/reading')} className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Reading Plan
                  </Button>
                  <Button onClick={handleRefresh} variant="outline" className="w-full">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PullToRefresh onRefresh={handleRefresh} spinnerDuration={1500} checkDuration={400} />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900">
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b dark:border-gray-700 shadow-sm">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={() => navigate('/reading')}
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
              onVersionChange={setSelectedVersion}
              isOnline={isOnline}
            />
          </div>
        </div>

        <div className="pt-40 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
            {/* Navigation Panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-44">
                <BibleNavigation
                  currentBook={currentBook}
                  currentChapter={currentChapterNumber}
                  onNavigate={handleNavigation}
                  onSearch={handleSearch}
                />
              </Card>
            </div>

            {/* Main Reader */}
            <div className="lg:col-span-3">
              <Card className="shadow-xl dark:bg-gray-800 dark:border-gray-700">
                {currentChapter && (
                  <BibleReader
                    chapter={currentChapter}
                    onVerseSelect={handleVerseSelect}
                    highlightedVerses={selectedVerse ? [selectedVerse.verse] : []}
                  />
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Bible;
