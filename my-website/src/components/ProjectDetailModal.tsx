"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Check, Users, MapPin, Calendar, Award, ArrowUpRight } from "lucide-react";
import { CommunityProject, SDG_LIST } from "@/lib/sdgData";

interface ProjectDetailModalProps {
  project: CommunityProject | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinProject: (projectId: string) => Promise<void>;
  isJoined?: boolean;
}

export function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  onJoinProject,
  isJoined = false,
}: ProjectDetailModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  if (!isOpen || !project) return null;

  const handleJoin = async () => {
    setIsSubmitting(true);
    try {
      await onJoinProject(project.id);
      setJoinSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 lg:p-12 bg-black/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-[#E4C29B] text-[#151A17] rounded-none md:rounded-2xl shadow-2xl border border-[#18372C]/15 overflow-hidden my-auto max-h-screen md:max-h-[92vh] flex flex-col">
        {/* Top Header Strip */}
        <div className="px-6 md:px-10 py-5 border-b border-[#18372C]/15 flex items-center justify-between bg-[#E4C29B]/90 backdrop-blur-xs sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#18372C]" />
            <span className="micro-label">{project.projectCode} // CASE STUDY</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#18372C]/10 text-[#18372C] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Case Study Content */}
        <div className="overflow-y-auto px-6 md:px-12 py-8 space-y-10">
          {/* Hero Section */}
          <div className="space-y-4 border-b border-[#18372C]/15 pb-8">
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#18372C]/80">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {project.location}
              </span>
              <span>//</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {project.contributors} Contributors
              </span>
              <span>//</span>
              <span className="px-2 py-0.5 rounded-full bg-[#18372C]/10 text-[#18372C] font-semibold text-[10px]">
                {project.status}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-sans font-light uppercase tracking-tight text-[#151A17] leading-tight">
              {project.title}
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#18372C] font-mono">
              PROJECT LEAD: {project.projectLead}
            </p>
          </div>

          {/* Large Project Image */}
          <div className="relative w-full h-[260px] md:h-[380px] rounded-lg overflow-hidden border border-[#18372C]/15">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 900px"
            />
          </div>

          {/* The Problem & The Approach */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-[#18372C]/15 pb-10">
            <div className="space-y-3">
              <div className="micro-label">01 // THE PROBLEM</div>
              <p className="text-sm font-sans text-[#151A17]/85 leading-relaxed bg-[#F5E8D5]/60 p-4 rounded-md border border-[#18372C]/10">
                {project.problemSummary}
              </p>
            </div>

            <div className="space-y-3">
              <div className="micro-label">02 // THE APPROACH</div>
              <p className="text-sm font-sans text-[#151A17]/85 leading-relaxed bg-[#F5E8D5]/60 p-4 rounded-md border border-[#18372C]/10">
                {project.approachSummary}
              </p>
            </div>
          </div>

          {/* SDGs Addressed & Verified Impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-[#18372C]/15 pb-10">
            <div className="space-y-3">
              <div className="micro-label">03 // SDGS ADDRESSED</div>
              <div className="flex flex-wrap gap-2">
                {project.sdgs.map((sdgNum) => {
                  const sdg = SDG_LIST.find((s) => s.id === sdgNum);
                  return (
                    <div
                      key={sdgNum}
                      className="px-3 py-1.5 rounded-sm border border-[#18372C]/15 bg-[#F5E8D5] flex items-center gap-2 text-xs font-mono"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sdg?.color || "#18372C" }}
                      />
                      <span>
                        SDG {sdgNum < 10 ? `0${sdgNum}` : sdgNum} : {sdg?.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="micro-label">04 // VERIFIED IMPACT</div>
              <div className="p-4 bg-[#18372C] text-[#F5E8D5] rounded-md font-mono text-xs leading-relaxed space-y-1">
                <span className="micro-label text-[#A8BD82] block">
                  TELEMETRY VERIFICATION 2026
                </span>
                <p className="text-sm font-semibold">{project.impactMetrics}</p>
              </div>
            </div>
          </div>

          {/* Timeline & Field Updates */}
          <div className="space-y-4">
            <div className="micro-label">05 // TIMELINE & DISPATCH UPDATES</div>
            <div className="text-xs font-mono text-[#18372C]/70">
              DEPLOYMENT: {project.timeline}
            </div>
            <div className="space-y-2">
              {project.updates.map((update, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#F5E8D5]/70 border-l-2 border-[#18372C] text-xs font-sans text-[#151A17]/85"
                >
                  {update}
                </div>
              ))}
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-6 border-t border-[#18372C]/15 flex items-center justify-between gap-4">
            <div className="text-xs text-[#18372C]/75">
              Join this verified coalition to contribute field telemetry, code, or local action.
            </div>
            <button
              onClick={handleJoin}
              disabled={isSubmitting || isJoined || joinSuccess}
              className="btn-editorial-primary text-xs"
            >
              {joinSuccess || isJoined ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#A8BD82]" />
                  Joined Project Coalition ✓
                </>
              ) : isSubmitting ? (
                "Connecting to Coalition..."
              ) : (
                "Join Project ↗"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
