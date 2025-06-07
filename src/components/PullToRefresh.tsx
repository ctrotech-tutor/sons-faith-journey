import { useEffect, useState, useRef } from "react";
import { FiCheck } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PullToRefreshProps {
  onRefresh?: () => Promise<void>;
  pullThreshold?: number;
  vibration?: boolean;
  spinnerDuration?: number; // How long to spin loader
  checkDuration?: number;   // How long to show check before fade + reload
}

export default function PullToRefresh({
  onRefresh,
  pullThreshold = 80,
  vibration = true,
  spinnerDuration = 3000,
  checkDuration = 500,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  const startY = useRef(0);
  const isTouching = useRef(false);

  useEffect(() => {
    const triggerHaptic = () => {
      if (vibration && "vibrate" in navigator) navigator.vibrate(40);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && e.touches[0].clientY < 200 && !refreshing) {
        isTouching.current = true;
        startY.current = e.touches[0].clientY;
        setShowIndicator(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouching.current || refreshing) return;
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > 10) {
        setPullDistance(Math.min(distance * 0.5, pullThreshold + 20));
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (refreshing) return;

      if (pullDistance > pullThreshold) {
        triggerHaptic();
        setRefreshing(true);
        setPullDistance(pullThreshold);

        // Optional refresh logic before animation
        (onRefresh?.() ?? Promise.resolve())
          .then(() => {
            setShowCheck(false); // Step 1: Loader spins
            setTimeout(() => {
              setShowCheck(true); // Step 2: Checkmark shows
              setTimeout(() => {
                // Step 3: Soft Fade → Reload
                document.body.style.opacity = "0.8";
                document.body.style.overflow = "hidden";
                setTimeout(() => {
                  //window.location.reload(); // Soft manual reload
                  setPullDistance(0);
                  setShowIndicator(false);
                  setRefreshing(false);
                  setShowCheck(false);
                  document.body.style.opacity = "1";
                  document.body.style.overflow = "unset";

                }, 400);
              }, checkDuration);
            }, spinnerDuration);
          });
      } else {
        setPullDistance(0);
        setShowIndicator(false);
      }

      isTouching.current = false;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    pullDistance,
    refreshing,
    onRefresh,
    pullThreshold,
    vibration,
    spinnerDuration,
    checkDuration,
  ]);

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: pullDistance, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`
            fixed top-0 left-[45%] right-[50%] 
            transform -translate-x-1/2 
            flex items-center justify-center 
            h-10 w-10 rounded-full 
            bg-white dark:bg-gray-900 
            text-purple-600 dark:text-purple-200 
            shadow z-[9999]
          `}
        >
          {showCheck ? (
            <FiCheck size={24} />
          ) : (
            <Loader2 size={24} className="animate-spin" />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
