
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Clock, Settings } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useActivitySync } from '@/lib/hooks/useActivitySync';

// Bible versions mapping
const bibleVersions = {
  'en_kjv': 'King James Version (KJV)',
  'en_bbe': 'Bible in Basic English',
  'es_rvr': 'Reina-Valera (Spanish)',
  'fr_apee': 'French Bible',
  'pt_aa': 'Portuguese Bible',
  'de_schlachter': 'German Schlachter',
  'zh_cuv': 'Chinese Union Version',
  'ar_svd': 'Arabic Bible'
};

interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

const BiblePage = () => {
  const { passage, day } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackBibleReading } = useActivitySync();
  const [selectedVersion, setSelectedVersion] = useState('en_kjv');
  const [bibleText, setBibleText] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [readingTime, setReadingTime] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (passage) {
      loadBibleText(passage, selectedVersion);
    }
  }, [passage, selectedVersion]);

  useEffect(() => {
    const interval = setInterval(() => {
      setReadingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => {
      clearInterval(interval);
      // Track reading time when component unmounts
      if (user && day) {
        trackBibleReading(parseInt(day), Math.floor((Date.now() - startTime) / 1000));
      }
    };
  }, [user, day, startTime, trackBibleReading]);

  const loadBibleText = async (passageRef: string, version: string) => {
    setLoading(true);
    try {
      // Parse passage reference (e.g., "Genesis 1-2" or "Psalm 23")
      const cleanPassage = passageRef.replace(/[^\w\s:-]/g, '');
      const parts = cleanPassage.split(' ');
      const book = parts[0];
      const chapterRange = parts[1];

      // Load the Bible JSON data
      const response = await fetch(`/src/data/json/${version}.json`);
      const bibleData = await response.json();

      // Find the book in the Bible data
      const bookData = bibleData.find((b: any) => 
        b.name.toLowerCase().includes(book.toLowerCase()) ||
        book.toLowerCase().includes(b.name.toLowerCase().substring(0, 3))
      );

      if (!bookData) {
        throw new Error(`Book ${book} not found`);
      }

      const verses: BibleVerse[] = [];
      
      if (chapterRange.includes('-')) {
        // Handle chapter ranges like "1-2"
        const [startChapter, endChapter] = chapterRange.split('-').map(Number);
        for (let chapterNum = startChapter; chapterNum <= endChapter; chapterNum++) {
          const chapter = bookData.chapters.find((c: any) => c.chapter === chapterNum);
          if (chapter) {
            chapter.verses.forEach((verse: any) => {
              verses.push({
                book: bookData.name,
                chapter: chapterNum,
                verse: verse.verse,
                text: verse.text
              });
            });
          }
        }
      } else {
        // Handle single chapter
        const chapterNum = parseInt(chapterRange);
        const chapter = bookData.chapters.find((c: any) => c.chapter === chapterNum);
        if (chapter) {
          chapter.verses.forEach((verse: any) => {
            verses.push({
              book: bookData.name,
              chapter: chapterNum,
              verse: verse.verse,
              text: verse.text
            });
          });
        }
      }

      setBibleText(verses);
    } catch (error) {
      console.error('Error loading Bible text:', error);
      // Fallback text
      setBibleText([{
        book: passage || 'Unknown',
        chapter: 1,
        verse: 1,
        text: 'Unable to load Bible text. Please try again later.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatReadingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <Card className="shadow-xl">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Bible Reading</h2>
              <p className="text-lg text-gray-600 mb-8">
                Please sign in to access the Bible reading feature.
              </p>
              <Button onClick={() => navigate('/reading')} className="bg-purple-600 hover:bg-purple-700">
                Back to Reading Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/reading')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Reading Plan</span>
            </Button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{formatReadingTime(readingTime)}</span>
              </div>
              {day && (
                <Badge className="bg-purple-600 text-white">
                  Day {day}
                </Badge>
              )}
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {passage?.replace(/-/g, '-')}
            </h1>
            <p className="text-lg text-gray-600">Bible Reading</p>
          </div>
        </motion.div>

        {/* Version Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Bible Version:</span>
              </div>
              <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(bibleVersions).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bible Text */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span>{passage}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Bible text...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bibleText.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {bibleText[0].book} Chapter {bibleText[0].chapter}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {bibleVersions[selectedVersion as keyof typeof bibleVersions]}
                    </p>
                  </div>
                )}
                
                <div className="space-y-3">
                  {bibleText.map((verse, index) => (
                    <motion.div
                      key={`${verse.chapter}-${verse.verse}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Badge variant="outline" className="text-xs min-w-[40px] text-center">
                        {verse.verse}
                      </Badge>
                      <p className="text-gray-800 leading-relaxed flex-1">
                        {verse.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reading Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Continue reading to strengthen your faith and grow in God's Word
              </p>
              <Button
                onClick={() => navigate('/reading')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Return to Reading Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BiblePage;
