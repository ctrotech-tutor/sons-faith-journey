
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useActivitySync } from '@/lib/hooks/useActivitySync'
import { motion } from 'framer-motion'
import { readingPlan, getMonthData, getThemeForMonth } from '@/data/readingPlan'
import { Card, CardContent } from '@/components/ui/card'
import MonthNavigation from '@/components/reading/MonthNavigation'
import ReadingDayCard from '@/components/reading/ReadingDayCard'

export default function ReadingPage() {
  const { user } = useAuth();
  const { userStats, updateReadingProgress } = useActivitySync();
  const [currentMonth, setCurrentMonth] = useState(1);

  const monthData = getMonthData(currentMonth);

  if (!user) {
    return (
      <main className="p-4 max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-gray-600">Please sign in to access your reading plan.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-4 max-w-6xl mx-auto space-y-8">
      <MonthNavigation
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        totalDaysCompleted={userStats.totalReadingDays}
      />

      {/* Month Theme Header */}
      <motion.div
        key={currentMonth}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl"
      >
        <h2 className="text-2xl font-bold mb-2">
          Month {currentMonth}: {getThemeForMonth(currentMonth)}
        </h2>
        <p className="text-purple-100">
          {monthData.length} days of spiritual growth and discovery
        </p>
      </motion.div>

      {/* Reading Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {monthData.map((dayData, index) => (
          <ReadingDayCard
            key={dayData.day}
            dayData={dayData}
            isCompleted={userStats.readingProgress.includes(dayData.day)}
            onToggleComplete={(completed) => updateReadingProgress(dayData.day, completed)}
            animationDelay={index * 0.1}
          />
        ))}
      </div>
    </main>
  )
}
