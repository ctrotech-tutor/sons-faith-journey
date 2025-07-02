
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {book.name}
          </h1>
          <p className="text-sm text-purple-600 dark:text-purple-400">
            {book.testament} Testament • {book.category} • {book.chapters} chapters
          </p>
        </div>
      </motion.div>

      {/* Book Info Card */}
      <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Choose a Chapter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
            {chapters.map((chapter, index) => (
              <motion.div
                key={chapter}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-12 text-sm font-medium hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-900/20"
                  onClick={() => onSelectChapter(chapter)}
                >
                  {chapter}
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Access for Common Chapters */}
      {book.chapters > 20 && (
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg">Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                variant="secondary"
                onClick={() => onSelectChapter(1)}
                className="flex flex-col h-16"
              >
                <span className="text-lg font-bold">1</span>
                <span className="text-xs">First</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => onSelectChapter(Math.floor(book.chapters / 4))}
                className="flex flex-col h-16"
              >
                <span className="text-lg font-bold">{Math.floor(book.chapters / 4)}</span>
                <span className="text-xs">Quarter</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => onSelectChapter(Math.floor(book.chapters / 2))}
                className="flex flex-col h-16"
              >
                <span className="text-lg font-bold">{Math.floor(book.chapters / 2)}</span>
                <span className="text-xs">Middle</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => onSelectChapter(book.chapters)}
                className="flex flex-col h-16"
              >
                <span className="text-lg font-bold">{book.chapters}</span>
                <span className="text-xs">Last</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BibleChapterList;
