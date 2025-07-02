
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useActivitySync } from '@/lib/hooks/useActivitySync';
import { useToast } from '@/components/ui/use-toast';
import PullToRefresh from '@/components/PullToRefresh';
import BibleHeader from '@/components/bible/BibleHeader';
import BibleContent from '@/components/bible/BibleContent';
import BibleSidebar from '@/components/bible/BibleSidebar';
import { useBibleData } from '@/lib/hooks/useBibleData';

const Bible = () => {
  const { book, chapter, verse, passage, day } = useParams();
  const navigate = useNavigate();
  const { logActivity } = useActivitySync();
  const { toast } = useToast();
  
  const {
    currentChapter,
    selectedVersion,
    setSelectedVersion,
    currentBook,
    currentChapterNumber,
    loading,
    error,
    isOnline,
    loadChapter,
    handleRefresh
  } = useBibleData({ book, chapter, verse, passage, day });

  useEffect(() => {
    if (currentBook && currentChapterNumber && day) {
      logBibleReading(currentBook, currentChapterNumber);
    }
  }, [currentBook, currentChapterNumber, day]);

  const logBibleReading = async (bookName: string, chapterNum: number) => {
    if (!day) return;
    
    try {
      await logActivity({
        type: 'bible_reading',
        timestamp: new Date(),
        data: { 
          book: bookName, 
          chapter: chapterNum, 
          day, 
          version: selectedVersion,
          offline: !isOnline
        }
      });
    } catch (error) {
      console.error('Failed to log Bible reading:', error);
    }
  };

  const handleNavigation = async (bookName: string, chapterNum: number) => {
    await loadChapter(bookName, chapterNum);
  };

  const handleSearch = async (query: string) => {
    // TODO: Implement search functionality
    toast({
      title: "Search",
      description: "Search functionality coming soon!",
    });
  };

  const handleBack = () => {
    if (day) {
      navigate('/reading');
    } else {
      navigate(-1);
    }
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
                  <Button onClick={handleBack} className="w-full">
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
        <BibleHeader
          selectedVersion={selectedVersion}
          onVersionChange={setSelectedVersion}
          isOnline={isOnline}
          currentChapter={currentChapter}
          onBack={handleBack}
        />

        <div className="pt-40 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
            <BibleSidebar
              currentBook={currentBook}
              currentChapter={currentChapterNumber}
              onNavigate={handleNavigation}
              onSearch={handleSearch}
            />

            <BibleContent
              chapter={currentChapter}
              book={currentBook}
              chapterNumber={currentChapterNumber}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Bible;
