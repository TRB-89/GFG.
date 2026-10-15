"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, Check, User, Video, Shield } from "lucide-react";
import { DEMO_MENTOR } from "@/lib/demoPersona";
import { DataClassificationBadge } from "./DataClassificationBadge";

interface MentorshipBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor?: any;
  onBookSuccess?: (details: { mentorName: string; topic: string; slot: string }) => void;
}

export function MentorshipBookingModal({
  isOpen,
  onClose,
  onBookSuccess,
}: MentorshipBookingModalProps) {
  const [selectedTopic, setSelectedTopic] = useState("Narrative Framing for 3-Year Gap");
  const [selectedSlot, setSelectedSlot] = useState("Tuesday, Oct 20 • 6:00 PM IST");
  const [isBooked, setIsBooked] = useState(false);

  if (!isOpen) return null;

  const topics = [
    "Narrative Framing for 3-Year Gap",
    "Technical Case Study & Code Review",
    "Tenure Preservation & Compensation Strategy",
    "Transitioning from Engineering to Data Analytics",
  ];

  const availableSlots = [
    "Tuesday, Oct 20 • 6:00 PM IST",
    "Thursday, Oct 22 • 4:00 PM IST",
    "Saturday, Oct 24 • 11:00 AM IST",
  ];

  const handleConfirm = () => {
    setIsBooked(true);
    if (onBookSuccess) {
      onBookSuccess({
        mentorName: DEMO_MENTOR.name,
        topic: selectedTopic,
        slot: selectedSlot,
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mentor-booking-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in"
    >
      <div className="w-full max-w-2xl bg-[#181818] text-[#F1E7DB] rounded-2xl border border-[#D8C2A6]/20 p-6 sm:p-10 relative max-h-[90vh] overflow-y-auto font-sans shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-[#F1E7DB] transition-colors"
          aria-label="Close mentorship booking"
        >
          <X className="w-5 h-5" />
        </button>

        {!isBooked ? (
          <div className="space-y-6">
            <div className="border-b border-[#D8C2A6]/10 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="micro-label text-[#A56F7C]">1-ON-1 GUIDED SESSIONS</span>
                <DataClassificationBadge type="simulated_demonstration" size="sm" />
              </div>
              <h2 id="mentor-booking-title" className="text-2xl sm:text-3xl font-light text-[#F1E7DB]">
                SCHEDULE WITH {DEMO_MENTOR.name.toUpperCase()}
              </h2>
              <p className="text-xs text-[#9A9A9A] mt-1 font-mono">
                {DEMO_MENTOR.title} • {DEMO_MENTOR.background}
              </p>
            </div>

            {/* Topic selector */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6]">
                SELECT FOCUS TOPIC
              </span>
              <div className="space-y-2">
                {topics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTopic(t)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      selectedTopic === t
                        ? "bg-[#D8C2A6]/10 border-[#D8C2A6] text-[#F1E7DB] font-medium"
                        : "bg-[#111111] border-[#D8C2A6]/10 text-[#9A9A9A] hover:border-[#D8C2A6]/30 hover:text-[#F1E7DB]"
                    }`}
                  >
                    <span>{t}</span>
                    {selectedTopic === t && <Check className="w-4 h-4 text-[#D8C2A6]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Slot selector */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6]">
                UPCOMING AVAILABLE SLOTS
              </span>
              <div className="grid grid-cols-1 gap-2">
                {availableSlots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSlot(s)}
                    className={`p-3 rounded-xl border text-xs font-mono text-left transition-all flex items-center gap-3 ${
                      selectedSlot === s
                        ? "bg-[#A56F7C]/20 border-[#A56F7C] text-[#F1E7DB]"
                        : "bg-[#111111] border-[#D8C2A6]/10 text-[#9A9A9A] hover:text-[#F1E7DB]"
                    }`}
                  >
                    <Clock className="w-4 h-4 text-[#A56F7C]" />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 text-[11px] font-mono text-[#9A9A9A] space-y-1">
              <div className="flex items-center gap-2 text-[#D8C2A6]">
                <Shield className="w-3.5 h-3.5 text-[#A56F7C]" />
                <span>CONFIDENTIALITY & PREPARATION</span>
              </div>
              <p className="font-sans leading-relaxed">
                Sessions are 45 minutes, hosted over encrypted video link. Your Career Continuity Passport will be shared with Dr. Meera Iyer for tailored discussion.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button onClick={onClose} className="btn-editorial-secondary text-xs">
                Cancel
              </button>
              <button onClick={handleConfirm} className="btn-editorial-primary text-xs">
                <span>Confirm Session Booking</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>

            <h3 className="text-2xl font-light text-[#F1E7DB]">Session Confirmed</h3>
            <p className="text-xs text-[#9A9A9A] font-mono max-w-md mx-auto">
              Your 1-on-1 advisory with {DEMO_MENTOR.name} is reserved for {selectedSlot}.
            </p>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 text-xs text-left max-w-md mx-auto space-y-1">
              <div className="text-[#D8C2A6] font-semibold">TOPIC: {selectedTopic}</div>
              <div className="text-[11px] text-[#9A9A9A]">Format: Virtual Secure Room • Invite dispatched</div>
            </div>

            <div className="pt-4">
              <button onClick={onClose} className="btn-editorial-primary text-xs">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
