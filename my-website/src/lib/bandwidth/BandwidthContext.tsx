"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface BandwidthContextType {
  lowBandwidthMode: boolean;
  setLowBandwidthMode: (val: boolean) => void;
  toggleLowBandwidthMode: () => void;
  isOnline: boolean;
  cachedContentCount: number;
  cacheItem: (key: string, data: any) => void;
  getCachedItem: <T>(key: string) => T | null;
  clearCache: () => void;
}

const BandwidthContext = createContext<BandwidthContextType>({
  lowBandwidthMode: false,
  setLowBandwidthMode: () => {},
  toggleLowBandwidthMode: () => {},
  isOnline: true,
  cachedContentCount: 0,
  cacheItem: () => {},
  getCachedItem: () => null,
  clearCache: () => {},
});

const CACHE_PREFIX = "gfg_cached_content_";

export function BandwidthProvider({ children }: { children: React.ReactNode }) {
  const [lowBandwidthMode, setLowBandwidthState] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [cachedContentCount, setCachedContentCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect online/offline
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Detect browser Data-Saver or slow connection
    try {
      const savedMode = localStorage.getItem("gfg_low_bandwidth_mode");
      const nav = navigator as any;
      const systemSaveData = nav.connection?.saveData === true || nav.connection?.effectiveType === "2g";

      const initialVal = savedMode !== null ? savedMode === "true" : systemSaveData;
      setLowBandwidthState(initialVal);
      applyBandwidthClass(initialVal);
    } catch {
      // Safe fallback
    }

    // Count cached items
    updateCacheCount();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const applyBandwidthClass = (active: boolean) => {
    if (typeof document === "undefined") return;
    if (active) {
      document.documentElement.classList.add("bandwidth-low");
    } else {
      document.documentElement.classList.remove("bandwidth-low");
    }
  };

  const updateCacheCount = () => {
    try {
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) {
          count++;
        }
      }
      setCachedContentCount(count);
    } catch {
      // Safe fallback
    }
  };

  const setLowBandwidthMode = (val: boolean) => {
    setLowBandwidthState(val);
    applyBandwidthClass(val);
    try {
      localStorage.setItem("gfg_low_bandwidth_mode", String(val));
    } catch (e) {
      console.warn("Could not save low-bandwidth mode", e);
    }
  };

  const toggleLowBandwidthMode = () => setLowBandwidthMode(!lowBandwidthMode);

  const cacheItem = (key: string, data: any) => {
    try {
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({
        data,
        cachedAt: new Date().toISOString(),
      }));
      updateCacheCount();
    } catch (e) {
      console.warn("Local storage cache quota exceeded", e);
    }
  };

  const getCachedItem = <T,>(key: string): T | null => {
    try {
      const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.data as T;
    } catch {
      return null;
    }
  };

  const clearCache = () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      setCachedContentCount(0);
    } catch {
      // Safe fallback
    }
  };

  return (
    <BandwidthContext.Provider
      value={{
        lowBandwidthMode,
        setLowBandwidthMode,
        toggleLowBandwidthMode,
        isOnline,
        cachedContentCount,
        cacheItem,
        getCachedItem,
        clearCache,
      }}
    >
      {/* Offline Status Warning Bar */}
      {!isOnline && (
        <aside
          role="status"
          aria-live="assertive"
          aria-label="Offline connection alert"
          className="bg-[#5A2B35] text-[#F1E7DB] py-2 px-4 text-center text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 border-b border-[#A56F7C]/30 sticky top-0 z-[60]"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>You are currently offline. Running in offline mode using locally cached learning resources.</span>
        </aside>
      )}
      {children}
    </BandwidthContext.Provider>
  );
}

export const useBandwidth = () => useContext(BandwidthContext);
