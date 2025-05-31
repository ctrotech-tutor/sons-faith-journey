import React, { useState, useEffect } from "react";
import { useToast } from './use-toast';

const DESKTOP_OVERRIDE_KEY = "desktop_access";
const OVERRIDE_PASSWORD = "ctrotech2025";

export function useMobileGuard() {
  const [isMobile, setIsMobile] = useState(true);
  const { toast } = useToast();
  const [overrideGranted, setOverrideGranted] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );
    setIsMobile(checkMobile);

    const override = localStorage.getItem(DESKTOP_OVERRIDE_KEY) === "granted";
    setOverrideGranted(override);

    if (!checkMobile && !override) {
      setShowBlock(true);
    }
  }, []);

  // Password check handler
  const checkOverride = () => {
    if (passwordInput === OVERRIDE_PASSWORD) {
      localStorage.setItem(DESKTOP_OVERRIDE_KEY, "granted");
      setOverrideGranted(true);
      setShowBlock(false);
    } else {
      toast({
        title: 'Error',
        description: 'Incorrect password. Access denied.',
        variant: 'destructive'
      });
    }
  };

  // If blocking UI, render the full screen block component here
  const BlockUI = () => (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] text-white flex flex-col justify-center items-center text-center px-6 font-sans">

      <h2 className="text-2xl font-bold mb-2">Mobile Device Required</h2>

      <p className="text-gray-400 max-w-md mb-6">
        This app is optimized for mobile screens. Please use a phone or tablet to
        continue.
      </p>

      <div className="w-full max-w-sm space-y-4">
        <input
          id="desktopPassword"
          type="password"
          placeholder="Enter desktop override password"
          className="w-full px-4 py-2 rounded-lg bg-[#1f1f1f] text-white border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF9606]"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") checkOverride();
          }}
          autoFocus
        />

        <button
          onClick={checkOverride}
          className="w-full py-2 px-6 rounded-lg bg-[#FF9606] text-black font-semibold shadow hover:bg-opacity-90 transition"
          type="button"
        >
          Access Anyway
        </button>
      </div>
    </div>
  );

  // Return whether to block and the BlockUI component
  return { showBlock, BlockUI };
}
