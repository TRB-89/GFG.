// GFG Centralized Data Classification & Metadata Standards

export type DataClassification =
  | "verified_production"
  | "user_submitted_unverified"
  | "simulated_demonstration"
  | "proposed_pilot_target";

export interface DataClassificationMeta {
  source_type: DataClassification;
  is_demo: boolean;
  verification_status: string;
  created_at: string;
  last_verified_at?: string;
  limitations?: string;
}

export const CLASSIFICATION_DESCRIPTIONS: Record<
  DataClassification,
  { label: string; shortBadge: string; description: string; badgeStyle: string }
> = {
  verified_production: {
    label: "Verified Production Data",
    shortBadge: "VERIFIED",
    description:
      "Formally authenticated against institution registry, legal employer verification, or cryptographic passport audit.",
    badgeStyle: "bg-emerald-950/70 border-emerald-500/40 text-emerald-300",
  },
  user_submitted_unverified: {
    label: "User-Submitted (Unverified)",
    shortBadge: "SELF-ATTESTED",
    description:
      "Self-reported candidate history, portfolio links, or break statements pending third-party credential verification.",
    badgeStyle: "bg-amber-950/70 border-amber-500/40 text-amber-300",
  },
  simulated_demonstration: {
    label: "Simulated Demonstration Data",
    shortBadge: "DEMO DATA",
    description:
      "Illustrative test scenario created for platform walkthrough. Not representative of actual candidate or proprietary corporate data.",
    badgeStyle: "bg-[#25181c] border-[#A56F7C]/50 text-[#D8C2A6]",
  },
  proposed_pilot_target: {
    label: "Proposed Pilot Target",
    shortBadge: "PILOT TARGET",
    description:
      "Institutional framework, benchmark rubric, or corporate program model under exploratory evaluation for future cohorts.",
    badgeStyle: "bg-indigo-950/70 border-indigo-500/40 text-indigo-300",
  },
};
