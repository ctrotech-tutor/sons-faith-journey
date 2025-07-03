import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { BibleBook } from '@/data/bibleBooks';

interface BibleChapterListProps {
  book: BibleBook;
  onSelectChapter: (chapter: number) => void;
  onBack: () => void;
}

const BibleChapterList: React.FC<BibleChapterListProps> = ({ 
  book, 
  onSelectChapter, 
  onBack 
}) => {
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-bible-bg font-newsreader text-bible-text">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-bible-border">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Read Scripture</h1>
          </div>
        </div>
      </div>

      <main className="flex flex-1 justify-center py-8 sm:py-12">
        <div className="w-full max-w-4xl px-4 sm:px-6">
          <div className="mb-8 flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="flex items-center justify-center rounded-full bg-white text-bible-text shadow-sm hover:bg-bible-bg"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-4xl font-bold tracking-tight">{book.name}</h2>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm sm:p-6">
            <h3 className="mb-6 text-2xl font-semibold tracking-tight">Chapters</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {chapters.map((chapter, index) => (
                <motion.div
                  key={chapter}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Button
                    variant="outline"
                    className="group flex items-center justify-center rounded-md border border-bible-border bg-white p-4 text-center text-lg font-medium transition-all hover:border-primary hover:bg-primary hover:text-white hover:shadow-lg"
                    onClick={() => onSelectChapter(chapter)}
                  >
                    {chapter}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BibleChapterList;