// src/components/FullscreenWarning.jsx
import React, { useState, useEffect } from "react";

const FullscreenWarning = () => {
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [warningCount, setWarningCount] = useState(0);

  useEffect(() => {
    const checkFullscreen = () => {
      const isCurrentlyFullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      if (!isCurrentlyFullscreen) {
        setIsFullscreen(false);
        setWarningCount((prev) => prev + 1);
      } else {
        setIsFullscreen(true);
      }
    };

    // Add all vendor-prefixed event listeners
    document.addEventListener("fullscreenchange", checkFullscreen);
    document.addEventListener("webkitfullscreenchange", checkFullscreen);
    document.addEventListener("mozfullscreenchange", checkFullscreen);
    document.addEventListener("MSFullscreenChange", checkFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreen);
      document.removeEventListener("webkitfullscreenchange", checkFullscreen);
      document.removeEventListener("mozfullscreenchange", checkFullscreen);
      document.removeEventListener("MSFullscreenChange", checkFullscreen);
    };
  }, []);

  if (isFullscreen) {
    return null; // Don't render anything if in fullscreen
  }

  return (
    <div
      className="bg-red-600/90 text-white p-4 fixed top-0 left-0 w-full text-center font-bold z-[9999]"
    >
      <p>⚠ Please stay in fullscreen mode!</p>
      <p>Warnings: {warningCount}</p>
    </div>
  );
};

export default FullscreenWarning;