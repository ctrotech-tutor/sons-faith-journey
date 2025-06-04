
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, BookOpen, Calendar, Lock, ExternalLink } from 'lucide-react';
import { ReadingDay } from '@/data/readingPlan';

interface ReadingDayCardProps {
  dayData: ReadingDay;
  isCompleted: boolean;
  isToday: boolean;
  isUnlocked: boolean;
  onToggleComplete: (completed: boolean) => void;
  animationDelay: number;
}

const ReadingDayCard = ({ 
  dayData, 
  isCompleted, 
  isToday, 
  isUnlocked,
  onToggleComplete, 
  animationDelay 
}: ReadingDayCardProps) => {
  const navigate = useNavigate();

  const handlePassageClick = (passage: string) => {
    if (!isUnlocked) return;
    // Navigate to Bible page with passage and day parameters
    const encodedPassage = encodeURIComponent(passage);
    navigate(`/bible/${encodedPassage}/${dayData.day}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      className="h-full"
    >
      <Card className={`h-full transition-all duration-300 ${
        !isUnlocked
          ? 'opacity-60 bg-gray-50 border-gray-200'
          : isToday 
          ? 'ring-2 ring-purple-500 shadow-purple-100 hover:shadow-lg' 
          : isCompleted 
          ? 'bg-green-50 border-green-200 hover:shadow-lg' 
          : 'hover:shadow-md'
      }`}>
        <CardContent className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {!isUnlocked ? (
                <Lock className="h-4 w-4 text-gray-400" />
              ) : (
                <Calendar className="h-4 w-4 text-purple-600" />
              )}
              <span className={`text-sm font-medium ${
                !isUnlocked ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Day {dayData.day}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {!isUnlocked && (
                <Badge variant="outline" className="bg-gray-100 text-gray-500 text-xs">
                  Locked
                </Badge>
              )}
              {isToday && isUnlocked && (
                <Badge className="bg-purple-600 text-white text-xs">Today</Badge>
              )}
              {isCompleted && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
          </div>

          {/* Date */}
          <div className="mb-3">
            <p className={`text-sm ${
              !isUnlocked ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {new Date(dayData.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Theme */}
          <div className="mb-4">
            <Badge variant="outline" className={`text-xs ${
              !isUnlocked 
                ? 'bg-gray-100 text-gray-400 border-gray-200' 
                : ''
            }`}>
              {dayData.theme}
            </Badge>
          </div>

          {/* Passages */}
          <div className="flex-1 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <BookOpen className={`h-4 w-4 ${
                !isUnlocked ? 'text-gray-400' : 'text-blue-600'
              }`} />
              <span className={`text-sm font-medium ${
                !isUnlocked ? 'text-gray-400' : 'text-gray-700'
              }`}>
                Today's Reading
              </span>
            </div>
            <div className="space-y-2">
              {dayData.passages.map((passage, index) => (
                <div
                  key={index}
                  onClick={() => handlePassageClick(passage)}
                  className={`text-sm p-2 rounded transition-colors ${
                    !isUnlocked 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-700 cursor-pointer border border-transparent hover:border-blue-200'
                  } group`}
                >
                  <div className="flex items-center justify-between">
                    <span>{passage}</span>
                    {isUnlocked && (
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => isUnlocked && onToggleComplete(!isCompleted)}
            disabled={!isUnlocked}
            variant={isCompleted ? "outline" : "default"}
            className={`w-full ${
              !isUnlocked 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200'
                : isCompleted 
                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {!isUnlocked ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Locked
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed
              </>
            ) : (
              <>
                <Circle className="h-4 w-4 mr-2" />
                Mark Complete
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReadingDayCard;
