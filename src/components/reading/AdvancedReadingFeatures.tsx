
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/lib/hooks/use-toast';
import { Heart, BookmarkPlus, Share2, Volume2, Pause, Play, RotateCcw, MessageSquare, Lightbulb, Target, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReadingNote {
  id: string;
  passage: string;
  note: string;
  timestamp: Date;
  tags: string[];
}

interface ReadingTimer {
  startTime: Date | null;
  elapsedTime: number;
  isActive: boolean;
}

interface AdvancedReadingFeaturesProps {
  passage: string;
  day: number;
  onUpdateProgress: (progress: any) => void;
}

const AdvancedReadingFeatures = ({ passage, day, onUpdateProgress }: AdvancedReadingFeaturesProps) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<ReadingNote[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [timer, setTimer] = useState<ReadingTimer>({
    startTime: null,
    elapsedTime: 0,
    isActive: false
  });
  const [readingGoals, setReadingGoals] = useState({
    dailyMinutes: 15,
    weeklyDays: 5,
    currentStreak: 0
  });
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [reflectionPrompts] = useState([
    "What is God trying to teach me through this passage?",
    "How can I apply this to my daily life?",
    "What challenges does this passage present?",
    "What comfort or encouragement do I find here?",
    "How does this relate to other scriptures I know?"
  ]);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer.isActive) {
      interval = setInterval(() => {
        setTimer(prev => ({
          ...prev,
          elapsedTime: prev.startTime ? 
            Math.floor((Date.now() - prev.startTime.getTime()) / 1000) + prev.elapsedTime : 
            prev.elapsedTime + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer.isActive, timer.startTime]);

  const startTimer = () => {
    setTimer({
      startTime: new Date(),
      elapsedTime: timer.elapsedTime,
      isActive: true
    });
  };

  const pauseTimer = () => {
    setTimer(prev => ({
      startTime: null,
      elapsedTime: prev.elapsedTime,
      isActive: false
    }));
  };

  const resetTimer = () => {
    setTimer({
      startTime: null,
      elapsedTime: 0,
      isActive: false
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addNote = () => {
    if (!currentNote.trim()) return;

    const newNote: ReadingNote = {
      id: Date.now().toString(),
      passage,
      note: currentNote,
      timestamp: new Date(),
      tags: ['personal', `day-${day}`]
    };

    setNotes(prev => [newNote, ...prev]);
    setCurrentNote('');
    
    toast({
      title: 'Note Added',
      description: 'Your reflection has been saved.'
    });
  };

  const toggleFavorite = () => {
    const passageId = `${day}-${passage}`;
    setFavorites(prev => 
      prev.includes(passageId) 
        ? prev.filter(id => id !== passageId)
        : [...prev, passageId]
    );
    
    toast({
      title: favorites.includes(`${day}-${passage}`) ? 'Removed from Favorites' : 'Added to Favorites',
      description: favorites.includes(`${day}-${passage}`) 
        ? 'Passage removed from your favorites' 
        : 'Passage added to your favorites'
    });
  };

  const sharePassage = async () => {
    try {
      await navigator.share({
        title: `Day ${day} Reading`,
        text: passage,
        url: window.location.href
      });
    } catch (error) {
      await navigator.clipboard.writeText(`Day ${day}: ${passage}\n\n${window.location.href}`);
      toast({
        title: 'Copied to Clipboard',
        description: 'Passage details copied to clipboard.'
      });
    }
  };

  const toggleAudio = () => {
    // This would integrate with a text-to-speech API
    setIsAudioPlaying(!isAudioPlaying);
    toast({
      title: isAudioPlaying ? 'Audio Stopped' : 'Audio Started',
      description: isAudioPlaying ? 'Audio reading stopped.' : 'Audio reading started.'
    });
  };

  const progressPercent = Math.min((timer.elapsedTime / (readingGoals.dailyMinutes * 60)) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Reading Timer & Progress */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Reading Session</h3>
              <p className="text-purple-100">Stay focused on God's word</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{formatTime(timer.elapsedTime)}</div>
              <p className="text-sm text-purple-100">
                Goal: {readingGoals.dailyMinutes} minutes
              </p>
            </div>
          </div>
          
          <Progress value={progressPercent} className="mb-4 bg-white/20" />
          
          <div className="flex space-x-2">
            {!timer.isActive ? (
              <Button onClick={startTimer} size="sm" className="bg-white text-purple-600 hover:bg-gray-100">
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button onClick={pauseTimer} size="sm" className="bg-white text-purple-600 hover:bg-gray-100">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            <Button onClick={resetTimer} size="sm" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reading Tools */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              onClick={toggleFavorite}
              variant={favorites.includes(`${day}-${passage}`) ? "default" : "outline"}
              size="sm"
            >
              <Heart className={`h-4 w-4 mr-2 ${favorites.includes(`${day}-${passage}`) ? 'fill-current' : ''}`} />
              Favorite
            </Button>
            <Button onClick={sharePassage} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={toggleAudio} variant="outline" size="sm">
              <Volume2 className="h-4 w-4 mr-2" />
              {isAudioPlaying ? 'Stop Audio' : 'Listen'}
            </Button>
            <Button variant="outline" size="sm">
              <BookmarkPlus className="h-4 w-4 mr-2" />
              Bookmark
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reflection Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Reflection Prompts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {reflectionPrompts.map((prompt, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={selectedPrompt === prompt ? "default" : "outline"}
                  className="w-full text-left justify-start h-auto p-3"
                  onClick={() => setSelectedPrompt(selectedPrompt === prompt ? null : prompt)}
                >
                  <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{prompt}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>My Reflections & Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedPrompt && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 mb-2">Reflecting on:</p>
              <p className="font-medium text-blue-900">{selectedPrompt}</p>
            </div>
          )}
          
          <div className="flex flex-col space-y-3">
            <Textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder={selectedPrompt || "Write your thoughts, insights, or prayers about this passage..."}
              rows={4}
            />
            <Button onClick={addNote} disabled={!currentNote.trim()}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Save Note
            </Button>
          </div>

          {notes.length > 0 && (
            <div className="space-y-3 mt-6">
              <h4 className="font-medium text-gray-900">Previous Notes</h4>
              {notes.slice(0, 3).map((note) => (
                <div key={note.id} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{note.note}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex space-x-2">
                      {note.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {note.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reading Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-500" />
            <span>Reading Goals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{Math.floor(timer.elapsedTime / 60)}</div>
              <p className="text-sm text-gray-600">Minutes Today</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{readingGoals.currentStreak}</div>
              <p className="text-sm text-gray-600">Day Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedReadingFeatures;
