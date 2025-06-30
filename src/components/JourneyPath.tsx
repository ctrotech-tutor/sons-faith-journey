'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { BookOpen, Heart, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const JourneyPath = () => {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })

  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1])
  const opacity = useTransform(scrollYProgress, [0, 1], [0.9, 1])

  return (
    <section ref={sectionRef} className="relative mt-[4rem]">
      <h3 className="text-3xl md:text-4xl font-bold text-center mb-14 bg-gradient-to-r from-purple-500 via-purple-700 to-fuchsia-600 bg-clip-text text-transparent">
        Your 90-Day Path
      </h3>

      {/* Line connector (Desktop only) */}
      <div className="hidden md:block absolute top-[10.5rem] left-1/2 transform -translate-x-1/2 h-[calc(100%-11rem)] w-1 bg-gradient-to-b from-purple-200 via-blue-200 to-green-200 dark:from-purple-700 dark:via-blue-700 dark:to-green-700 z-0 rounded-full" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {[ // Card Data Array
          {
            icon: <BookOpen className="h-8 w-8 text-purple-800 dark:text-purple-100" />,
            title: 'Month 1: Knowing God',
            description: `Foundation building through understanding God's character and nature`,
            gradient: 'from-purple-200 to-purple-400 dark:from-purple-700 dark:to-purple-900',
            border: 'border-purple-200 dark:border-purple-800'
          },
          {
            icon: <Heart className="h-8 w-8 text-blue-800 dark:text-blue-100" />,
            title: 'Month 2: Walking with God',
            description: `Developing daily practices and deepening your relationship`,
            gradient: 'from-blue-200 to-blue-400 dark:from-blue-700 dark:to-blue-900',
            border: 'border-blue-200 dark:border-blue-800'
          },
          {
            icon: <Users className="h-8 w-8 text-green-800 dark:text-green-100" />,
            title: 'Month 3: Serving God',
            description: `Living out your faith through service and community impact`,
            gradient: 'from-green-200 to-green-400 dark:from-green-700 dark:to-green-900',
            border: 'border-green-200 dark:border-green-800'
          }
        ].map((item, i) => (
          <motion.div
            key={i}
            style={{ scale, opacity }}
            className={`text-center bg-white dark:bg-gray-900/60 backdrop-blur-md border ${item.border} rounded-2xl shadow-lg hover:shadow-xl transition`}
          >
            <CardContent className="p-8">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr ${item.gradient} flex items-center justify-center shadow-inner`}>
                {item.icon}
              </div>
              <h4 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{item.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
            </CardContent>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default JourneyPath
