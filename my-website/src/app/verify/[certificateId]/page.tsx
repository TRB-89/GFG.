"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  AlertTriangle,
  FileX,
  Download,
  Calendar,
  CheckCircle2,
  Lock,
  ExternalLink,
  Award,
  ArrowLeft,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { learningApi, PublicVerificationResult } from "@/lib/learningApi";

export default function CertificateVerificationPage() {
  const params = useParams();
  const rawId = params?.certificateId as string;
  const credentialId = rawId ? decodeURIComponent(rawId).toUpperCase() : "";

  const [verification, setVerification] = useState<PublicVerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!credentialId) return;

    let isMounted = true;
    setIsLoading(true);

    learningApi
      .verifyCertificatePublic(credentialId)
      .then((res) => {
        if (isMounted) {
          setVerification(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMsg(err.message || "Failed to verify credential.");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [credentialId]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const formattedDate = verification?.issued_at
    ? new Date(verification.issued_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const formattedRevokedDate = verification?.revoked_at
    ? new Date(verification.revoked_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-[#111111] text-[#F1E7DB] flex flex-col font-sans selection:bg-[#A56F7C]/30 selection:text-[#F1E7DB]">
      {/* Top Navigation Bar */}
      <header className="border-b border-[#D8C2A6]/10 bg-[#161616]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-baseline gap-2 text-[#F1E7DB] hover:opacity-85 transition-opacity"
          >
            <span className="font-sans text-xl font-light tracking-tight text-[#F1E7DB]">GFG</span>
            <span className="text-[9px] text-[#A56F7C] tracking-[0.24em] font-mono uppercase">
              CREDENTIAL REGISTRY
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/#pathways"
              className="text-xs uppercase tracking-wider text-[#D8C2A6] hover:text-[#F1E7DB] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to GFG Platform</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Verification Dossier */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 md:py-16">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-2 border-[#D8C2A6]/20 border-t-[#D8C2A6] rounded-full animate-spin" />
            <p className="text-sm font-mono text-[#D8C2A6]/80 tracking-widest uppercase">
              Verifying cryptographic credential in registry...
            </p>
          </div>
        ) : errorMsg || !verification || verification.status === "not_found" ? (
          /* NOT FOUND / UNVERIFIED STATE */
          <div className="bg-[#181818] border border-amber-500/30 rounded-2xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-amber-400">
              <FileX className="w-8 h-8" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-mono text-amber-300 tracking-wider uppercase mb-4">
              Status: Unverified / Not Found
            </span>

            <h1 className="font-serif text-2xl sm:text-3xl text-[#F1E7DB] mb-3">
              No Record Found in Credential Registry
            </h1>

            <p className="text-sm text-[#A8A8A8] max-w-lg mx-auto mb-6 leading-relaxed">
              We could not locate an authentic GFG Certificate of Achievement associated with identifier{" "}
              <code className="text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded font-mono text-xs">
                {credentialId}
              </code>
              . The credential may have been entered incorrectly, or has not been issued through our
              verified assessment engine.
            </p>

            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 max-w-md mx-auto text-left text-xs text-[#999999] space-y-2 mb-8">
              <div className="flex items-center gap-2 font-mono text-[#D8C2A6]">
                <Lock className="w-3.5 h-3.5 text-[#A56F7C]" />
                <span>Anti-Tampering & Security Notice</span>
              </div>
              <p>
                Authentic GFG credentials are generated server-side upon verifying 100% coursework,
                passing proctored assessments (70%+), and completing approved practical projects.
                Certificates cannot be forged by client-side tampering.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#D8C2A6] text-[#111111] font-semibold text-xs uppercase tracking-wider hover:bg-[#E2D4C3] transition-all"
            >
              Explore GFG Learning Hub
            </Link>
          </div>
        ) : verification.status === "revoked" ? (
          /* REVOKED STATE */
          <div className="bg-[#181818] border border-red-500/40 rounded-2xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6 text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-[11px] font-mono text-red-300 tracking-wider uppercase mb-4">
              Status: Certificate Revoked
            </span>

            <h1 className="font-serif text-2xl sm:text-3xl text-[#F1E7DB] mb-3">
              This Credential Has Been Administratively Revoked
            </h1>

            <p className="text-sm text-[#A8A8A8] max-w-lg mx-auto mb-6 leading-relaxed">
              Certificate <span className="font-mono text-red-300 font-semibold">{credentialId}</span> for{" "}
              <strong>{verification.course_title}</strong> was previously issued but has since been revoked
              by the GFG Credential Governance Board.
            </p>

            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 max-w-lg mx-auto text-left text-xs text-red-200/90 space-y-1 mb-8 font-mono">
              <div className="font-bold uppercase tracking-wider text-red-300">Audited Revocation Rationale:</div>
              <p className="italic">"{verification.revocation_reason}"</p>
              {formattedRevokedDate && (
                <div className="text-[10px] text-red-400/80 pt-1">
                  Revocation Timestamp: {formattedRevokedDate}
                </div>
              )}
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#252525] hover:bg-[#303030] border border-white/10 text-[#D8C2A6] text-xs font-mono uppercase tracking-wider transition-all"
            >
              Return to Platform Home
            </Link>
          </div>
        ) : (
          /* AUTHENTIC VALID STATE */
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Status Header Badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#181818] border border-[#D8C2A6]/20 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400 font-semibold">
                      VERIFIED AUTHENTIC CREDENTIAL
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h1 className="font-serif text-xl sm:text-2xl text-[#F1E7DB] mt-0.5">
                    Official Certificate of Achievement
                  </h1>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#222222] hover:bg-[#2b2b2b] border border-[#D8C2A6]/20 text-[#D8C2A6] text-xs font-mono tracking-wider transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied Link" : "Share"}</span>
                </button>

                <a
                  href={`/api/learning/certificates/${credentialId}/download-pdf`}
                  download
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#D8C2A6] text-[#111111] font-semibold text-xs tracking-wider uppercase hover:bg-[#E2D4C3] transition-all shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>

            {/* Visual Certificate Card Preview (Simulating the A4 Award) */}
            <div className="bg-[#141414] border-2 border-[#D8C2A6]/40 rounded-3xl p-8 sm:p-12 relative shadow-2xl overflow-hidden">
              {/* Inner Decorative Framing Line */}
              <div className="absolute inset-3 border border-[#A56F7C]/30 rounded-2xl pointer-events-none" />

              {/* GFG Emblem & Header */}
              <div className="text-center space-y-2 mb-8 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F1F1F] border border-[#D8C2A6]/20 text-[10px] font-mono tracking-[0.25em] text-[#D8C2A6] uppercase">
                  <span>GFG — GAP FOR GOOD</span>
                </div>
                <div className="text-[11px] font-mono text-[#A56F7C] tracking-widest uppercase">
                  CAREER CONTINUITY, RETURN-TO-WORK & EMPOWERMENT ACADEMY
                </div>
              </div>

              {/* Recipient & Course Details */}
              <div className="text-center space-y-4 mb-10 relative z-10">
                <div className="text-xs uppercase tracking-widest text-[#999999] font-serif italic">
                  This formally certifies that
                </div>

                <div className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#F1E7DB] tracking-wide py-1 border-b border-[#A56F7C]/40 inline-block px-8">
                  {verification.recipient_name}
                </div>

                <div className="text-xs text-[#B5A99B] max-w-lg mx-auto pt-2 leading-relaxed">
                  has demonstrated verified proficiency, completed all mandatory coursework modules,
                  passed proctored assessments, and submitted an approved practical returnship capstone for:
                </div>

                <div className="font-sans text-xl sm:text-2xl md:text-3xl font-semibold text-[#D8C2A6] tracking-tight uppercase">
                  {verification.course_title}
                </div>
              </div>

              {/* Verified Learning Outcomes */}
              {verification.learning_outcomes && verification.learning_outcomes.length > 0 && (
                <div className="bg-[#1C1C1C] border border-[#D8C2A6]/15 rounded-xl p-5 mb-8 relative z-10">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#D8C2A6] mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Learning Outcomes & Return-To-Work Competencies</span>
                  </div>
                  <ul className="grid sm:grid-cols-2 gap-2.5 text-xs text-[#CCCCCC]">
                    {verification.learning_outcomes.map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#A56F7C] font-mono text-sm leading-none">•</span>
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottom Credential Verification Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#D8C2A6]/15 relative z-10 items-end">
                {/* Column 1: Credential Identifier & Date */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-[#888888] uppercase block">
                      Credential Identifier
                    </span>
                    <span className="font-mono text-sm font-semibold text-[#F1E7DB]">
                      {verification.credential_id}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#888888] uppercase block">
                      Issue Date
                    </span>
                    <span className="text-[#CCCCCC]">{formattedDate}</span>
                  </div>
                </div>

                {/* Column 2: Official Gold Medallion Seal */}
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full border-2 border-[#D8C2A6]/60 flex items-center justify-center p-1 bg-[#1A1A1A] shadow-lg">
                    <div className="w-full h-full rounded-full border border-[#A56F7C]/60 flex flex-col items-center justify-center text-[7px] font-mono tracking-widest text-[#D8C2A6]">
                      <span className="font-bold text-[8px]">OFFICIAL</span>
                      <span className="text-emerald-400 font-bold">VERIFIED</span>
                      <span className="text-[#A56F7C]">★ GFG ★</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-[#777777] uppercase tracking-wider mt-2">
                    Cryptographic Seal
                  </span>
                </div>

                {/* Column 3: Authorized Signatory */}
                <div className="space-y-1 text-right text-xs">
                  <div className="w-32 border-b border-[#D8C2A6]/40 ml-auto pb-1 mb-1">
                    <span className="font-serif italic text-sm text-[#F1E7DB]">
                      {verification.issuer_signatory}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-[#888888] uppercase">
                    Academic Director & Returnship Dean
                  </div>
                  <div className="text-[9px] text-[#A56F7C] font-mono">
                    {verification.issuer_name}
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Metadata & DPDP Compliance Note */}
            <div className="bg-[#181818] border border-white/5 rounded-2xl p-6 text-xs text-[#999999] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-mono text-[#D8C2A6] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Public Verification Transparency Protocol</span>
                </span>
                <span className="font-mono text-[10px] text-[#777777]">
                  DPDP Act 2023 Compliant Registry
                </span>
              </div>

              <p className="leading-relaxed">
                {verification.compliance_statement} Recipient personal email addresses, phone numbers,
                and internal database primary keys are strictly suppressed in public verification endpoints
                under GFG privacy invariants.
              </p>

              <div className="pt-2 border-t border-white/5 text-[11px] text-[#777777] leading-relaxed">
                <strong>Credential Integrity Disclaimer:</strong> All credentials are issued under GFG — Gap For Good
                institutional return-to-work standards. This credential confirms mastery of practical workplace
                capabilities and does not imply government, university, or NSDC formal accreditation without authorized statute.
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D8C2A6]/10 py-6 text-center text-xs font-mono text-[#666666] bg-[#111111]">
        <div className="max-w-5xl mx-auto px-4">
          GFG 2.0 Credential Transparency Registry • Zero Career-Gap Algorithmic Penalties
        </div>
      </footer>
    </div>
  );
}
