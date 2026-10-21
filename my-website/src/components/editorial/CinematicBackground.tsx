"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CinematicBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for mouse glow tracking
  const springX = useSpring(mouseX, { stiffness: 45, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#090705]">
      {/* 1. Deep Atmospheric Gradient Base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(234,88,12,0.18),rgba(15,10,7,0.95)_70%,#090705_100%)]" />

      {/* 2. Interactive Mouse-Responsive Spotlight Glow */}
      <motion.div
        className="hidden md:block absolute w-[700px] h-[700px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 blur-[140px]"
        style={{
          x: springX,
          y: springY,
          background: "radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, rgba(217, 119, 6, 0.03) 45%, transparent 70%)",
        }}
      />

      {/* 3. Floating Ambient Burnt-Orange & Amber Orbs */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -50, 20, 0],
          scale: [1, 1.12, 0.95, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[8%] -left-[10%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-[#ea580c]/12 via-[#f59e0b]/08 to-transparent blur-[160px]"
      />

      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -30, 0],
          scale: [1, 0.92, 1.08, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-[45%] -right-[15%] w-[800px] h-[800px] rounded-full bg-gradient-to-bl from-[#ea580c]/14 via-[#c2410c]/06 to-transparent blur-[180px]"
      />

      <motion.div
        animate={{
          x: [0, 30, -40, 0],
          y: [0, -30, 40, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
        className="absolute bottom-[-10%] left-[20%] w-[750px] h-[750px] rounded-full bg-gradient-to-t from-[#f97316]/10 via-[#7c2d12]/06 to-transparent blur-[170px]"
      />

      {/* 4. Fine Editorial Structural Lines & Crosses */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(254,215,170,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(254,215,170,0.02)_1px,transparent_1px)] bg-[size:120px_120px] opacity-40" />

      {/* Subtle Noise / Film Grain Simulation */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
