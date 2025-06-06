// hooks/useDisablePullToRefresh.ts
import { useEffect } from "react";

export function useDisablePullToRefresh() {
  useEffect(() => {
    let maybePreventPullToRefresh = false;
    let lastTouchY = 0;

    const touchstart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      lastTouchY = e.touches[0].clientY;
      maybePreventPullToRefresh = window.pageYOffset === 0;
    };

    const touchmove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const touchYDelta = touchY - lastTouchY;
      lastTouchY = touchY;

      if (maybePreventPullToRefresh) {
        maybePreventPullToRefresh = false;
        if (touchYDelta > 0) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener("touchstart", touchstart, { passive: false });
    document.addEventListener("touchmove", touchmove, { passive: false });

    return () => {
      document.removeEventListener("touchstart", touchstart);
      document.removeEventListener("touchmove", touchmove);
    };
  }, []);
}
