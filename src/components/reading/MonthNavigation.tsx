
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, BookOpen, Calendar } from 'lucide-react';
import { getThemeForMonth } from '@/data/readingPlan';

interface MonthNavigationProps {
  currentMonth: number;
  onMonthChange: (month: number) => void;
  totalDaysCompleted: number;
}

const MonthNavigation = ({ currentMonth, onMonthChange, totalDaysCompleted }: MonthNavigationProps) => {
  const months = [
    { number: 1, name: 'June', days: '1-30', color: 'purple' },
    { number: 2, name: 'July', days: '31-60', color: 'blue' },
    { number: 3, name: 'August', days: '61-90', color: 'green' }
  ];

  const getProgressForMonth = (monthNum: number) => {
    const startDay = (monthNum - 1) * 30 + 1;
    const endDay = monthNum * 30;
    const completedInMonth = Math.max(0, Math.min(30, totalDaysCompleted - startDay + 1));
    return (completedInMonth / 30) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          90-Day Bible Journey
        </h1>
        <p className="text-lg text-purple-600 font-semibold">
          {getThemeForMonth(currentMonth)}
        </p>
      </motion.div>

      {/* Month Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {months.map((month) => {
          const isActive = currentMonth === month.number;
          const progress = getProgressForMonth(month.number);
          
          return (
            <motion.div
              key={month.number}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 ${
                  isActive 
                    ? `ring-2 ring-${month.color}-500 shadow-lg bg-${month.color}-50` 
                    : 'hover:shadow-md'
                }`}
                onClick={() => onMonthChange(month.number)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{month.name}</h3>
                      <p className="text-sm text-gray-600">Days {month.days}</p>
                    </div>
                    <div className={`p-2 rounded-full bg-${month.color}-100`}>
                      <Calendar className={`h-5 w-5 text-${month.color}-600`} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-${month.color}-600 h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-3">
                    Theme: {getThemeForMonth(month.number)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          onClick={() => onMonthChange(Math.max(1, currentMonth - 1))}
          disabled={currentMonth === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous Month
        </Button>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            Month {currentMonth}
          </div>
          <div className="text-sm text-gray-600">
            {months[currentMonth - 1]?.name}
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={() => onMonthChange(Math.min(3, currentMonth + 1))}
          disabled={currentMonth === 3}
        >
          Next Month
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default MonthNavigation;
