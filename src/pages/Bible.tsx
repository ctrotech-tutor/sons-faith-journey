import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BookOpen, Globe, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import { useActivitySync } from '@/lib/hooks/useActivitySync';
import { useToast } from '@/components/ui/use-toast';
import PullToRefresh from '@/components/PullToRefresh';
import BibleBookList from '@/components/bible/BibleBookList';
import BibleChapterList from '@/components/bible/BibleChapterList';
import BibleReader from '@/components/bible/BibleReader';
import { BibleBook, getBookByName, bibleVersions } from '@/data/bibleBooks';

type ViewMode = 'books' | 'chapters' | 'reader' | 'passage';

interface BibleVerse {
  chapter: number;
  verse: number;
  text: string;
}

const Bible = () => {
  const { passage, day, book: bookParam, chapter: chapterParam } = useParams();
  const navigate = useNavigate();
  const { logActivity } = useActivitySync();
  const { toast } = useToast();
  
  // State for standalone Bible app
  const [viewMode, setViewMode] = useState<ViewMode>('books');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  
  // State for passage reading (from reading plan)
  const [selectedVersion, setSelectedVersion] = useState('kjv');
  const [chapterData, setChapterData] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [bookName, setBookName] = useState('');
  const [chapterRange, setChapterRange] = useState('');
  const [copied, setCopied] = useState(false);

  // Determine if this is a passage view (from reading plan) or standalone
  const isPassageView = !!(passage && day);
  const isDirectBookChapter = !!(bookParam && chapterParam);

  const logBibleReading = useCallback(async () => {
    if (!passage || !day) return;
    
    await logActivity({
      type: 'bible_reading',
      timestamp: new Date(),
      data: { passage, day, version: selectedVersion }
    });
  }, [passage, day, selectedVersion, logActivity]);

  const loadBibleChapter = useCallback(async () => {
    if (!passage) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { bookName: parsedBookName, chapterRange: parsedChapterRange } = parsePassage(passage);
      
      setBookName(parsedBookName);
      setChapterRange(parsedChapterRange);

      const chapters = parsedChapterRange.includes('-') 
        ? parsedChapterRange.split('-').map(c => parseInt(c.trim()))
        : [parseInt(parsedChapterRange)];

      const allVerses: BibleVerse[] = [];

      for (let i = chapters[0]; i <= (chapters[1] || chapters[0]); i++) {
        try {
          const response = await fetch(`https://bible-api.com/${parsedBookName}+${i}?translation=${selectedVersion}`);
          
          if (!response.ok) {
            console.warn(`Failed to fetch ${parsedBookName} ${i}`);
            continue;
          }
          
          const data = await response.json();
          
          if (data.verses && data.verses.length > 0) {
            const versesArray: BibleVerse[] = data.verses.map((verse: { verse: number; text: string }) => ({
              chapter: i,
              verse: verse.verse,
              text: verse.text.trim()
            }));
            
            allVerses.push(...versesArray);
          }
        } catch (chapterError) {
          console.warn(`Error fetching ${parsedBookName} ${i}:`, chapterError);
        }
      }

      if (allVerses.length === 0) {
        setError(`No chapters found for "${parsedBookName} ${parsedChapterRange}".`);
      } else {
        setChapterData(allVerses);
      }
      
    } catch (error) {
      console.error('Error loading Bible passage:', error);
      setError('Failed to load the requested passage. Please try again.');
    } finally {
      setLoading(false);
    }
  },[passage, selectedVersion]);

  useEffect(() => {
    if (isPassageView) {
      setViewMode('passage');
      setLoading(true);
      loadBibleChapter();
      logBibleReading();
    } else if (isDirectBookChapter && bookParam && chapterParam) {
      const book = getBookByName(bookParam);
      if (book) {
        setSelectedBook(book);
        setSelectedChapter(parseInt(chapterParam));
        setViewMode('reader');
      } else {
        setError('Book not found');
      }
    } else {
      setViewMode('books');
    }
  }, [passage, day, bookParam, chapterParam, selectedVersion, loadBibleChapter, logBibleReading, isDirectBookChapter, isPassageView]);

  const handleRefresh = async () => {
    if (passage) {
      setTimeout(async () => {
        await loadBibleChapter();
        await logBibleReading();
      }, 2000);
    }
  };

  const parsePassage = (passage: string) => {
    const decodedPassage = decodeURIComponent(passage);
    const parts = decodedPassage.trim().split(' ');
    
    let bookName = '';
    let chapterRange = '';
    
    if (parts[0].match(/^\d/)) {
      bookName = parts[0] + ' ' + parts[1];
      chapterRange = parts[2] || '1';
    } else {
      bookName = parts[0];
      chapterRange = parts[1] || '1';
    }
    
    return { bookName, chapterRange };
  };

  const copyToClipboard = async () => {
    if (chapterData.length === 0) return;

    const textToCopy = chapterData
      .map(verse => `${verse.chapter}:${verse.verse} ${verse.text}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(`${bookName} ${chapterRange}\n\n${textToCopy}`);
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

  const handleBack = () => {
    if (isPassageView) {
      navigate('/reading');
    } else if (viewMode === 'reader') {
      setViewMode('chapters');
    } else if (viewMode === 'chapters') {
      setViewMode('books');
    } else {
      navigate(-1);
    }
  };

  const handleSelectBook = (book: BibleBook) => {
    setSelectedBook(book);
    setViewMode('chapters');
  };

  const handleSelectChapter = (chapter: number) => {
    setSelectedChapter(chapter);
    setViewMode('reader');
    // Update URL for standalone navigation
    if (!isPassageView) {
      navigate(`/bible/${selectedBook?.name}/${chapter}`, { replace: true });
    }
  };

  const handleBackToChapters = () => {
    setViewMode('chapters');
  };

  const handleBackToBooks = () => {
    setViewMode('books');
    setSelectedBook(null);
  };

  // Loading state for passage view
  if (isPassageView && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading Scripture...</p>
        </div>
      </div>
    );
  }

  // Error state for passage view
  if (isPassageView && error) {
    return (
      <>
        <PullToRefresh onRefresh={handleRefresh} spinnerDuration={1500} checkDuration={400} />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Error Loading Passage</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <Button onClick={handleBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reading
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Passage view (from reading plan)
  if (isPassageView) {
    return (
      <>
        <PullToRefresh onRefresh={handleRefresh} spinnerDuration={1500} checkDuration={400} />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900">
          {/* Fixed Navigation Bar */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b dark:border-gray-700 shadow-sm">
            <div className="max-w-4xl mx-auto p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>

                <div className="flex items-center space-x-4">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="flex items-center space-x-2"
                    disabled={chapterData.length === 0}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span>Copy</span>
                  </Button>

                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {bibleVersions.map((version) => (
                          <SelectItem key={version.value} value={version.value}>
                            {version.value.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto p-4 pt-24">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-center"
            >
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {bookName} {chapterRange}
              </h1>
              <p className="text-lg text-purple-600 dark:text-purple-400">
                Day {day} Reading • {bibleVersions.find(v => v.value === selectedVersion)?.label}
              </p>
            </motion.div>

            {/* Bible Content */}
            <Card className="shadow-xl dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="dark:text-gray-100">{bookName} {chapterRange.includes('-') ? `Chapters ${chapterRange}` : `Chapter ${chapterRange}`}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {chapterData.length > 0 ? (
                  <div className="space-y-6">
                    {chapterData.reduce((acc: { [key: number]: BibleVerse[] }, verse) => {
                      if (!acc[verse.chapter]) acc[verse.chapter] = [];
                      acc[verse.chapter].push(verse);
                      return acc;
                    }, {}) && Object.entries(
                      chapterData.reduce((acc: { [key: number]: BibleVerse[] }, verse) => {
                        if (!acc[verse.chapter]) acc[verse.chapter] = [];
                        acc[verse.chapter].push(verse);
                        return acc;
                      }, {})
                    ).map(([chapter, verses]) => (
                      <div key={chapter} className="border-b dark:border-gray-700 pb-6 last:border-b-0">
                        {chapterRange.includes('-') && (
                          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                            Chapter {chapter}
                          </h3>
                        )}
                        <div className="space-y-4">
                          {verses.map((verse, index) => (
                            <motion.div
                              key={`${verse.chapter}-${verse.verse}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.02 }}
                              className="flex space-x-3"
                            >
                              <span className="text-purple-600 dark:text-purple-400 font-bold text-sm mt-1 min-w-[2rem] flex-shrink-0">
                                {verse.verse}
                              </span>
                              <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg">
                                {verse.text}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No verses found for this passage.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  // Standalone Bible app
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900">
      {/* Fixed Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b dark:border-gray-700 shadow-sm">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Bible
              </h1>
            </div>

            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pt-24">
        {viewMode === 'books' && (
          <BibleBookList onSelectBook={handleSelectBook} />
        )}

        {viewMode === 'chapters' && selectedBook && (
          <BibleChapterList
            book={selectedBook}
            onSelectChapter={handleSelectChapter}
            onBack={handleBackToBooks}
          />
        )}

        {viewMode === 'reader' && selectedBook && (
          <BibleReader
            book={selectedBook}
            chapter={selectedChapter}
            onBack={handleBackToChapters}
            initialVersion={selectedVersion}
          />
        )}
      </div>
    </div>
  );
};

export default Bible;