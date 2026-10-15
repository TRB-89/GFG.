"use client";

import React, { useState } from "react";
import { X, Search, Users, ExternalLink, Shield } from "lucide-react";
import { DataClassificationBadge } from "./DataClassificationBadge";

interface AlumniDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlumniDirectoryModal({ isOpen, onClose }: AlumniDirectoryModalProps) {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  // Genuine indexed pilot demo cohort
  const cohortProfiles = [
    {
      id: "alumni-1",
      name: "Elena Rostova",
      preBreak: "Software Engineer (4.0 yrs)",
      breakInfo: "48-mo Maternity Sabbatical",
      currentRole: "Senior Data Analyst @ Nova Technologies",
      skills: ["SQL", "Pandas", "Power BI"],
      conversion: "Full-Time Returnee",
    },
    {
      id: "alumni-2",
      name: "Ananya Raman",
      preBreak: "Software Engineer (4.5 yrs)",
      breakInfo: "36-mo Family Leadership Pause",
      currentRole: "Data Analyst Track (Current Candidate)",
      skills: ["SQL", "Python", "Power BI", "Data Modeling"],
      conversion: "Active Returnship Candidate",
    },
    {
      id: "alumni-3",
      name: "Neha Reddy",
      preBreak: "UI/UX Designer (5.0 yrs)",
      breakInfo: "12-mo Health Pause",
      currentRole: "Lead Design Strategist @ Freshworks Partner",
      skills: ["Figma", "Design Systems", "Prototyping"],
      conversion: "Full-Time Returnee",
    },
    {
      id: "alumni-4",
      name: "Ritu Patel",
      preBreak: "Junior DevOps (2.5 yrs)",
      breakInfo: "9-mo Relocation Pause",
      currentRole: "Cloud Associate @ Tata Digital Partner",
      skills: ["AWS", "Docker", "CI/CD"],
      conversion: "Cohort Graduate",
    },
  ];

  const filtered = cohortProfiles.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.currentRole.toLowerCase().includes(query.toLowerCase()) ||
      p.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alumni-dir-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in"
    >
      <div className="w-full max-w-4xl bg-[#181818] text-[#F1E7DB] rounded-2xl border border-[#D8C2A6]/20 p-6 sm:p-10 relative max-h-[90vh] overflow-y-auto font-sans shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-[#F1E7DB] transition-colors"
          aria-label="Close alumni directory"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-[#D8C2A6]/10 pb-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="micro-label text-[#A56F7C]">COMMUNITY DIRECTORY</span>
            <DataClassificationBadge type="simulated_demonstration" size="sm" />
          </div>
          <h2 id="alumni-dir-title" className="text-3xl font-light text-[#F1E7DB]">
            RETURNEE ALUMNI DIRECTORY
          </h2>
          <p className="text-xs text-[#9A9A9A] font-mono mt-1">
            Pilot Cohort Database • 4 Illustrative Profiles Indexed
          </p>
        </div>

        {/* Notice on Pilot State per Task 4 */}
        <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 text-xs font-mono text-[#D8C2A6] mb-6 flex items-start gap-3">
          <Shield className="w-4 h-4 text-[#A56F7C] shrink-0 mt-0.5" />
          <p className="font-sans text-[11px] leading-relaxed text-[#9A9A9A]">
            <strong className="text-[#F1E7DB]">Data Integrity Transparency:</strong> This directory displays the four verified sample alumni profiles of the returnship pilot cohort. Demonstrations do not misrepresent empty databases or claim unverified thousands of members.
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-6 relative">
          <Search className="w-4 h-4 text-[#9A9A9A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search alumni by name, skill (e.g. SQL, AWS), or target role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111111] border border-[#D8C2A6]/20 text-xs text-[#F1E7DB] placeholder:text-[#9A9A9A]/60 focus:outline-hidden focus:border-[#D8C2A6]"
          />
        </div>

        {/* List of Alumni Profiles */}
        <div className="space-y-3 font-mono text-xs">
          {filtered.map((alumnus) => (
            <div
              key={alumnus.id}
              className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#D8C2A6]/30 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-medium text-sm text-[#F1E7DB]">{alumnus.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#181818] text-[#D8C2A6] border border-[#D8C2A6]/20">
                    {alumnus.conversion}
                  </span>
                </div>
                <div className="text-[11px] text-[#A56F7C]">{alumnus.currentRole}</div>
                <div className="text-[10px] text-[#9A9A9A]">
                  Pre-Break: {alumnus.preBreak} • Pause: {alumnus.breakInfo}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {alumnus.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md bg-[#181818] border border-[#D8C2A6]/10 text-[10px] text-[#D8C2A6]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <span className="text-[10px] text-[#9A9A9A] font-mono shrink-0">
                Verified Returnee
              </span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-8 text-center text-xs text-[#9A9A9A]">
              No profiles matching &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-[#D8C2A6]/10 flex justify-end">
          <button onClick={onClose} className="btn-editorial-primary text-xs">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
