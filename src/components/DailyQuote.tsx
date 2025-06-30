import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, SparklesIcon } from "lucide-react";

const fallbackQuotes = [
  { q: "Iron sharpens iron, and one man sharpens another.", a: "Proverbs 27:17" },
  { q: "Trust in the Lord with all your heart.", a: "Proverbs 3:5" },
  { q: "I can do all things through Christ.", a: "Philippians 4:13" },
  { q: "Let all that you do be done in love.", a: "1 Corinthians 16:14" },
  { q: "Be strong and courageous.", a: "Joshua 1:9" },
  { q: "For I know the plans I have for you.", a: "Jeremiah 29:11" },
  { q: "The Lord is my shepherd.", a: "Psalm 23:1" },
  { q: "Do not be anxious about anything.", a: "Philippians 4:6" },
];

const getRandomFallback = (n: number) => {
  const shuffled = [...fallbackQuotes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

const spring = {
  type: "spring",
  stiffness: 200,
  damping: 25,
};

const QuoteCard = () => {
  const [quotes, setQuotes] = useState<{ q: string; a: string }[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchQuotes = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("http://localhost:5000/api/quotes/random?count=2");
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Invalid response format");
      setQuotes(data);
    } catch (err) {
      console.error("Error fetching from custom quote API:", err);
      setQuotes(getRandomFallback(2));
      setError(true);
    } finally {
      setLoading(false);
      setIndex(0);
    }
  };

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 86400000); // refresh daily
    return () => clearInterval(interval);
  }, []);

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -100) setIndex((prev) => (prev + 1) % quotes.length);
    else if (info.offset.x > 100) setIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
  };

  return (
    <div className="bg-white/70 dark:bg-gray-900/40 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl mb-12">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
        <SparklesIcon className="inline-block mr-2 text-yellow-600" /> Daily Quote
      </h2>

      <div className="relative w-full max-w-lg">
        <AnimatePresence mode="wait">
          {!loading && quotes.length > 0 && (
            <motion.blockquote
              key={index}
              className="cursor-grab select-none rounded-3xl bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl shadow-2xl px-8 py-10 text-center text-purple-900 dark:text-purple-200 font-semibold italic text-lg sm:text-xl md:text-2xl"
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
              Fetching today’s quote...
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center mt-6 space-x-2">
          {quotes.map((_, i) => (
            <motion.span
              key={i}
              className={`w-3 h-3 rounded-full ${i === index ? "bg-purple-600" : "bg-purple-300"} cursor-pointer`}
              onClick={() => setIndex(i)}
              whileHover={{ scale: 1.4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          ))}
        </div>

        <motion.button
          onClick={fetchQuotes}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden mt-8 mx-auto items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 transition-colors text-white font-semibold py-2.5 px-6 rounded-full shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
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

        {error && (
          <p className="mt-4 text-center text-red-600 font-medium text-sm hidden">
            Couldn’t fetch online. Showing offline quotes.
          </p>
        )}
      </div>
    </div>
  );
};

export default QuoteCard;
