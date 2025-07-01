
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search, BookOpen } from 'lucide-react';
import { BibleStorage, BibleBook } from '@/lib/bibleStorage';

interface BibleNavigationProps {
  currentBook: string;
  currentChapter: number;
  onNavigate: (book: string, chapter: number) => void;
  onSearch?: (query: string) => void;
}

const BibleNavigation = ({ currentBook, currentChapter, onNavigate, onSearch }: BibleNavigationProps) => {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<BibleBook | undefined>();

  useEffect(() => {
    const loadBooks = async () => {
      const storage = BibleStorage.getInstance();
      await storage.initialize();
      const bibleBooks = storage.getBooks();
      setBooks(bibleBooks);
      
      const book = storage.getBook(currentBook);
      setSelectedBook(book);
    };
    
    loadBooks();
  }, [currentBook]);

  const handleBookChange = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      setSelectedBook(book);
      onNavigate(book.name, 1);
    }
  };

  const handleChapterChange = (chapter: string) => {
    if (selectedBook) {
      onNavigate(selectedBook.name, parseInt(chapter));
    }
  };

  const navigateChapter = (direction: 'prev' | 'next') => {
    if (!selectedBook) return;
    
    let newChapter = currentChapter;
    let newBook = selectedBook;
    
    if (direction === 'next') {
      if (currentChapter < selectedBook.chapters) {
        newChapter = currentChapter + 1;
      } else {
        const currentIndex = books.findIndex(b => b.id === selectedBook.id);
        if (currentIndex < books.length - 1) {
          newBook = books[currentIndex + 1];
          newChapter = 1;
        }
      }
    } else {
      if (currentChapter > 1) {
        newChapter = currentChapter - 1;
      } else {
        const currentIndex = books.findIndex(b => b.id === selectedBook.id);
        if (currentIndex > 0) {
          newBook = books[currentIndex - 1];
          newChapter = newBook.chapters;
        }
      }
    }
    
    onNavigate(newBook.name, newChapter);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 border-b">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search verses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" size="sm">
          Search
        </Button>
      </form>

      {/* Book and Chapter Selection */}
      <div className="flex items-center space-x-2">
        <Select value={selectedBook?.id || ''} onValueChange={handleBookChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select book">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>{selectedBook?.name || 'Select Book'}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <div className="p-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Old Testament
            </div>
            {books.filter(book => book.testament === 'old').map(book => (
              <SelectItem key={book.id} value={book.id}>
                {book.name}
              </SelectItem>
            ))}
            <div className="p-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              New Testament
            </div>
            {books.filter(book => book.testament === 'new').map(book => (
              <SelectItem key={book.id} value={book.id}>
                {book.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedBook && (
          <Select value={currentChapter.toString()} onValueChange={handleChapterChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: selectedBook.chapters }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateChapter('prev')}
          disabled={!selectedBook || (selectedBook.id === books[0]?.id && currentChapter === 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          {selectedBook?.name} {currentChapter}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateChapter('next')}
          disabled={!selectedBook || (selectedBook.id === books[books.length - 1]?.id && currentChapter === selectedBook.chapters)}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default BibleNavigation;
