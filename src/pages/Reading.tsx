
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useActivitySync } from '@/lib/hooks/useActivitySync'
import dayjs from 'dayjs'
import { cn } from '@/lib/utils'
import EnkvBibleData from '@/data/json/en_kjv.json'
import { CheckCircle, Lock, BookOpen, ArrowLeftRight, Sparkles } from 'lucide-react'
import { readingPlan } from '@/data/readingPlan'
import { Book } from '@/types/bible'
import AdvancedReadingFeatures from '@/components/reading/AdvancedReadingFeatures'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'

function getPassageText(passage: string): string {
  const [bookName, chapterRange] = passage.split(' ')
  const book = EnkvBibleData.find(
    (b: Book) =>
      b.name.toLowerCase() === bookName.toLowerCase() ||
      b.abbrev.toLowerCase() === bookName.toLowerCase()
  )

  if (!book || !chapterRange) return '❗ Passage not found.'

  const [startStr, endStr] = chapterRange.split('-')
  const start = parseInt(startStr, 10)
  const end = endStr ? parseInt(endStr, 10) : start

  let text = ''
  for (let ch = start; ch <= end; ch++) {
    const chapterIndex = ch - 1
    const verses = book.chapters[chapterIndex]
    if (!verses) continue
    text += `\n📖 <strong class="text-lg text-gray-800">${book.name} Chapter ${ch}</strong>\n`
    verses.forEach((v, i) => {
      text += `<span class="text-gray-700"><span class="text-green-600 font-semibold">${i + 1}</span>. ${v}</span>\n`
    })
  }
  return text.trim()
}

function formatBibleText(text: string): JSX.Element[] {
  const lines = text.split('\n')
  return lines.map((line, index) => (
    <p
      key={index}
      className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: line }}
    />
  ))
}

export default function ReadingPage() {
  const { user } = useAuth();
  const { userStats, updateReadingProgress } = useActivitySync();
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState<number | null>(null);
  const today = dayjs().format("YYYY-MM-DD");

  const todayPlan = readingPlan.find((plan) => plan.date === today);

  // ✅ Toggle completion state using integrated system
  const toggleComplete = async (day: number) => {
    if (!user) return;

    const isDone = userStats.readingProgress.includes(day);
    await updateReadingProgress(day, !isDone);
  };

  return (
    <main className="p-4 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-800"
        >
          📖 June Bible Journey: <span className="text-blue-700">Knowing God</span>
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{userStats.readingStreak}</div>
                <p className="text-purple-100 text-lg">Day Streak</p>
                <div className="mt-3 text-sm">
                  {userStats.totalReadingDays} of 90 days completed
                </div>
                <div className="w-full bg-purple-800/30 rounded-full h-2 mt-3">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{ width: `${(userStats.totalReadingDays / 90) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {readingPlan.map(({ day, date, passages }, index) => {
        const isTodayOrEarlier = dayjs().isAfter(dayjs(date), 'day') || dayjs().isSame(dayjs(date), 'day')
        const isCompleted = userStats.readingProgress.includes(day)
        const isToday = dayjs().isSame(dayjs(date), 'day')

        return (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'rounded-2xl p-6 border space-y-4 shadow-lg backdrop-blur transition-all duration-300',
              isTodayOrEarlier ? 'bg-white hover:shadow-xl' : 'bg-gray-100 text-gray-400',
              isCompleted && 'border-green-500 bg-green-50',
              isToday && 'ring-2 ring-blue-500 ring-opacity-50'
            )}
          >
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-gray-900">📆 Day {day}</h2>
                  {isToday && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">Today</span>}
                  {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                <p className="text-sm text-gray-700 italic font-medium">{passages.join('; ')}</p>
                <p className="text-xs text-gray-500">{dayjs(date).format('MMMM D, YYYY')}</p>
              </div>
              {isTodayOrEarlier ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleComplete(day)}
                    className={cn(
                      'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isCompleted
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                    )}
                  >
                    <ArrowLeftRight size={16} /> {isCompleted ? 'Undo' : 'Mark Read'}
                  </button>
                </div>
              ) : (
                <span className="flex items-center gap-1 opacity-50 text-gray-500">
                  <Lock size={16} /> Locked
                </span>
              )}
            </div>

            {isTodayOrEarlier && (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <button
                    className="text-sm text-blue-700 flex items-center gap-1 hover:underline bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                    onClick={() => setOpenDay(openDay === day ? null : day)}
                  >
                    <BookOpen size={16} /> {openDay === day ? 'Hide Passage' : 'Read Passage'}
                  </button>
                  
                  <button
                    className="text-sm text-purple-700 flex items-center gap-1 hover:underline bg-purple-50 px-3 py-2 rounded-lg transition-colors"
                    onClick={() => setShowAdvancedFeatures(showAdvancedFeatures === day ? null : day)}
                  >
                    <Sparkles size={16} /> {showAdvancedFeatures === day ? 'Hide Tools' : 'Advanced Tools'}
                  </button>
                </div>

                {openDay === day && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border">
                      {passages.map((p, i) => (
                        <div key={i} className="mb-6 last:mb-0">
                          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                            📜 {p}
                          </h3>
                          <div className="bg-white p-4 rounded-lg shadow-inner border max-h-96 overflow-y-auto">
                            <div className="prose prose-sm max-w-none">
                              {formatBibleText(getPassageText(p))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {showAdvancedFeatures === day && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <AdvancedReadingFeatures
                      passage={passages.join('; ')}
                      day={day}
                      onUpdateProgress={(progress) => {
                        // Handle progress updates
                        console.log('Progress updated:', progress);
                      }}
                    />
                  </motion.div>
                )}
              </div>
            )}

            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500"
                initial={{ width: 0 }}
                animate={{ width: isCompleted ? '100%' : '0%' }}
              />
            </div>
          </motion.div>
        )
      })}
    </main>
  )
}
