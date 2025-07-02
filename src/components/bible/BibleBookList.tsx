import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Search } from 'lucide-react';
import { useState } from 'react';
import { bibleBooks, getBooksByTestament, BibleBook } from '@/data/bibleBooks';

interface BibleBookListProps {
  onSelectBook: (book: BibleBook) => void;
}

const BibleBookList: React.FC<BibleBookListProps> = ({ onSelectBook }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTestament, setSelectedTestament] = useState<'Old' | 'New' | 'All'>('All');

  const filteredBooks = bibleBooks.filter(book => {
    const matchesSearch = book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.shortName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTestament = selectedTestament === 'All' || book.testament === selectedTestament;
    return matchesSearch && matchesTestament;
  });

  const oldTestamentBooks = getBooksByTestament('Old');
  const newTestamentBooks = getBooksByTestament('New');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Bible
        </h1>
        <p className="text-lg text-purple-600 dark:text-purple-400">
          Choose a book to read
        </p>
      </motion.div>

      {/* Search and Filter */}
      <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            {['All', 'Old', 'New'].map((testament) => (
              <Button
                key={testament}
                variant={selectedTestament === testament ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTestament(testament as 'Old' | 'New' | 'All')}
                className="flex-1"
              >
                {testament === 'All' ? 'All Books' : `${testament} Testament`}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {oldTestamentBooks.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Old Testament</div>
          </CardContent>
        </Card>
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {newTestamentBooks.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">New Testament</div>
          </CardContent>
        </Card>
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {bibleBooks.reduce((total, book) => total + book.chapters, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Chapters</div>
          </CardContent>
        </Card>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooks.map((book, index) => (
          <motion.div
            key={book.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className="cursor-pointer shadow-md hover:shadow-lg transition-all hover:scale-105 dark:bg-gray-800 dark:border-gray-700"
              onClick={() => onSelectBook(book)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-1" />
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      book.testament === 'Old' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700' 
                        : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700'
                    }`}
                  >
                    {book.testament}
                  </Badge>
                </div>
                
                <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">
                  {book.name}
                </h3>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {book.category}
                </p>
                
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  {book.chapters} chapter{book.chapters !== 1 ? 's' : ''}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No books found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default BibleBookList;