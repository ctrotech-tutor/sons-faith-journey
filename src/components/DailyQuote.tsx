import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw } from "lucide-react";

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
    <div className="bg-white flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-gray-900">Daily Quote</h2>

      {/* Quote display with swipe and glassmorphism */}
      <div className="relative w-full max-w-lg">
        <AnimatePresence mode="wait">
          {!loading && quotes.length > 0 && (
            <motion.blockquote
              key={index}
              className="cursor-grab select-none rounded-3xl bg-white/70 backdrop-blur-md shadow-xl p-10 text-center text-purple-900 font-semibold italic text-xl md:text-2xl"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, x: 100, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.85 }}
              transition={spring}
            >
              “{quotes[index].q}”
              <cite className="block mt-6 text-purple-700 font-medium text-lg">
                — {quotes[index].a}
              </cite>
            </motion.blockquote>
          )}

          {loading && (
            <motion.div
              key="loading"
              className="rounded-3xl bg-white/60 backdrop-blur-md shadow-lg p-10 text-center text-purple-700 animate-pulse font-semibold text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Loading quotes...
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination dots */}
        <div className="flex justify-center mt-6 space-x-3">
          {quotes.map((_, i) => (
            <motion.span
              key={i}
              className="block w-3 h-3 rounded-full cursor-pointer"
              style={{ backgroundColor: i === index ? "#7c3aed" : "#c4b5fd" }}
              onClick={() => setIndex(i)}
              whileHover={{ scale: 1.4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          ))}
        </div>

        {/* Refresh button */}
        <motion.button
          onClick={fetchQuotes}
          disabled={loading}
          whileHover={{ scale: 1.1, backgroundColor: "#9d7edd" }}
          whileTap={{ scale: 0.95 }}
          className="hidden mt-10 items-center justify-center gap-3 bg-purple-400 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed select-none"
        >
          <motion.div
            animate={loading ? { rotate: 360 } : { rotate: 0 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="inline-block"
          >
            <RefreshCcw size={20} />
          </motion.div>
          Refresh Quotes
        </motion.button>

        {/* Error message */}
        {error && (
          <p className="hidden mt-4 text-center text-red-600 font-medium">
            Couldn&apos;t fetch new quotes. Showing fallback quotes.
          </p>
        )}
      </div>
    </div>
  );
};

export default QuoteCard;
