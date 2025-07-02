
import { Card } from '@/components/ui/card';
import BibleReader from './BibleReader';
import { BibleChapter } from '@/lib/bibleStorage';

interface BibleContentProps {
  chapter: BibleChapter | null;
  book: string;
  chapterNumber: number;
}

const BibleContent = ({ chapter, book, chapterNumber }: BibleContentProps) => {
  if (!chapter) {
    return (
      <div className="lg:col-span-3">
        <Card className="shadow-xl dark:bg-gray-800 dark:border-gray-700 min-h-96 flex items-center justify-center">
          <div className="text-center p-8">
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">
              Welcome to the Bible
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Select a book and chapter to start reading
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="lg:col-span-3">
      <Card className="shadow-xl dark:bg-gray-800 dark:border-gray-700">
        <BibleReader
          chapter={chapter}
          onVerseSelect={(verse) => {
            console.log('Verse selected:', verse);
          }}
          highlightedVerses={[]}
        />
      </Card>
    </div>
  );
};

export default BibleContent;
