"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, ArrowRight, UserCheck, Building2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("priya.sharma@example.com");
  const [password, setPassword] = useState("Password@123");
  const [fullName, setFullName] = useState("Priya Sharma");
  const [accountType, setAccountType] = useState<"candidate" | "employer">("candidate");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      if (mode === "login") {
        const res = await api.login(email, password);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.register(fullName, email, password, accountType);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (role: "candidate" | "employer") => {
    if (role === "candidate") {
      setEmail("priya.sharma@example.com");
      setPassword("Password@123");
      setFullName("Priya Sharma");
      setAccountType("candidate");
    } else {
      setEmail("hr@novatech.com");
      setPassword("Password@123");
      setFullName("Nova Tech HR");
      setAccountType("employer");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-[#181818] rounded-xl border border-[#D8C2A6]/15 overflow-hidden my-auto grid grid-cols-1 md:grid-cols-12 min-h-[560px]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2 rounded-full hover:bg-white/10 text-[#F1E7DB] transition-colors"
          aria-label="Close auth modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT: Large Premium Image (Section 23) */}
        <div className="md:col-span-5 relative bg-[#111111] text-[#F1E7DB] p-8 md:p-10 flex flex-col justify-between overflow-hidden border-b md:border-b-0 md:border-r border-[#D8C2A6]/10">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/editorial-hero.jpg"
              alt="Editorial Career Transformation"
              fill
              className="object-cover object-center grayscale contrast-125 opacity-40"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/70 to-transparent" />
          </div>

          <div className="relative z-10 space-y-2">
            <span className="micro-label text-[#A56F7C] block">
              01 / IDENTITY // GFG
            </span>
            <div className="font-serif italic text-2xl md:text-3xl text-[#F1E7DB]">
              Return. Rebuild. Rise.
            </div>
          </div>

          <div className="relative z-10 space-y-4 pt-16">
            <p className="text-xs md:text-sm text-[#D8C2A6]/90 leading-relaxed font-light">
              &ldquo;A career break is a chapter, not the conclusion. Rebuild skills, restore confidence, and step back into leadership.&rdquo;
            </p>
            <div className="micro-label-muted text-[10px]">
              FASTAPI & SUPABASE RLS // ENCRYPTED
            </div>
          </div>
        </div>

        {/* RIGHT: Minimal Sign-In Form (Section 23) */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-between bg-[#181818] text-[#F1E7DB]">
          <div>
            {/* Tab switch */}
            <div className="flex items-center space-x-6 border-b border-[#D8C2A6]/10 pb-4 mb-8">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`text-xs uppercase tracking-widest transition-all ${
                  mode === "login"
                    ? "font-semibold text-[#F1E7DB] border-b-2 border-[#D8C2A6] pb-2 -mb-[18px]"
                    : "text-[#9A9A9A] hover:text-[#F1E7DB]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`text-xs uppercase tracking-widest transition-all ${
                  mode === "register"
                    ? "font-semibold text-[#F1E7DB] border-b-2 border-[#D8C2A6] pb-2 -mb-[18px]"
                    : "text-[#9A9A9A] hover:text-[#F1E7DB]"
                }`}
              >
                New Account
              </button>
            </div>

            {/* Quick Demo Fill Buttons */}
            <div className="mb-6 p-3 rounded-lg bg-[#111111] border border-[#D8C2A6]/10 flex items-center justify-between text-xs">
              <span className="micro-label-muted text-[9px]">DEMO PROFILES:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoSelect("candidate")}
                  className="px-2.5 py-1 rounded bg-[#242424] hover:bg-[#333333] text-[11px] text-[#D8C2A6] flex items-center gap-1 transition-colors"
                >
                  <UserCheck className="w-3 h-3 text-[#A56F7C]" />
                  Priya (Candidate)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSelect("employer")}
                  className="px-2.5 py-1 rounded bg-[#242424] hover:bg-[#333333] text-[11px] text-[#D8C2A6] flex items-center gap-1 transition-colors"
                >
                  <Building2 className="w-3 h-3 text-[#D8C2A6]" />
                  Nova Tech (Employer)
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 rounded-lg bg-red-950/60 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#9A9A9A] mb-1.5 font-medium">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#111111] border border-[#D8C2A6]/15 text-[#F1E7DB] text-sm focus:outline-none focus:border-[#D8C2A6] transition-colors"
                      placeholder="e.g. Priya Sharma"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#9A9A9A] mb-1.5 font-medium">
                      Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAccountType("candidate")}
                        className={`py-2.5 px-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all border ${
                          accountType === "candidate"
                            ? "bg-[#D8C2A6] text-[#111111] border-[#D8C2A6] font-semibold"
                            : "bg-[#111111] text-[#9A9A9A] border-[#D8C2A6]/15"
                        }`}
                      >
                        Candidate
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccountType("employer")}
                        className={`py-2.5 px-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all border ${
                          accountType === "employer"
                            ? "bg-[#D8C2A6] text-[#111111] border-[#D8C2A6] font-semibold"
                            : "bg-[#111111] text-[#9A9A9A] border-[#D8C2A6]/15"
                        }`}
                      >
                        Employer
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9A9A9A] mb-1.5 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#111111] border border-[#D8C2A6]/15 text-[#F1E7DB] text-sm focus:outline-none focus:border-[#D8C2A6] transition-colors"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9A9A9A] mb-1.5 font-medium">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#111111] border border-[#D8C2A6]/15 text-[#F1E7DB] text-sm focus:outline-none focus:border-[#D8C2A6] transition-colors"
                  placeholder="••••••••••••"
                />
              </div>

              {/* Primary CTA (Section 23 & 25): Cream background with dark text */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 btn-editorial-primary text-xs py-3.5 tracking-widest justify-center font-semibold"
              >
                <span>{loading ? "AUTHENTICATING..." : "CONTINUE →"}</span>
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-[#D8C2A6]/10 text-center">
            <span className="text-[11px] text-[#9A9A9A]">
              By continuing, you agree to verified Career Continuity standards.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
