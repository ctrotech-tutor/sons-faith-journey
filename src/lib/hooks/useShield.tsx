import { useEffect } from "react";

export function useShield() {
  useEffect(() => {
    // Vibrate pattern on detection
    const vibrate = () => {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    };

    // Disable text selection globally for security UX (optional)
    const disableTextSelection = () => {
      document.body.classList.add('select-none');
    };

    // Enable text selection again on cleanup
    const enableTextSelection = () => {
      document.body.classList.remove('select-none');
    };

    disableTextSelection();

    // Disable right-click context menu with vibration feedback
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      vibrate();
    };
    document.addEventListener("contextmenu", onContextMenu);

    // Block key combos used for devtools or source viewing
    const onKeyDown = (e: KeyboardEvent) => {
      const blockedKeys = ["F12", "I", "J", "C", "U", "S"];
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && blockedKeys.includes(e.key.toUpperCase())) ||
        (e.ctrlKey && ["U", "S"].includes(e.key.toUpperCase()))
      ) {
        e.preventDefault();
        vibrate();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    // DevTools detection helpers

    // 1. Detect devtools open by timing a no-op loop (instead of debugger)
    const detectDebuggerDelay = () => {
      const start = performance.now();
      // Replace debugger with a busy wait loop to detect slowdown
      const delayTime = 100;
      while (performance.now() - start < delayTime) {}
      const end = performance.now();
      return end - start > delayTime + 10; // allow some margin
    };

    // 2. Detect devtools open by unusual window size differences
    const detectWindowSizeDiff = () => {
      return (
        window.outerWidth - window.innerWidth > 160 ||
        window.outerHeight - window.innerHeight > 160
      );
    };

    // 3. Detect devtools open by overriding console methods
    let consoleTampered = false;
    const originalConsoleLog = console.log;
    console.log = function (...args) {
      consoleTampered = true;
      vibrate();
      alert("DevTools detected! Reloading...");
      window.location.reload();
      originalConsoleLog.apply(console, args);
    };

    // Periodic check
    const intervalId = setInterval(() => {
      if (detectDebuggerDelay() || detectWindowSizeDiff() || consoleTampered) {
        vibrate();
        alert("DevTools detected! Reloading...");
        window.location.reload();
      }
    }, 100);

    // Cleanup event listeners and reset console on unmount
    return () => {
      enableTextSelection();
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
      clearInterval(intervalId);
      console.log = originalConsoleLog;
    };
  }, []);
}
