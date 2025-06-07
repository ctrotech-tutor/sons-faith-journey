
import { useEffect, useState, useRef } from "react";
import { RefreshCw, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PullToRefreshProps {
  onRefresh?: () => Promise<void>;
  pullThreshold?: number;
  vibration?: boolean;
  spinnerDuration?: number;
  checkDuration?: number;
  disabled?: boolean;
}

export default function PullToRefresh({
  onRefresh,
  pullThreshold = 80,
  vibration = true,
  spinnerDuration = 1500,
  checkDuration = 800,
  disabled = false,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [canPull, setCanPull] = useState(false);

  const startY = useRef(0);
  const isTouching = useRef(false);
  const hasTriggeredHaptic = useRef(false);

  useEffect(() => {
    if (disabled) return;

    const triggerHaptic = () => {
      if (vibration && "vibrate" in navigator && !hasTriggeredHaptic.current) {
        navigator.vibrate(50);
        hasTriggeredHaptic.current = true;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull-to-refresh when at the top of the page
      const isAtTop = window.scrollY === 0;
      const isInTopArea = e.touches[0].clientY < 150;
      
      if (isAtTop && isInTopArea && !refreshing && !disabled) {
        isTouching.current = true;
        startY.current = e.touches[0].clientY;
        setCanPull(true);
        setShowIndicator(true);
        hasTriggeredHaptic.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouching.current || refreshing || disabled || !canPull) return;
      
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      // Only allow downward pulls
      if (distance > 10) {
        // Prevent default scroll behavior when pulling
        e.preventDefault();
        
        // Calculate pull distance with resistance
        const resistance = 0.6;
        const maxPull = pullThreshold + 40;
        const calculatedDistance = Math.min(distance * resistance, maxPull);
        
        setPullDistance(calculatedDistance);

        // Trigger haptic feedback when threshold is reached
        if (calculatedDistance >= pullThreshold) {
          triggerHaptic();
        }
      } else {
        // Reset if user pulls up
        setPullDistance(0);
        setCanPull(false);
        setShowIndicator(false);
      }
    };

    const handleTouchEnd = () => {
      if (refreshing || disabled) return;

      if (pullDistance >= pullThreshold && canPull) {
        // Trigger refresh
        setRefreshing(true);
        setPullDistance(pullThreshold);

        // Execute refresh function
        const refreshPromise = onRefresh?.() ?? Promise.resolve();
        
        refreshPromise
          .then(() => {
            // Show spinner for minimum duration
            setTimeout(() => {
              setShowCheck(true);
              
              // Show check mark then hide
              setTimeout(() => {
                setRefreshing(false);
                setShowCheck(false);
                setPullDistance(0);
                setShowIndicator(false);
                setCanPull(false);
              }, checkDuration);
            }, spinnerDuration);
          })
          .catch(() => {
            // Handle error
            setRefreshing(false);
            setPullDistance(0);
            setShowIndicator(false);
            setCanPull(false);
          });
      } else {
        // Reset if threshold not reached
        setPullDistance(0);
        setShowIndicator(false);
        setCanPull(false);
      }

      isTouching.current = false;
      hasTriggeredHaptic.current = false;
    };

    const handleScroll = () => {
      // Hide indicator if user scrolls down
      if (window.scrollY > 50 && showIndicator && !refreshing) {
        setShowIndicator(false);
        setCanPull(false);
        setPullDistance(0);
      }
    };

    // Use passive: false to allow preventDefault
    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [
    pullDistance,
    refreshing,
    onRefresh,
    pullThreshold,
    vibration,
    spinnerDuration,
    checkDuration,
    disabled,
    canPull,
    showIndicator,
  ]);

  // Calculate progress for visual feedback
  const progress = Math.min(pullDistance / pullThreshold, 1);
  const isReady = progress >= 1;

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ y: -80, opacity: 0, scale: 0.8 }}
          animate={{ 
            y: Math.max(-40, pullDistance - 60), 
            opacity: Math.min(progress * 2, 1),
            scale: 0.8 + (progress * 0.2)
          }}
          exit={{ y: -80, opacity: 0, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: refreshing ? 0.3 : 0.1
          }}
          className={`
            fixed top-8 left-1/2 transform -translate-x-1/2
            flex items-center justify-center 
            h-12 w-12 rounded-full 
            backdrop-blur-md shadow-lg z-[9999]
            transition-colors duration-200
            ${isReady 
              ? 'bg-green-500/90 text-white border-2 border-green-400' 
              : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600'
            }
          `}
        >
          <AnimatePresence mode="wait">
            {showCheck ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ duration: 0.3 }}
              >
                <Check size={20} className="text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="refresh"
                animate={{ 
                  rotate: refreshing ? 360 : progress * 180,
                  scale: isReady ? 1.1 : 1
                }}
                transition={{ 
                  duration: refreshing ? 1 : 0.1,
                  repeat: refreshing ? Infinity : 0,
                  ease: refreshing ? "linear" : "easeOut"
                }}
              >
                <RefreshCw 
                  size={20} 
                  className={isReady ? "text-white" : "text-current"}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
