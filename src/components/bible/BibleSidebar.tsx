
import { Card } from '@/components/ui/card';
import BibleNavigation from './BibleNavigation';

interface BibleSidebarProps {
  currentBook: string;
  currentChapter: number;
  onNavigate: (book: string, chapter: number) => void;
  onSearch: (query: string) => void;
}

const BibleSidebar = ({ currentBook, currentChapter, onNavigate, onSearch }: BibleSidebarProps) => {
  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-44">
        <BibleNavigation
          currentBook={currentBook}
          currentChapter={currentChapter}
          onNavigate={onNavigate}
          onSearch={onSearch}
        />
      </Card>
    </div>
  );
};

export default BibleSidebar;
