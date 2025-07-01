
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Type, Palette, Settings } from 'lucide-react';
import { BibleChapter, BibleVerse } from '@/lib/bibleStorage';

interface BibleReaderProps {
  chapter: BibleChapter;
  onVerseSelect?: (verse: BibleVerse) => void;
  highlightedVerses?: number[];
}

const BibleReader = ({ chapter, onVerseSelect, highlightedVerses = [] }: BibleReaderProps) => {
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleVerseClick = (verse: BibleVerse) => {
    setSelectedVerse(verse.verse);
    onVerseSelect?.(verse);
  };

  const adjustFontSize = (increment: number) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + increment)));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Reader Controls */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold">
            {chapter.book} {chapter.chapter}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustFontSize(-1)}
              className="h-8 w-8 p-0"
            >
              <Type className="h-3 w-3" />
              <span className="sr-only">Decrease font size</span>
            </Button>
            <span className="text-sm text-gray-600 min-w-[2rem] text-center">
              {fontSize}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustFontSize(1)}
              className="h-8 w-8 p-0"
            >
              <Type className="h-4 w-4" />
              <span className="sr-only">Increase font size</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Bible Text */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-6">
          <div className="space-y-4">
            {chapter.verses.map((verse, index) => (
              <motion.div
                key={verse.verse}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`flex space-x-3 cursor-pointer rounded-lg p-2 transition-colors ${
                  selectedVerse === verse.verse
                    ? 'bg-purple-100 dark:bg-purple-900/30'
                    : highlightedVerses.includes(verse.verse)
                    ? 'bg-yellow-100 dark:bg-yellow-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleVerseClick(verse)}
              >
                <span className="text-purple-600 dark:text-purple-400 font-bold text-sm mt-1 min-w-[2rem] flex-shrink-0">
                  {verse.verse}
                </span>
                <p 
                  className="text-gray-800 dark:text-gray-200 leading-relaxed"
                  style={{ 
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight
                  }}
                >
                  {verse.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default BibleReader;
