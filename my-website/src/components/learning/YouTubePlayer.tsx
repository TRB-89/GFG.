"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Volume2, ShieldCheck, ExternalLink, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  videoUrlOrId: string;
  title?: string;
  autoplay?: boolean;
  height?: string | number;
  width?: string | number;
  onPlayerReady?: (event: any) => void;
  onPlayerStateChange?: (event: any) => void;
  onEnded?: () => void;
}

/**
 * Parses YouTube video IDs from various URL formats or returns the ID directly.
 * Handles:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - VIDEO_ID
 */
export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex patterns for standard YouTube URLs
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    /^[a-zA-Z0-9_-]{11}$/,
  ];

  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function YouTubePlayer({
  videoUrlOrId,
  title = "Course Video Lesson",
  autoplay = false,
  height = "100%",
  width = "100%",
  onPlayerReady,
  onPlayerStateChange,
  onEnded,
}: YouTubePlayerProps) {
  const containerId = useRef(`yt-player-${Math.random().toString(36).substring(2, 9)}`);
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const videoId = extractYouTubeId(videoUrlOrId);

  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!videoId) {
      setHasError(true);
      return;
    }

    let isMounted = true;

    const bindPlayerEvents = () => {
      if (!window.YT || !window.YT.Player) return;

      try {
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch {}
        }

        // Attach YT.Player to the existing iframe element
        playerRef.current = new window.YT.Player(containerId.current, {
          events: {
            onReady: (event: any) => {
              if (isMounted) setIsReady(true);
              if (onPlayerReady) onPlayerReady(event);
            },
            onStateChange: (event: any) => {
              if (onPlayerStateChange) onPlayerStateChange(event);
              // YT.PlayerState.ENDED is 0
              if (event.data === 0 && onEnded) {
                onEnded();
              }
            },
            onError: () => {
              if (isMounted) setHasError(true);
            },
          },
        });
      } catch (e) {
        console.warn("YouTube player binding:", e);
      }
    };

    // Load IFrame API asynchronously if not yet in window
    if (!window.YT || !window.YT.Player) {
      const existingScript = document.getElementById("youtube-iframe-api");
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        bindPlayerEvents();
      };
    } else {
      bindPlayerEvents();
    }

    return () => {
      isMounted = false;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
      }
    };
  }, [videoId, onPlayerReady, onPlayerStateChange, onEnded]);

  if (!videoId) {
    return null;
  }

  const iframeSrc = `https://www.youtube.com/embed/${videoId}?enablejsapi=1${
    origin ? `&origin=${encodeURIComponent(origin)}` : ""
  }&playsinline=1&modestbranding=1&rel=0${autoplay ? "&autoplay=1" : ""}`;

  return (
    <div className="w-full space-y-2">
      {/* Editorial Player Frame */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#0d0d0d] border border-[#D8C2A6]/25 shadow-2xl group">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#A56F7C] to-transparent opacity-60 z-10 pointer-events-none" />

        {/* Direct HTML IFrame Player with enablejsapi=1 */}
        <iframe
          id={containerId.current}
          title={title}
          width={width || "640"}
          height={height || "390"}
          src={iframeSrc}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
        />

        {/* Fallback if embedded playback is restricted by network/CSP */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#141414] text-center p-6 space-y-3 z-20">
            <AlertCircle className="w-8 h-8 text-[#A56F7C]" />
            <div className="text-sm font-serif text-[#F1E7DB]">
              Embedded Player Restricted
            </div>
            <p className="text-xs text-[#888888] max-w-sm">
              You can open this instructional video directly in YouTube in a secure new tab.
            </p>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#D8C2A6] text-[#111111] text-xs font-mono font-bold hover:bg-[#F1E7DB] transition-all"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Video Caption & Metadata Strip */}
      <div className="flex items-center justify-between px-1 text-[11px] font-mono text-[#888888]">
        <div className="flex items-center gap-2">
          <Play className="w-3 h-3 text-[#A56F7C]" />
          <span className="text-[#D8C2A6] font-medium">{title}</span>
        </div>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#F1E7DB] transition-colors flex items-center gap-1 text-[10px]"
        >
          <span>Open on YouTube</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
}
