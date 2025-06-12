import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getChallengeDay } from '@/lib/getChallengeDay';
import { useAuth } from '@/lib/hooks/useAuth';

const CountdownTimer = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const targetDate = new Date('June 1, 2025 00:00:00').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setHasStarted(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (hasStarted) {
    const currentDay = getChallengeDay();

    if (currentDay > 90) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center text-white py-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            🎉 You've Completed the 90-Day Bible Reading Challenge!
          </h2>
          <p className="text-lg md:text-xl text-purple-200">
            May God's Word continue to guide and strengthen you every day.
          </p>
        </motion.div>
      );
    }

    if (isAuthenticated) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center text-white py-0"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Day {currentDay} of the 90-Day Challenge
          </h2>
          <p className="text-lg md:text-xl text-purple-200 mb-4">
            Let's grow in the Word together. Today is Day {currentDay}.
          </p>
          <a
            href={`/reading/`}
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Start Day {currentDay} Reading
          </a>
        </motion.div>
      );
    }

    // Unauthenticated user view
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center text-white"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          The 90-Day Bible Reading Challenge Has Started!
        </h2>
        <p className="text-lg md:text-xl text-purple-200">
          Dive into Day 1 and let the journey begin!
        </p>
      </motion.div>
    );
  }

  // Countdown (pre-launch)
  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
      {timeUnits.map((unit, index) => (
        <motion.div
          key={unit.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="text-center"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white/20 shadow-xl">
            <motion.div
              key={unit.value}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-3xl md:text-5xl font-bold text-white mb-2"
            >
              {unit.value.toString().padStart(2, '0')}
            </motion.div>
            <div className="text-purple-200 text-sm md:text-base font-medium">
              {unit.label}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CountdownTimer;
