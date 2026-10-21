"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Lock,
  ArrowRight,
  User,
  Building2,
  ChevronRight,
} from "lucide-react";
import { api, setAuthToken } from "@/lib/api";

export interface UserResponse {
  id: string;
  full_name: string;
  email: string;
  role: string;
  onboarding_completed?: boolean;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserResponse) => void;
  initialMode?: "login" | "register";
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot_password">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<"candidate" | "employer">("candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === "login") {
        if (!email.trim() || !password) {
          throw new Error("Please enter your email and password.");
        }
        const res = await api.login(email.trim(), password);
        if (res.access_token) {
          setAuthToken(res.access_token);
        }
        onSuccess(res.user);
        onClose();
      } else if (mode === "register") {
        if (!fullName.trim() || !email.trim() || !password) {
          throw new Error("Please fill in your name, email, and password.");
        }
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long.");
        }
        const res = await api.register(fullName.trim(), email.trim(), password, accountType);
        if (res.access_token) {
          setAuthToken(res.access_token);
        }
        onSuccess(res.user);
        onClose();
      } else if (mode === "forgot_password") {
        if (!email.trim()) {
          throw new Error("Please enter your email address.");
        }
        await api.forgotPassword(email.trim());
        setSuccessMsg("If an account exists with this email, password reset instructions have been sent.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed. Please verify credentials.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setErrorMsg("Google OAuth is available in production deployments with configured client credentials.");
  };

  const fillDemoCredentials = (role: "candidate" | "employer") => {
    if (role === "candidate") {
      setEmail("ananya.raman@example.com");
      setPassword("Password@123");
      setFullName("Ananya Raman");
      setAccountType("candidate");
      setMode("login");
    } else {
      setEmail("hr@novatech.com");
      setPassword("Password@123");
      setFullName("Nova Tech HR");
      setAccountType("employer");
      setMode("login");
    }
    setErrorMsg(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-[#0A0706] rounded-3xl border border-[#D97706]/30 overflow-hidden my-auto grid grid-cols-1 md:grid-cols-12 min-h-[580px] shadow-[0_20px_70px_rgba(0,0,0,0.85)] font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-30 p-2 rounded-full bg-[#1A0F0A]/80 hover:bg-[#25150F] text-[#F5EDE4] border border-white/10 transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ========================================================= */}
        {/* LEFT COLUMN: Cinematic Branding & Visual (Desktop)       */}
        {/* ========================================================= */}
        <div className="md:col-span-5 relative bg-[#120B07] text-[#F5EDE4] p-8 md:p-10 flex flex-col justify-between overflow-hidden border-b md:border-b-0 md:border-r border-[#D97706]/20">
          {/* Background Radial Glow */}
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#D97706]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#A8551F]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D97706]/15 border border-[#D97706]/35 text-[10px] font-mono uppercase tracking-widest text-[#D97706]">
              <Sparkles className="w-3 h-3 text-[#D97706]" />
              <span>GFG // GAP FOR GOOD</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-[#F5EDE4] leading-tight">
              Your comeback <br />
              <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#F5EDE4]">
                starts here.
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-[#A89B90] leading-relaxed pt-2 font-normal">
              Every pause is a chapter of resilience. Step into your next leadership era with verified credentials, AI career navigation, and compassionate returnships.
            </p>
          </div>

          {/* Center Visual Accent */}
          <div className="relative z-10 my-8 p-5 rounded-2xl bg-[#1A0F0A]/70 border border-[#D97706]/20 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#D97706] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#D97706]" />
              <span>Verified Candidate Promise</span>
            </div>
            <p className="text-[11px] text-[#A89B90] leading-relaxed">
              We never penalize career pauses. Maternity, caregiving, health, and life sabbaticals are recognized as periods of real leadership.
            </p>
          </div>

          {/* Bottom Trust Badges */}
          <div className="relative z-10 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#A89B90] uppercase tracking-wider">
            <span>100% Free LMS</span>
            <span>•</span>
            <span>DPDP Compliant</span>
            <span>•</span>
            <span>Zero Bias AI</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Minimal, High-End Auth Form                 */}
        {/* ========================================================= */}
        <div className="md:col-span-7 p-6 sm:p-8 md:p-12 flex flex-col justify-center bg-[#0A0706]">
          {/* Form Header & Mode Toggle */}
          <div className="mb-6">
            <div className="flex items-center gap-6 border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`text-sm sm:text-base font-serif tracking-wide pb-2 relative transition-colors ${
                  mode === "login" ? "text-[#F5EDE4] font-semibold" : "text-[#A89B90] hover:text-[#F5EDE4]"
                }`}
              >
                Sign In
                {mode === "login" && (
                  <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#D97706]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`text-sm sm:text-base font-serif tracking-wide pb-2 relative transition-colors ${
                  mode === "register" ? "text-[#F5EDE4] font-semibold" : "text-[#A89B90] hover:text-[#F5EDE4]"
                }`}
              >
                Create Account
                {mode === "register" && (
                  <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#D97706]" />
                )}
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Forgot Password View */}
          {mode === "forgot_password" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-serif text-[#F5EDE4]">Reset your password</h3>
                <p className="text-xs text-[#A89B90]">
                  Enter the email address associated with your GFG account.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#A89B90] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#1A0F0A] border border-white/10 text-[#F5EDE4] text-sm focus:outline-none focus:border-[#D97706] transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#A8551F] via-[#D97706] to-[#F59E0B] text-[#0A0706] font-semibold text-xs tracking-wider uppercase shadow-[0_0_25px_rgba(217,119,6,0.35)] hover:opacity-95 transition-all disabled:opacity-50"
              >
                {loading ? "Sending link..." : "Send Reset Instructions"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-xs text-[#D97706] hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            /* Login / Register Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Optional Google Auth */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1A0F0A] hover:bg-[#22140D] border border-white/10 hover:border-white/20 text-[#F5EDE4] text-xs font-medium flex items-center justify-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] font-mono uppercase text-[#A89B90]">or with email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Full Name for Registration */}
              {mode === "register" && (
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A89B90] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sundaram"
                    className="w-full px-4 py-3 rounded-xl bg-[#1A0F0A] border border-white/10 text-[#F5EDE4] text-xs sm:text-sm focus:outline-none focus:border-[#D97706] transition-colors"
                    required
                  />
                </div>
              )}

              {/* Role Selection for Registration */}
              {mode === "register" && (
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A89B90] mb-1.5">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountType("candidate")}
                      className={`p-3 rounded-xl border text-left text-xs transition-colors flex items-center gap-2 ${
                        accountType === "candidate"
                          ? "bg-[#D97706]/15 border-[#D97706] text-[#F5EDE4]"
                          : "bg-[#1A0F0A] border-white/10 text-[#A89B90]"
                      }`}
                    >
                      <User className="w-4 h-4 text-[#D97706]" />
                      <span>Career Returner</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountType("employer")}
                      className={`p-3 rounded-xl border text-left text-xs transition-colors flex items-center gap-2 ${
                        accountType === "employer"
                          ? "bg-[#D97706]/15 border-[#D97706] text-[#F5EDE4]"
                          : "bg-[#1A0F0A] border-white/10 text-[#A89B90]"
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-[#D97706]" />
                      <span>Employer Partner</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A89B90] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#1A0F0A] border border-white/10 text-[#F5EDE4] text-xs sm:text-sm focus:outline-none focus:border-[#D97706] transition-colors"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A89B90]">
                    Password
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot_password")}
                      className="text-[11px] text-[#D97706] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-[#1A0F0A] border border-white/10 text-[#F5EDE4] text-xs sm:text-sm focus:outline-none focus:border-[#D97706] transition-colors pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89B90] hover:text-[#F5EDE4] p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#A8551F] via-[#D97706] to-[#F59E0B] text-[#0A0706] font-semibold text-xs tracking-wider uppercase shadow-[0_0_30px_rgba(217,119,6,0.35)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-2"
              >
                {loading
                  ? "Verifying..."
                  : mode === "login"
                  ? "Sign In to GFG"
                  : "Create Account & Start Onboarding"}
              </button>

              {/* Quick Fill Demo Credentials */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#A89B90] text-center">
                  Quick Sandbox Demo Fill
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials("candidate")}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[#1A0F0A] hover:bg-[#20140E] border border-white/10 text-[#F5EDE4] text-[11px] font-mono transition-colors text-center"
                  >
                    Candidate (Ananya)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials("employer")}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[#1A0F0A] hover:bg-[#20140E] border border-white/10 text-[#F5EDE4] text-[11px] font-mono transition-colors text-center"
                  >
                    Employer (Nova Tech)
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
