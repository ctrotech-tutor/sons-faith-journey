import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import { BibleBook } from "@/data/bibleBooks";

interface BibleChapterListProps {
  book: BibleBook;
  onSelectChapter: (chapter: number) => void;
  onBack: () => void;
}

const BibleChapterList: React.FC<BibleChapterListProps> = ({
  book,
  onSelectChapter,
  onBack,
}) => {
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-newsreader text-bible-text">
      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 left-0 w-full z-40 backdrop-blur-md bg-white/70 dark:bg-gray-900/60 border-b border-white/20 dark:border-white/10 shadow-sm"
      >
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-black dark:text-white ripple-effect rounded-full w-8 h-8 bg-transparent active:bg-purple-600 active:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-4xl font-bold tracking-tight">{book.name}</h2>
            <span className="text-lg text-bible-muted">({book.shortName})</span>
          </div>
        </div>
      </motion.div>

      <main className="flex flex-1 justify-center py-8 sm:py-12">
        <div className="w-full max-w-4xl px-4 sm:px-6">
          <div className="rounded-lg bg-white p-4 shadow-sm sm:p-6">
            <h3 className="mb-6 text-2xl font-semibold tracking-tight">
              <span>{book.chapters}</span>{" "}
              <span>{book.chapters === 1 ? "chapter" : "chapters"}</span>
            </h3>
            <div className="grid grid-cols-5 gap-4 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-5">
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
