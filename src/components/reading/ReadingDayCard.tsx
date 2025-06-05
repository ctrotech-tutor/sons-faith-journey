
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, BookOpen, Calendar, Lock } from 'lucide-react';
import { ReadingDay } from '@/data/readingPlan';
import { useNavigate } from 'react-router-dom';

interface ReadingDayCardProps {
  dayData: ReadingDay;
  isCompleted: boolean;
  isToday: boolean;
  isLocked: boolean;
  onToggleComplete: (completed: boolean) => void;
  animationDelay: number;
}

const ReadingDayCard = ({ 
  dayData, 
  isCompleted, 
  isToday, 
  isLocked,
  onToggleComplete, 
  animationDelay 
}: ReadingDayCardProps) => {
  const navigate = useNavigate();

  const handlePassageClick = (passage: string) => {
    if (isLocked) return;
    navigate(`/bible/${encodeURIComponent(passage)}/${dayData.day}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      className="h-full"
    >
      <Card className={`h-full transition-all duration-300 hover:shadow-lg ${
        isLocked
          ? 'opacity-60 bg-gray-50 border-gray-200'
          : isToday 
          ? 'ring-2 ring-purple-500 shadow-purple-100' 
          : isCompleted 
          ? 'bg-green-50 border-green-200' 
          : 'hover:shadow-md'
      }`}>
        <CardContent className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {isLocked ? (
                <Lock className="h-4 w-4 text-gray-400" />
              ) : (
                <Calendar className="h-4 w-4 text-purple-600" />
              )}
              <span className="text-sm font-medium text-gray-600">Day {dayData.day}</span>
            </div>
            <div className="flex items-center space-x-2">
              {isToday && !isLocked && (
                <Badge className="bg-purple-600 text-white text-xs">Today</Badge>
              )}
              {isLocked && (
                <Badge variant="outline" className="text-xs text-gray-500">Locked</Badge>
              )}
              {isCompleted && !isLocked && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
          </div>

          {/* Date */}
          <div className="mb-3">
            <p className="text-sm text-gray-500">
              {new Date(dayData.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Theme */}
          <div className="mb-4">
            <Badge variant="outline" className="text-xs">
              {dayData.theme}
            </Badge>
          </div>

          {/* Passages */}
          <div className="flex-1 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Today's Reading</span>
            </div>
            <div className="space-y-1">
              {dayData.passages.map((passage, index) => (
                <button
                  key={index}
                  onClick={() => handlePassageClick(passage)}
                  disabled={isLocked}
                  className={`w-full text-left text-sm p-2 rounded transition-colors ${
                    isLocked 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-700 cursor-pointer'
                  }`}
                >
                  {passage}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => onToggleComplete(!isCompleted)}
            disabled={isLocked}
            variant={isCompleted ? "outline" : "default"}
            className={`w-full ${
              isLocked
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isCompleted 
                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isLocked ? (
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
