import React from "react";

export function BackgroundGeometry() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Huge subtle architectural circles (5-10% opacity) */}
      <div
        className="bg-geo-circle w-[720px] h-[720px] md:w-[1100px] md:h-[1100px] -top-64 -right-48"
        style={{ borderColor: "rgba(216, 194, 166, 0.07)" }}
      />
      <div
        className="bg-geo-circle w-[600px] h-[600px] md:w-[900px] md:h-[900px] top-[38%] -left-64"
        style={{ borderColor: "rgba(216, 194, 166, 0.05)" }}
      />
      <div
        className="bg-geo-circle w-[800px] h-[800px] md:w-[1300px] md:h-[1300px] bottom-[-20%] right-[-10%]"
        style={{ borderColor: "rgba(216, 194, 166, 0.06)" }}
      />

      {/* Structural vertical guides */}
      <div className="bg-grid-line-v left-[6%] hidden md:block opacity-60" />
      <div className="bg-grid-line-v left-[32%] hidden xl:block opacity-30" />
      <div className="bg-grid-line-v right-[32%] hidden xl:block opacity-30" />
      <div className="bg-grid-line-v right-[6%] hidden md:block opacity-60" />

      {/* Subtle arc geometry */}
      <div className="bg-geo-arc w-[450px] h-[450px] md:w-[720px] md:h-[720px] top-[14%] left-[16%] opacity-40" />
      <div className="bg-geo-arc w-[380px] h-[380px] md:w-[580px] md:h-[580px] bottom-[15%] right-[12%] opacity-30 rotate-180" />

      {/* Grid Intersections / Alignment Crosses (+) */}
      <div className="absolute top-28 left-[6%] -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono text-[#D8C2A6] opacity-20 hidden md:block">
        +
      </div>
      <div className="absolute top-28 right-[6%] translate-x-1/2 -translate-y-1/2 text-[10px] font-mono text-[#D8C2A6] opacity-20 hidden md:block">
        +
      </div>
      <div className="absolute top-1/2 left-[6%] -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono text-[#D8C2A6] opacity-20 hidden md:block">
        +
      </div>
      <div className="absolute top-1/2 right-[6%] translate-x-1/2 -translate-y-1/2 text-[10px] font-mono text-[#D8C2A6] opacity-20 hidden md:block">
        +
      </div>

      {/* Micro architectural coordinates & section labels (Section 7 & 8) */}
      <div className="absolute top-24 left-10 micro-label-muted opacity-30 hidden xl:block">
        SYS.GFG // 2026.04 // EDITORIAL ARCHITECTURE
      </div>
      <div className="absolute top-24 right-10 micro-label-muted opacity-30 hidden xl:block">
        01 / BEGIN AGAIN // CAREER CONTINUITY
      </div>
      <div className="absolute bottom-16 left-10 micro-label-muted opacity-25 hidden xl:block">
        PATHWAY / 04 // CONFIDENCE • RETURN • RISE
      </div>
      <div className="absolute bottom-16 right-10 micro-label-muted opacity-25 hidden xl:block">
        OPPORTUNITY / MATCHED // READINESS INDEX 88.4%
      </div>
    </div>
  );
}
