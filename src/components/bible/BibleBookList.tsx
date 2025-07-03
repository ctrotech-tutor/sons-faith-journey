import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, Bookmark } from 'lucide-react';
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
    <div className="min-h-screen bg-bible-bg font-newsreader text-bible-text">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bible-bg/80 backdrop-blur-sm border-b border-bible-border">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-bible-text">Scripture Study</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-bible-border bg-white focus:border-primary focus:ring-primary"
              />
            </div>
            <button className="rounded-md p-2 hover:bg-gray-100">
              <Bookmark className="h-6 w-6 text-gray-500" />
            </button>
            <div className="size-10 rounded-full bg-cover bg-center bg-gray-300"></div>
          </div>
        </div>
      </div>

      <main className="container mx-auto flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold tracking-tight text-bible-text">The Holy Bible</h2>
            <p className="mt-4 text-lg text-bible-muted max-w-2xl mx-auto">
              Explore the collected sacred texts of the Old and New Testaments, offering guidance, wisdom, and the story of God's relationship with humanity.
            </p>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-bible-border bg-white focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          {/* Testament Filter */}
          <div className="flex gap-2 mb-8 justify-center">
            {['All', 'Old', 'New'].map((testament) => (
              <Button
                key={testament}
                variant={selectedTestament === testament ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTestament(testament as 'Old' | 'New' | 'All')}
                className="px-6"
              >
                {testament === 'All' ? 'All Books' : `${testament} Testament`}
              </Button>
            ))}
          </div>

          <div className="space-y-16">
            {/* Old Testament */}
            {(selectedTestament === 'All' || selectedTestament === 'Old') && (
              <section id="old-testament">
                <h3 className="text-3xl font-bold tracking-tight text-bible-text border-b-2 border-primary pb-3 mb-8">
                  Old Testament
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBooks
                    .filter(book => book.testament === 'Old')
                    .map((book, index) => (
                      <motion.div
                        key={book.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="book-item cursor-pointer transition-all duration-200 hover:bg-[#fdfaf7] hover:-translate-y-0.5"
                        onClick={() => onSelectBook(book)}
                      >
                        <Card className="border border-bible-border p-4 bg-white">
                          <h4 className="font-bold text-lg text-bible-text">{book.name}</h4>
                          <p className="text-sm text-bible-muted mt-1">{book.category} • {book.chapters} chapters</p>
                        </Card>
                      </motion.div>
                    ))
                  }
                </div>
              </section>
            )}

            {/* New Testament */}
            {(selectedTestament === 'All' || selectedTestament === 'New') && (
              <section id="new-testament">
                <h3 className="text-3xl font-bold tracking-tight text-bible-text border-b-2 border-primary pb-3 mb-8">
                  New Testament
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBooks
                    .filter(book => book.testament === 'New')
                    .map((book, index) => (
                      <motion.div
                        key={book.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="book-item cursor-pointer transition-all duration-200 hover:bg-[#fdfaf7] hover:-translate-y-0.5"
                        onClick={() => onSelectBook(book)}
                      >
                        <Card className="border border-bible-border p-4 bg-white">
                          <h4 className="font-bold text-lg text-bible-text">{book.name}</h4>
                          <p className="text-sm text-bible-muted mt-1">{book.category} • {book.chapters} chapters</p>
                        </Card>
                      </motion.div>
                    ))
                  }
                </div>
              </section>
            )}
          </div>

        </div>
      </main>

      <footer className="bg-bible-border/30 mt-16">
        <div className="container mx-auto px-6 py-8 text-center text-bible-muted">
          <p>© 2024 Scripture Study. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default BibleBookList;