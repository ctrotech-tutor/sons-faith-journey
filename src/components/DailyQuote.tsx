import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, SparklesIcon } from "lucide-react";

const fallbackQuotes = [
  { q: "Iron sharpens iron, and one man sharpens another.", a: "Proverbs 27:17" },
  { q: "Trust in the Lord with all your heart and lean not on your own understanding.", a: "Proverbs 3:5" },
  { q: "I can do all things through Christ who strengthens me.", a: "Philippians 4:13" },
  { q: "Let all that you do be done in love.", a: "1 Corinthians 16:14" },
  { q: "Be strong and courageous. Do not be afraid; do not be discouraged.", a: "Joshua 1:9" },
  { q: "For I know the plans I have for you, declares the Lord.", a: "Jeremiah 29:11" },
  { q: "The Lord is my shepherd; I shall not want.", a: "Psalm 23:1" },
  { q: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", a: "Philippians 4:6" },
];

function getRandomQuotes(n: number) {
  const shuffled = [...fallbackQuotes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

const spring = {
  type: "spring",
  stiffness: 200,
  damping: 25,
};

const QuoteCard = () => {
  const [quotes, setQuotes] = useState<{ q: string; a: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [index, setIndex] = useState(0);

  const fetchQuotes = async () => {
    setLoading(true);
    setError(false);
    try {
      const res1 = await fetch("https://zenquotes.io/api/random");
      const data1 = await res1.json();

      const res2 = await fetch("https://zenquotes.io/api/random");
      const data2 = await res2.json();

      if (
        Array.isArray(data1) &&
        data1[0]?.q &&
        data1[0]?.a &&
        Array.isArray(data2) &&
        data2[0]?.q &&
        data2[0]?.a
      ) {
        setQuotes([data1[0], data2[0]]);
      } else {
        throw new Error("Invalid quote format");
      }
    } catch (err) {
      setQuotes(getRandomQuotes(2));
      setError(true);
    } finally {
      setLoading(false);
      setIndex(0);
    }
  };

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 86400000);
    return () => clearInterval(interval);
  }, []);

  // Swipe left/right to switch quotes on mobile
  const handleDragEnd = (event, info) => {
    if (info.offset.x < -100) {
      setIndex((prev) => (prev + 1) % quotes.length);
    } else if (info.offset.x > 100) {
      setIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
    }
  };

  return (
    <div className="bg-white/70 dark:bg-gray-900/40 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl shadow-inner mb-12">
  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
    <SparklesIcon className="inline-block mr-2 text-yellow-600" /> Daily Quote
  </h2>

  <div className="relative w-full max-w-lg">
    <AnimatePresence mode="wait">
      {!loading && quotes.length > 0 && (
        <motion.blockquote
          key={index}
          className="cursor-grab select-none rounded-3xl bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl shadow-2xl px-8 py-10 text-center text-purple-900 dark:text-purple-200 font-semibold italic text-lg sm:text-xl md:text-2xl transition-all"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.85 }}
          transition={spring}
        >
          “{quotes[index].q}”
          <cite className="block mt-6 text-purple-700 dark:text-purple-300 font-medium text-lg">
            — {quotes[index].a}
          </cite>
        </motion.blockquote>
      )}

      {loading && (
        <motion.div
          key="loading"
          className="rounded-3xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl shadow-lg px-10 py-10 text-center text-purple-700 dark:text-purple-200 font-semibold text-lg animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          Fetching today's quote...
        </motion.div>
      )}
    </AnimatePresence>

    {/* Pagination Dots */}
    <div className="flex justify-center mt-6 space-x-2">
      {quotes.map((_, i) => (
        <motion.span
          key={i}
          className={`w-3 h-3 rounded-full ${
            i === index ? "bg-purple-600" : "bg-purple-300"
          } cursor-pointer`}
          onClick={() => setIndex(i)}
          whileHover={{ scale: 1.4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      ))}
    </div>

    {/* Refresh Button */}
    <motion.button
      onClick={fetchQuotes}
      disabled={loading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="mt-8 mx-auto hidden items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 transition-colors text-white font-semibold py-2.5 px-6 rounded-full shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <motion.div
        animate={loading ? { rotate: 360 } : { rotate: 0 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="inline-block"
      >
        <RefreshCcw size={18} />
      </motion.div>
      {loading ? "Refreshing..." : "New Quote"}
    </motion.button>

    {/* Error State */}
    {error && (
      <p className="mt-4 text-center text-red-600 font-medium text-sm hidden">
        Couldn’t fetch quotes. Showing offline version.
      </p>
    )}
  </div>
</div>

  );
};

export default QuoteCard;
