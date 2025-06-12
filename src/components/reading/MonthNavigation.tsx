
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, BookOpen, Calendar } from 'lucide-react';
import { getThemeForMonth } from '@/data/readingPlan';
import { useActivitySync } from '@/lib/hooks/useActivitySync'

interface MonthNavigationProps {
  currentMonth: number;
  onMonthChange: (month: number) => void;
  totalDaysCompleted: number;
}

const MonthNavigation = ({ currentMonth, onMonthChange, totalDaysCompleted }: MonthNavigationProps) => {
  const { getTodayDayNumber } = useActivitySync();

  const todayDay = getTodayDayNumber();

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

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const currentCard = cardRefs.current[currentMonth - 1];
    currentCard?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [currentMonth]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-left"
      >
        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight drop-shadow-sm">
          Day {todayDay} of 90: Grow in the Word
        </h1>
        <p className="text-sm md:text-base font-semibold text-primary mt-1 tracking-wide">
          <span>Theme:</span> {getThemeForMonth(currentMonth)}
        </p>
      </motion.div>



      {/* Month Carousel */}
      <div ref={containerRef} className="overflow-x-auto py-2 px-1 md:hidden flex gap-4 no-scrollbar">
        {months.map((month, idx) => {
          const isActive = currentMonth === month.number;
          const progress = getProgressForMonth(month.number);

          return (
            <motion.div
              key={month.number}
              ref={(el) => (cardRefs.current[idx] = el)}
              whileHover={{ scale: 1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onMonthChange(month.number)}
              className={`min-w-[90%] snap-start transition-all duration-300 ${isActive ? '' : ''
                }`}
            >
              <Card
                className={`
            rounded-2xl backdrop-blur-md bg-white/30 dark:bg-black/30
            border border-gray-200 dark:border-gray-700
            shadow-xl dark:shadow-md transition-all duration-300
            ${isActive ? 'ring-1 ring-purple-500 dark:ring-purple-400' : 'hover:ring-purple-400'}
          `}
              >
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{month.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Days {month.days}</p>
                    </div>
                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2 rounded-full bg-purple-600 dark:bg-purple-400 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Theme: {getThemeForMonth(month.number)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Grid View for Larger Screens */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {months.map((month) => {
          const isActive = currentMonth === month.number;
          const progress = getProgressForMonth(month.number);

          return (
            <motion.div
              key={month.number}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onMonthChange(month.number)}
              className={`transition-all duration-300 ${isActive ? 'scale-[1.01]' : ''}`}
            >
              <Card
                className={`
            rounded-2xl backdrop-blur-md bg-white/30 dark:bg-black/30
            border border-gray-200 dark:border-gray-700
            shadow-xl dark:shadow-md transition-all duration-300
            ${isActive ? 'ring-2 ring-purple-500 dark:ring-purple-400' : 'hover:ring-1 hover:ring-purple-400'}
          `}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{month.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Days {month.days}</p>
                    </div>
                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2 rounded-full bg-purple-600 dark:bg-purple-400 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Theme: {getThemeForMonth(month.number)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center space-x-4 mt-6">
        <Button
          variant="outline"
          className="text-xs"
          onClick={() => onMonthChange(Math.max(1, currentMonth - 1))}
          disabled={currentMonth === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Prev
        </Button>

        <div className="text-center">
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
            Month {currentMonth}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {months[currentMonth - 1]?.name}
          </div>
        </div>

        <Button
          variant="outline"
          className="text-xs"
          onClick={() => onMonthChange(Math.min(3, currentMonth + 1))}
          disabled={currentMonth === 3}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

    </div>
  );
};

export default MonthNavigation;
