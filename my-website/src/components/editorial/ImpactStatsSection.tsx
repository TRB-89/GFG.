"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { TrendingUp, Users, Building2, ShieldCheck, Heart } from "lucide-react";

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

function Counter({ from = 0, to, duration = 2.2, prefix = "", suffix = "" }: CounterProps) {
  const [current, setCurrent] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1] as const,
      onUpdate(value) {
        setCurrent(Math.floor(value));
      },
    });
    return () => controls.stop();
  }, [isInView, from, to, duration]);

  return (
    <span ref={ref} className="font-serif tracking-tight">
      {prefix}
      {current.toLocaleString()}
      {suffix}
    </span>
  );
}

export function ImpactStatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const STATS = [
    {
      to: 14200,
      suffix: "+",
      label: "Career Returners Supported",
      sublabel: "Across maternity, caregiving & sabbaticals",
      icon: Users,
    },
    {
      to: 89,
      suffix: "%",
      label: "Returnship Offer Rate",
      sublabel: "Within 16 weeks of completing GFG paths",
      icon: TrendingUp,
    },
    {
      to: 0,
      prefix: "₹",
      label: "Learner Fee",
      sublabel: "100% Free, philanthropic & non-profit mission",
      icon: Heart,
    },
    {
      to: 120,
      suffix: "+",
      label: "Verified Employers",
      sublabel: "Offering structured, protected returnships",
      icon: Building2,
    },
    {
      to: 100,
      suffix: "%",
      label: "DPDP Act Compliant",
      sublabel: "Private records with strict consent control",
      icon: ShieldCheck,
    },
  ];

  return (
    <section
      id="impact"
      ref={ref}
      className="relative min-h-[85vh] w-full flex flex-col justify-center py-24 px-6 sm:px-12 md:px-16 lg:px-20 z-10 border-t border-orange-500/15 overflow-hidden"
    >
      {/* Ambient background light beam */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-r from-orange-600/10 via-amber-500/10 to-transparent rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-[11px] font-mono uppercase tracking-[0.26em] text-orange-400 font-semibold">
              05 // MEASURABLE MOMENTUM
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-light tracking-tight text-[#fcf8f2] leading-tight">
            IMPACT IN NUMBERS.{" "}
            <span className="text-gradient-amber italic font-serif">
              TENURE RESTORED.
            </span>
          </h2>
          <p className="text-base text-[#bfaea0] font-light">
            We don't count vanity metrics. We measure real livelihoods revived, fair stipends negotiated, and glass ceilings shattered.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] as const }}
                className="card-editorial-glow rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 text-center group"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-[#1f150e] border border-orange-500/25 flex items-center justify-center text-orange-400 group-hover:border-orange-400 group-hover:scale-110 transition-all">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="text-4xl sm:text-5xl font-light text-gradient-amber">
                    <Counter
                      to={stat.to}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />
                  </div>
                  <div className="text-sm font-semibold text-[#fcf8f2] pt-1">
                    {stat.label}
                  </div>
                  <div className="text-[11px] text-[#9a8c80] leading-tight pt-1">
                    {stat.sublabel}
                  </div>
                </div>

                <div className="w-8 h-0.5 mx-auto bg-orange-500/30 group-hover:w-16 group-hover:bg-orange-500 transition-all duration-300" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
