"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type FontSizeScale = "normal" | "large" | "xlarge";

interface AccessibilityContextType {
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  toggleHighContrast: () => void;
  fontSize: FontSizeScale;
  setFontSize: (val: FontSizeScale) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  toggleReducedMotion: () => void;
  dyslexicFont: boolean;
  setDyslexicFont: (val: boolean) => void;
  toggleDyslexicFont: () => void;
  announcement: string | null;
  announce: (message: string) => void;
  resetAll: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  highContrast: false,
  setHighContrast: () => {},
  toggleHighContrast: () => {},
  fontSize: "normal",
  setFontSize: () => {},
  reducedMotion: false,
  setReducedMotion: () => {},
  toggleReducedMotion: () => {},
  dyslexicFont: false,
  setDyslexicFont: () => {},
  toggleDyslexicFont: () => {},
  announcement: null,
  announce: () => {},
  resetAll: () => {},
});

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [fontSize, setFontSizeState] = useState<FontSizeScale>("normal");
  const [reducedMotion, setReducedMotionState] = useState<boolean>(false);
  const [dyslexicFont, setDyslexicFontState] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);

  // Initialize from system preferences and localStorage
  useEffect(() => {
    try {
      const savedHC = localStorage.getItem("gfg_a11y_high_contrast") === "true";
      const savedFS = (localStorage.getItem("gfg_a11y_font_size") as FontSizeScale) || "normal";
      const savedRM = localStorage.getItem("gfg_a11y_reduced_motion");
      const savedDF = localStorage.getItem("gfg_a11y_dyslexic_font") === "true";

      // Detect system prefers-reduced-motion
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      setHighContrastState(savedHC);
      setFontSizeState(savedFS);
      setReducedMotionState(savedRM !== null ? savedRM === "true" : prefersReducedMotion);
      setDyslexicFontState(savedDF);

      applyA11yClasses({
        highContrast: savedHC,
        fontSize: savedFS,
        reducedMotion: savedRM !== null ? savedRM === "true" : prefersReducedMotion,
        dyslexicFont: savedDF,
      });
    } catch {
      // Safe fallback
    }
  }, []);

  const applyA11yClasses = (state: {
    highContrast: boolean;
    fontSize: FontSizeScale;
    reducedMotion: boolean;
    dyslexicFont: boolean;
  }) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    // High Contrast
    if (state.highContrast) {
      root.classList.add("a11y-high-contrast");
    } else {
      root.classList.remove("a11y-high-contrast");
    }

    // Font Scaling
    root.classList.remove("a11y-text-large", "a11y-text-xlarge");
    if (state.fontSize === "large") root.classList.add("a11y-text-large");
    if (state.fontSize === "xlarge") root.classList.add("a11y-text-xlarge");

    // Reduced Motion
    if (state.reducedMotion) {
      root.classList.add("a11y-reduced-motion");
    } else {
      root.classList.remove("a11y-reduced-motion");
    }

    // Dyslexic font
    if (state.dyslexicFont) {
      root.classList.add("a11y-dyslexic-font");
    } else {
      root.classList.remove("a11y-dyslexic-font");
    }
  };

  const setHighContrast = (val: boolean) => {
    setHighContrastState(val);
    localStorage.setItem("gfg_a11y_high_contrast", String(val));
    applyA11yClasses({ highContrast: val, fontSize, reducedMotion, dyslexicFont });
    announce(val ? "High contrast mode enabled" : "High contrast mode disabled");
  };

  const toggleHighContrast = () => setHighContrast(!highContrast);

  const setFontSize = (val: FontSizeScale) => {
    setFontSizeState(val);
    localStorage.setItem("gfg_a11y_font_size", val);
    applyA11yClasses({ highContrast, fontSize: val, reducedMotion, dyslexicFont });
    announce(`Font size changed to ${val}`);
  };

  const setReducedMotion = (val: boolean) => {
    setReducedMotionState(val);
    localStorage.setItem("gfg_a11y_reduced_motion", String(val));
    applyA11yClasses({ highContrast, fontSize, reducedMotion: val, dyslexicFont });
    announce(val ? "Animations reduced" : "Standard animations enabled");
  };

  const toggleReducedMotion = () => setReducedMotion(!reducedMotion);

  const setDyslexicFont = (val: boolean) => {
    setDyslexicFontState(val);
    localStorage.setItem("gfg_a11y_dyslexic_font", String(val));
    applyA11yClasses({ highContrast, fontSize, reducedMotion, dyslexicFont: val });
    announce(val ? "High legibility font enabled" : "Standard font enabled");
  };

  const toggleDyslexicFont = () => setDyslexicFont(!dyslexicFont);

  const announce = (message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(null), 3000);
  };

  const resetAll = () => {
    setHighContrast(false);
    setFontSize("normal");
    setReducedMotion(false);
    setDyslexicFont(false);
    announce("Accessibility settings reset to default");
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        setHighContrast,
        toggleHighContrast,
        fontSize,
        setFontSize,
        reducedMotion,
        setReducedMotion,
        toggleReducedMotion,
        dyslexicFont,
        setDyslexicFont,
        toggleDyslexicFont,
        announcement,
        announce,
        resetAll,
      }}
    >
      {/* Live Region for Screen Readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="a11y-live-announcer"
      >
        {announcement}
      </div>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);
