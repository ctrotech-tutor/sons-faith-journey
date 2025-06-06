import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { RefreshCw, CheckCircle } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  threshold?: number; // in px
  height?: number;
}

export default function PullToRefresh({
  onRefresh,
  threshold = 80,
  height = 120,
}: PullToRefreshProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [complete, setComplete] = useState(false);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0 || refreshing) return;
      startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && delta < height) {
        setPull(delta);
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (pull >= threshold) {
        setRefreshing(true);
        navigator.vibrate?.(50); // haptic feedback
        await onRefresh();
        setComplete(true);
        setTimeout(() => {
          setComplete(false);
          setRefreshing(false);
          setPull(0);
        }, 1200);
      } else {
        setPull(0);
      }
      startY.current = null;
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pull, refreshing]);

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        animate={{ height: pull }}
        className="flex justify-center items-end overflow-hidden"
        style={{ height: pull }}
      >
        <motion.div
          animate={{
            rotate: refreshing ? 360 : 0,
            opacity: pull > 10 ? 1 : 0,
          }}
          transition={{
            repeat: refreshing ? Infinity : 0,
            duration: 0.6,
            ease: "linear",
          }}
          className={clsx(
            "text-purple-700 transition-all",
            complete && "text-green-500"
          )}
        >
          {complete ? (
            <CheckCircle className="w-7 h-7" />
          ) : (
            <RefreshCw className="w-7 h-7" />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
