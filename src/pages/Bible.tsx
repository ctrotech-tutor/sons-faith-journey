
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BookOpen, Globe, AlertCircle, Loader2 } from 'lucide-react';
import { useActivitySync } from '@/lib/hooks/useActivitySync';

interface BibleVerse {
  chapter: number;
  verse: number;
  text: string;
}

const Bible = () => {
  const { passage, day } = useParams();
  const navigate = useNavigate();
  const { logActivity } = useActivitySync();
  const [selectedVersion, setSelectedVersion] = useState('kjv');
  const [chapterData, setChapterData] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [bookName, setBookName] = useState('');
  const [chapterNumber, setChapterNumber] = useState(1);

  const bibleVersions = [
    { value: 'kjv', label: 'King James Version (KJV)' },
    { value: 'esv', label: 'English Standard Version (ESV)' },
    { value: 'niv', label: 'New International Version (NIV)' },
    { value: 'nlt', label: 'New Living Translation (NLT)' },
    { value: 'nasb', label: 'New American Standard Bible (NASB)' }
  ];

  useEffect(() => {
    if (passage) {
      loadBibleChapter();
      logBibleReading();
    }
  }, [passage, selectedVersion]);

  const logBibleReading = async () => {
    if (!passage || !day) return;
    
    await logActivity({
      type: 'bible_reading',
      timestamp: new Date(),
      data: { passage, day, version: selectedVersion }
    });
  };

  const parsePassage = (passage: string) => {
    const decodedPassage = decodeURIComponent(passage);
    const parts = decodedPassage.trim().split(' ');
    
    let bookName = '';
    let chapterRange = '';
    
    if (parts[0].match(/^\d/)) {
      bookName = parts[0] + ' ' + parts[1];
      chapterRange = parts[2] || '1';
    } else {
      bookName = parts[0];
      chapterRange = parts[1] || '1';
    }
    
    const chapterNumber = parseInt(chapterRange.split('-')[0]);
    
    return { bookName, chapterNumber };
  };

  const loadBibleChapter = async () => {
    if (!passage) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { bookName: parsedBookName, chapterNumber: parsedChapter } = parsePassage(passage);
      
      setBookName(parsedBookName);
      setChapterNumber(parsedChapter);

      // Using Bible API (https://bible-api.com/)
      const response = await fetch(`https://bible-api.com/${parsedBookName}+${parsedChapter}?translation=${selectedVersion}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Bible data');
      }
      
      const data = await response.json();
      
      if (!data.verses || data.verses.length === 0) {
        setError(`Chapter ${parsedChapter} not found in ${parsedBookName}.`);
        setLoading(false);
        return;
      }
      
      const versesArray: BibleVerse[] = data.verses.map((verse: any) => ({
        chapter: parsedChapter,
        verse: verse.verse,
        text: verse.text.trim()
      }));
      
      setChapterData(versesArray);
      
    } catch (error) {
      console.error('Error loading Bible chapter:', error);
      setError('Failed to load the requested passage. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Scripture...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <Card className="shadow-xl">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Passage</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => navigate('/reading')} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Reading
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
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
                  {bibleVersions.map((version) => (
                    <SelectItem key={version.value} value={version.value}>
                      {version.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {bookName} {chapterNumber}
            </h1>
            <p className="text-lg text-purple-600">
              Day {day} Reading • {bibleVersions.find(v => v.value === selectedVersion)?.label}
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
            {chapterData.length > 0 ? (
              <div className="space-y-4">
                {chapterData.map((verse, index) => (
                  <motion.div
                    key={`${verse.chapter}-${verse.verse}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="flex space-x-3"
                  >
                    <span className="text-purple-600 font-bold text-sm mt-1 min-w-[2rem] flex-shrink-0">
                      {verse.verse}
                    </span>
                    <p className="text-gray-800 leading-relaxed text-lg">
                      {verse.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No verses found for this chapter.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Bible;
