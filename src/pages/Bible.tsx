
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BookOpen, Globe } from 'lucide-react';
import { useActivitySync } from '@/lib/hooks/useActivitySync';
import bibleVersions from '@/data/json/index.json';

interface BibleVerse {
  chapter: number;
  verse: number;
  text: string;
}

interface BibleChapter {
  [key: string]: BibleVerse[];
}

const Bible = () => {
  const { passage, day } = useParams();
  const navigate = useNavigate();
  const { logActivity } = useActivitySync();
  const [selectedVersion, setSelectedVersion] = useState('en_kjv');
  const [chapterData, setChapterData] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookName, setBookName] = useState('');
  const [chapterNumber, setChapterNumber] = useState(1);

  useEffect(() => {
    if (passage) {
      loadBibleChapter();
      logBibleReading();
    }
  }, [passage, selectedVersion]);

  const logBibleReading = async () => {
    await logActivity({
      type: 'bible_reading',
      timestamp: new Date(),
      data: { passage, day, version: selectedVersion }
    });
  };

  const loadBibleChapter = async () => {
    setLoading(true);
    try {
      // Parse passage (e.g., "Genesis 1-2" -> "Genesis", chapter 1)
      const passageParts = passage?.split(' ');
      if (!passageParts || passageParts.length < 2) return;

      const book = passageParts[0];
      const chapterRange = passageParts[1];
      const firstChapter = parseInt(chapterRange.split('-')[0]);

      setBookName(book);
      setChapterNumber(firstChapter);

      // Load the selected Bible version
      const bibleData = await import(`@/data/json/${selectedVersion}.json`);
      const bookData = bibleData.default[book];

      if (bookData && bookData[firstChapter]) {
        setChapterData(bookData[firstChapter]);
      }
    } catch (error) {
      console.error('Error loading Bible chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVersionName = (abbreviation: string) => {
    for (const lang of bibleVersions) {
      const version = lang.versions.find(v => v.abbreviation === abbreviation);
      if (version) return version.name;
    }
    return abbreviation;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Scripture...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/reading')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Reading</span>
            </Button>

            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-purple-600" />
              <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bibleVersions.map((lang) =>
                    lang.versions.map((version) => (
                      <SelectItem key={version.abbreviation} value={version.abbreviation}>
                        {version.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {bookName} {chapterNumber}
            </h1>
            <p className="text-lg text-purple-600">
              Day {day} Reading • {getVersionName(selectedVersion)}
            </p>
          </div>
        </motion.div>

        {/* Bible Content */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <span>{bookName} Chapter {chapterNumber}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              {chapterData.map((verse, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex space-x-3"
                >
                  <span className="text-purple-600 font-bold text-sm mt-1 min-w-[2rem]">
                    {verse.verse}
                  </span>
                  <p className="text-gray-800 leading-relaxed text-lg">
                    {verse.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Bible;
