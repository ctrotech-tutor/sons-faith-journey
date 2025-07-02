
import { useState, useEffect } from 'react';
import { BibleStorage, BibleChapter } from '@/lib/bibleStorage';

interface UseBibleDataProps {
  book?: string;
  chapter?: string;
  verse?: string;
  passage?: string;
  day?: string;
}

export const useBibleData = ({ book, chapter, verse, passage, day }: UseBibleDataProps) => {
  const [selectedVersion, setSelectedVersion] = useState('kjv');
  const [currentChapter, setCurrentChapter] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentBook, setCurrentBook] = useState('');
  const [currentChapterNumber, setCurrentChapterNumber] = useState(1);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
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
    initializeBible();
  }, [book, chapter, passage, selectedVersion]);

  const initializeBible = async () => {
    try {
      await bibleStorage.initialize();
      
      if (passage) {
        await loadPassageFromParams();
      } else if (book) {
        const chapterNum = chapter ? parseInt(chapter) : 1;
        await loadChapter(book, chapterNum);
      } else {
        // Default to Genesis 1 for standalone Bible access
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
      const { bookName, chapterNumber } = parsePassage(passage);
      await loadChapter(bookName, chapterNumber);
    } catch (error) {
      console.error('Error loading passage:', error);
      setError(`Failed to load passage "${decodeURIComponent(passage)}". Please try again.`);
      setLoading(false);
    }
  };

  const parsePassage = (passage: string) => {
    const decodedPassage = decodeURIComponent(passage).trim();
    const cleanPassage = decodedPassage.replace(/[,\-–]/g, ' ').replace(/\s+/g, ' ').trim();
    const parts = cleanPassage.split(' ');
    
    let bookName = '';
    let chapterNumber = 1;
    
    if (parts.length >= 2 && /^\d/.test(parts[0])) {
      bookName = `${parts[0]} ${parts[1]}`;
      const chapterPart = parts.find(part => /^\d+$/.test(part));
      if (chapterPart) {
        chapterNumber = parseInt(chapterPart);
      }
    } else if (parts.length >= 1) {
      bookName = parts[0];
      const chapterPart = parts.find(part => /^\d+$/.test(part));
      if (chapterPart) {
        chapterNumber = parseInt(chapterPart);
      }
    }
    
    if (isNaN(chapterNumber) || chapterNumber < 1) {
      chapterNumber = 1;
    }
    
    return { bookName, chapterNumber };
  };

  const loadChapter = async (bookName: string, chapterNumber: number) => {
    setLoading(true);
    setError('');
    
    try {
      if (!bookName || bookName.trim() === '') {
        throw new Error('Invalid book name provided');
      }
      
      if (chapterNumber < 1) {
        throw new Error('Invalid chapter number provided');
      }
      
      const chapter = await bibleStorage.getChapter(bookName, chapterNumber, selectedVersion);
      
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

  const handleRefresh = async () => {
    if (currentBook && currentChapterNumber) {
      await loadChapter(currentBook, currentChapterNumber);
    }
  };

  return {
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
  };
};
