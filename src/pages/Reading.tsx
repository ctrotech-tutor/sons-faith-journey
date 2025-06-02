import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import dayjs from 'dayjs'
import { cn } from '@/lib/utils'
import EnkvBibleData from '@/data/json/en_kjv.json'
import { CheckCircle, Lock, BookOpen, ArrowLeftRight } from 'lucide-react'
import { readingPlan } from '@/data/readingPlan'

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
      className="whitespace-pre-wrap text-sm text-gray-800"
      dangerouslySetInnerHTML={{ __html: line }}
    />
  ))
}

export default function ReadingPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<number[]>([]);
  const [openDay, setOpenDay] = useState<number | null>(null);
  const today = dayjs().format("YYYY-MM-DD");

  const todayPlan = readingPlan.find((plan) => plan.date === today);

  // 🔄 Fetch reading progress
  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProgress(data.readingProgress || []);
        } else {
          console.warn("User document does not exist");
        }
      } catch (error) {
        console.error("Error fetching reading progress:", error);
      }
    };

    fetchProgress();
  }, [user]);


  // ✅ Toggle completion state
  const toggleComplete = async (day: number) => {
    if (!user) return;

    try {
      const isDone = progress.includes(day);
      const newProgress = isDone
        ? progress.filter((d) => d !== day)
        : [...new Set([...progress, day])];

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        readingProgress: newProgress,
      });

      setProgress(newProgress);
    } catch (error) {
      console.error("Error updating reading progress:", error);
    }
  };

  return (
    <main className="p-4 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center text-gray-800">📖 June Bible Journey: <span className="text-blue-700">Knowing God</span></h1>

      {readingPlan.map(({ day, date, passages }) => {
        const isTodayOrEarlier = dayjs().isAfter(dayjs(date), 'day') || dayjs().isSame(dayjs(date), 'day')
        const isCompleted = progress.includes(day)

        return (
          <div
            key={day}
            className={cn(
              'rounded-2xl p-4 border space-y-3 shadow-md backdrop-blur transition-all',
              isTodayOrEarlier ? 'bg-white' : 'bg-gray-100 text-gray-400',
              isCompleted && 'border-green-500 bg-green-50'
            )}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">📆 Day {day}</h2>
                <p className="text-sm text-gray-700 italic">{passages.join('; ')}</p>
              </div>
              {isTodayOrEarlier ? (
                <button
                  onClick={() => toggleComplete(day)}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition',
                    isCompleted
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  )}
                >
                  <ArrowLeftRight size={16} /> {isCompleted ? 'Undo' : 'Mark Read'}
                </button>
              ) : (
                <span className="flex items-center gap-1 opacity-50">
                  <Lock size={16} /> Locked
                </span>
              )}
            </div>

            {isTodayOrEarlier && (
              <div>
                <button
                  className="text-sm text-blue-700 flex items-center gap-1 hover:underline"
                  onClick={() => setOpenDay(openDay === day ? null : day)}
                >
                  <BookOpen size={16} /> {openDay === day ? 'Hide' : 'Read & Reflect'}
                </button>

                {openDay === day && (
                  <div className="mt-3 space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg border text-sm">
                      {passages.map((p, i) => (
                        <div key={i} className="mb-4">
                          <h3 className="text-base font-bold text-gray-800 mb-1">📜 {p}</h3>
                          <div className="bg-white p-2 rounded overflow-x-auto shadow-inner text-xs">
                            {formatBibleText(getPassageText(p))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="h-1 w-full bg-gray-200 rounded overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all"
                style={{ width: isCompleted ? '100%' : '0%' }}
              />
            </div>
          </div>
        )
      })}
    </main>
  )
}
