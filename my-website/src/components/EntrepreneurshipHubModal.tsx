"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Calculator,
  FileText,
  DollarSign,
  PieChart,
  Lightbulb,
  X,
  Check,
  Copy,
  Download,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  BookOpen,
  Info,
} from "lucide-react";
import { inclusivityApi, PricingCalculatorPayload, ProposalGeneratorPayload } from "@/lib/api";
import { useTranslation, AiTranslationDisclaimer } from "@/lib/i18n/LanguageContext";

interface EntrepreneurshipHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "pricing" | "planner" | "expenses" | "proposals" | "sectors";
}

export function EntrepreneurshipHubModal({
  isOpen,
  onClose,
  initialTab = "pricing",
}: EntrepreneurshipHubModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"pricing" | "planner" | "expenses" | "proposals" | "sectors">(initialTab);

  // Sync tab if initialTab changes
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // ============================================================================
  // TAB 1: PRICING WORKSHEET STATE
  // ============================================================================
  const [pricingInputs, setPricingInputs] = useState<PricingCalculatorPayload>({
    desired_monthly_income: 60000,
    billable_hours_per_week: 20,
    monthly_business_expenses: 8000,
    tax_reserve_percentage: 15,
    vacation_weeks_per_year: 4,
  });

  const [pricingResult, setPricingResult] = useState<any>(null);
  const [isCalculatingPricing, setIsCalculatingPricing] = useState<boolean>(false);

  // Auto-calculate on initial mount and when inputs change
  useEffect(() => {
    if (isOpen) {
      calculateRates();
    }
  }, [isOpen, pricingInputs]);

  const calculateRates = async () => {
    setIsCalculatingPricing(true);
    try {
      const res = await inclusivityApi.calculatePricing(pricingInputs);
      setPricingResult(res);
    } catch (e) {
      console.warn("Pricing calculation error:", e);
    } finally {
      setIsCalculatingPricing(false);
    }
  };

  // ============================================================================
  // TAB 2: BUSINESS IDEA PLANNER STATE
  // ============================================================================
  const [plannerData, setPlannerData] = useState({
    business_name: "Aura Strategic Advisory",
    sector: "Freelance Consulting & Advisory",
    prior_domain_skills: "Operations Management, Process Auditing, Vendor Procurement",
    target_customer: "Mid-sized logistics and retail firms seeking to cut waste",
    core_offering: "30-Day Lean Operations Audit & Cost Optimization Roadmap",
    pricing_model: "₹45,000 fixed milestone per audit (2 client capacity/month)",
    immediate_next_step: "Reach out to 5 former operational directors to share capabilities deck",
  });
  const [plannerSaved, setPlannerSaved] = useState<boolean>(false);

  // ============================================================================
  // TAB 3: MONTHLY EXPENSE TRACKER STATE
  // ============================================================================
  const [expenses, setExpenses] = useState([
    { id: 1, name: "High-Speed Fiber Internet", category: "Connectivity", amount: 1200 },
    { id: 2, name: "Productivity Software & Zoom Pro", category: "Software", amount: 2500 },
    { id: 3, name: "Accounting & GST Invoicing Tool", category: "Admin", amount: 800 },
    { id: 4, name: "Co-working Space (Part-time Desk)", category: "Workspace", amount: 3500 },
    { id: 5, name: "Equipment & Hardware Reserve Buffer", category: "Buffer", amount: 2000 },
  ]);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState<number>(1000);
  const [newExpenseCategory, setNewExpenseCategory] = useState("Software");

  const totalMonthlyExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const requiredHourlyCoverage =
    pricingResult?.computed_metrics?.recommended_hourly_rate || 1000;
  const breakEvenHoursNeeded = (totalMonthlyExpenses / requiredHourlyCoverage).toFixed(1);

  const addExpense = () => {
    if (newExpenseName.trim() && newExpenseAmount > 0) {
      setExpenses([
        ...expenses,
        {
          id: Date.now(),
          name: newExpenseName.trim(),
          category: newExpenseCategory,
          amount: newExpenseAmount,
        },
      ]);
      setNewExpenseName("");
      setNewExpenseAmount(1000);
    }
  };

  const removeExpense = (id: number) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  // ============================================================================
  // TAB 4: CLIENT PROPOSAL GENERATOR STATE
  // ============================================================================
  const [proposalInputs, setProposalInputs] = useState<ProposalGeneratorPayload>({
    client_name: "Priya Sharma",
    client_company: "Zenith Retail Solutions",
    project_title: "Vendor Onboarding & Compliance Modernization",
    service_type: "Operations & Process Consulting",
    deliverables: [
      "Current state workflow review and pain-point diagnostic",
      "Standardized 5-step digital vendor onboarding checklist",
      "Executive presentation with 90-day implementation roadmap",
    ],
    timeline_weeks: 4,
    pricing_structure: "fixed_milestone",
    total_fee: 55000,
    payment_terms: "50% advance upon contract signing, 50% upon final sign-off",
    special_notes: "Includes 2 rounds of review feedback and 1 month asynchronous email support.",
  });

  const [deliverableInput, setDeliverableInput] = useState<string>("");
  const [generatedProposal, setGeneratedProposal] = useState<string>("");
  const [isGeneratingProposal, setIsGeneratingProposal] = useState<boolean>(false);
  const [copiedProposal, setCopiedProposal] = useState<boolean>(false);

  const handleAddDeliverable = () => {
    if (deliverableInput.trim()) {
      setProposalInputs({
        ...proposalInputs,
        deliverables: [...proposalInputs.deliverables, deliverableInput.trim()],
      });
      setDeliverableInput("");
    }
  };

  const handleRemoveDeliverable = (index: number) => {
    setProposalInputs({
      ...proposalInputs,
      deliverables: proposalInputs.deliverables.filter((_, i) => i !== index),
    });
  };

  const handleGenerateProposal = async () => {
    setIsGeneratingProposal(true);
    try {
      const res = await inclusivityApi.generateProposal(proposalInputs);
      if (res?.proposal?.formatted_markdown) {
        setGeneratedProposal(res.proposal.formatted_markdown);
      }
    } catch (e) {
      console.warn("Proposal generation error:", e);
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedProposal(true);
    setTimeout(() => setCopiedProposal(false), 2500);
  };

  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ============================================================================
  // TAB 5: SECTOR STARTER PLAYBOOKS STATE
  // ============================================================================
  const [sectorsData, setSectorsData] = useState<any[]>([]);

  useEffect(() => {
    inclusivityApi.getEntrepreneurshipTemplates().then((res) => {
      if (res?.sectors) setSectorsData(res.sectors);
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="entrepreneurship-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-5xl bg-[#141414] border border-[#D8C2A6]/20 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#F1E7DB]"
        tabIndex={-1}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-[#D8C2A6]/10 flex items-center justify-between bg-[#181818]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#A56F7C]/20 border border-[#A56F7C]/40 flex items-center justify-center text-[#A56F7C] shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="micro-label text-[10px] text-[#A56F7C]">
                  {t("guided.opt5.badge")}
                </span>
                <AiTranslationDisclaimer />
              </div>
              <h2 id="entrepreneurship-title" className="text-lg sm:text-xl font-serif text-[#F1E7DB]">
                {t("entrepreneurship.hub_title")}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="w-9 h-9 rounded-full bg-[#242424] hover:bg-[#333] flex items-center justify-center text-[#D8C2A6] transition-colors focus-visible:ring-2 focus-visible:ring-[#F1E7DB]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          role="tablist"
          aria-label="Entrepreneurship tools"
          className="flex border-b border-[#D8C2A6]/10 bg-[#121212] overflow-x-auto no-scrollbar px-4 sm:px-6"
        >
          {[
            { id: "pricing", label: t("entrepreneurship.tab_pricing"), icon: Calculator },
            { id: "planner", label: t("entrepreneurship.tab_planner"), icon: Lightbulb },
            { id: "expenses", label: t("entrepreneurship.tab_expenses"), icon: PieChart },
            { id: "proposals", label: t("entrepreneurship.tab_proposals"), icon: FileText },
            { id: "sectors", label: t("entrepreneurship.tab_sectors"), icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 text-xs font-mono tracking-wider uppercase border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                  active
                    ? "border-[#D8C2A6] text-[#F1E7DB] font-semibold bg-[#1C1C1C]"
                    : "border-transparent text-[#9A9A9A] hover:text-[#D8C2A6]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-[#141414]">
          {/* Prominent Non-Speculative Financial Warning (Part 5 mandate) */}
          <div
            role="note"
            aria-label="Financial guidance warning"
            className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-[#F1E7DB]"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-amber-300">Sustainable Financial Budgeting Notice: </span>
              {t("entrepreneurship.disclaimer")}
            </div>
          </div>

          {/* ================================================================ */}
          {/* TAB 1: SERVICE PRICING WORKSHEET                                 */}
          {/* ================================================================ */}
          {activeTab === "pricing" && (
            <div className="space-y-8 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Inputs Column */}
                <div className="lg:col-span-6 space-y-5 bg-[#1A1A1A] border border-[#D8C2A6]/10 p-6 rounded-2xl">
                  <h3 className="text-sm font-mono uppercase tracking-wider text-[#D8C2A6] flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    <span>Your Sustainable Financial Inputs</span>
                  </h3>

                  {/* Input 1: Desired Monthly Income */}
                  <div>
                    <label htmlFor="desired-income" className="block text-xs font-medium text-[#F1E7DB] mb-1.5">
                      {t("entrepreneurship.desired_income")}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs font-mono text-[#888]">₹</span>
                      <input
                        id="desired-income"
                        type="number"
                        min="10000"
                        step="5000"
                        value={pricingInputs.desired_monthly_income}
                        onChange={(e) =>
                          setPricingInputs({
                            ...pricingInputs,
                            desired_monthly_income: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-[#111] border border-[#D8C2A6]/20 rounded-xl pl-8 pr-4 py-2.5 text-xs font-mono text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                      />
                    </div>
                  </div>

                  {/* Input 2: Billable Hours / Week */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="billable-hours" className="text-xs font-medium text-[#F1E7DB]">
                        {t("entrepreneurship.billable_hours")}
                      </label>
                      <span className="text-xs font-mono text-[#D8C2A6] font-bold">
                        {pricingInputs.billable_hours_per_week} hrs/week
                      </span>
                    </div>
                    <input
                      id="billable-hours"
                      type="range"
                      min="5"
                      max="40"
                      step="1"
                      value={pricingInputs.billable_hours_per_week}
                      onChange={(e) =>
                        setPricingInputs({
                          ...pricingInputs,
                          billable_hours_per_week: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#D8C2A6] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#777] font-mono mt-1">
                      <span>5 hrs (Part-time gentle)</span>
                      <span>20 hrs (Balanced)</span>
                      <span>40 hrs (Full-time)</span>
                    </div>
                  </div>

                  {/* Input 3: Monthly Business Expenses */}
                  <div>
                    <label htmlFor="business-expenses" className="block text-xs font-medium text-[#F1E7DB] mb-1.5">
                      {t("entrepreneurship.business_expenses")}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs font-mono text-[#888]">₹</span>
                      <input
                        id="business-expenses"
                        type="number"
                        min="0"
                        step="1000"
                        value={pricingInputs.monthly_business_expenses}
                        onChange={(e) =>
                          setPricingInputs({
                            ...pricingInputs,
                            monthly_business_expenses: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-[#111] border border-[#D8C2A6]/20 rounded-xl pl-8 pr-4 py-2.5 text-xs font-mono text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                      />
                    </div>
                  </div>

                  {/* Row: Tax Reserve & Vacation Weeks */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tax-reserve" className="block text-xs font-medium text-[#F1E7DB] mb-1.5">
                        {t("entrepreneurship.tax_reserve")}
                      </label>
                      <input
                        id="tax-reserve"
                        type="number"
                        min="0"
                        max="40"
                        value={pricingInputs.tax_reserve_percentage}
                        onChange={(e) =>
                          setPricingInputs({
                            ...pricingInputs,
                            tax_reserve_percentage: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-[#111] border border-[#D8C2A6]/20 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                      />
                    </div>
                    <div>
                      <label htmlFor="vacation-weeks" className="block text-xs font-medium text-[#F1E7DB] mb-1.5">
                        {t("entrepreneurship.vacation_weeks")}
                      </label>
                      <input
                        id="vacation-weeks"
                        type="number"
                        min="0"
                        max="12"
                        value={pricingInputs.vacation_weeks_per_year}
                        onChange={(e) =>
                          setPricingInputs({
                            ...pricingInputs,
                            vacation_weeks_per_year: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-[#111] border border-[#D8C2A6]/20 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                      />
                    </div>
                  </div>
                </div>

                {/* Outputs Column */}
                <div className="lg:col-span-6 space-y-5">
                  <div className="bg-[#1C1C1C] border border-[#D8C2A6]/25 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D8C2A6]/5 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex items-center justify-between border-b border-[#D8C2A6]/10 pb-4 mb-4">
                      <span className="micro-label text-[10px] text-[#A56F7C]">
                        RECOMMENDED BENCHMARKS
                      </span>
                      <span className="text-[11px] text-[#888] font-mono">
                        ~{pricingResult?.computed_metrics?.monthly_billable_hours || 0} billable hrs/mo
                      </span>
                    </div>

                    {/* Big Hourly Rate Metric */}
                    <div className="mb-6">
                      <div className="text-xs text-[#9A9A9A] mb-1">
                        {t("entrepreneurship.hourly_rate")}
                      </div>
                      <div className="text-3xl sm:text-4xl font-serif text-[#F1E7DB] flex items-baseline gap-1">
                        <span>₹{pricingResult?.computed_metrics?.recommended_hourly_rate?.toLocaleString("en-IN") || "—"}</span>
                        <span className="text-xs font-mono text-[#9A9A9A]">/ hour</span>
                      </div>
                      <p className="text-[11px] text-[#C4B5A5] mt-1.5">
                        Covers your desired take-home, taxes, operational expenses, and 4 weeks of paid rest.
                      </p>
                    </div>

                    {/* Breakdown Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-xl bg-[#141414] border border-[#D8C2A6]/10">
                        <div className="text-[10px] text-[#888] uppercase font-mono">
                          {t("entrepreneurship.day_rate")}
                        </div>
                        <div className="text-lg font-serif text-[#D8C2A6] mt-1">
                          ₹{pricingResult?.computed_metrics?.recommended_day_rate?.toLocaleString("en-IN") || "—"}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#141414] border border-[#D8C2A6]/10">
                        <div className="text-[10px] text-[#888] uppercase font-mono">
                          {t("entrepreneurship.project_fee")}
                        </div>
                        <div className="text-lg font-serif text-[#D8C2A6] mt-1">
                          ₹{pricingResult?.computed_metrics?.suggested_small_project_fee?.toLocaleString("en-IN") || "—"}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#141414] border border-[#D8C2A6]/10">
                        <div className="text-[10px] text-[#888] uppercase font-mono">
                          Typical Medium Project (~40h)
                        </div>
                        <div className="text-lg font-serif text-[#F1E7DB] mt-1">
                          ₹{pricingResult?.computed_metrics?.suggested_medium_project_fee?.toLocaleString("en-IN") || "—"}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#141414] border border-[#D8C2A6]/10">
                        <div className="text-[10px] text-[#888] uppercase font-mono">
                          {t("entrepreneurship.retainer_fee")}
                        </div>
                        <div className="text-lg font-serif text-[#A56F7C] mt-1">
                          ₹{pricingResult?.computed_metrics?.suggested_part_time_retainer?.toLocaleString("en-IN") || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Gross Revenue Target Alert */}
                    <div className="mt-5 pt-4 border-t border-[#D8C2A6]/10 flex items-center justify-between text-xs font-mono">
                      <span className="text-[#9A9A9A]">Gross Monthly Invoicing Target:</span>
                      <span className="text-[#F1E7DB] font-bold">
                        ₹{pricingResult?.computed_metrics?.gross_monthly_revenue_target?.toLocaleString("en-IN") || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Action: Use in Proposal */}
                  <button
                    type="button"
                    onClick={() => {
                      if (pricingResult?.computed_metrics?.suggested_medium_project_fee) {
                        setProposalInputs({
                          ...proposalInputs,
                          total_fee: pricingResult.computed_metrics.suggested_medium_project_fee,
                        });
                      }
                      setActiveTab("proposals");
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-[#D8C2A6] text-[#111111] text-xs font-semibold uppercase tracking-wider hover:bg-[#F1E7DB] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Use Rates in Proposal Generator</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: BUSINESS IDEA PLANNER                                     */}
          {/* ================================================================ */}
          {activeTab === "planner" && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-150">
              <div className="p-6 rounded-2xl bg-[#1A1A1A] border border-[#D8C2A6]/15 space-y-5">
                <div className="border-b border-[#D8C2A6]/10 pb-4">
                  <h3 className="text-base font-serif text-[#F1E7DB]">
                    Independent Business Idea Planner
                  </h3>
                  <p className="text-xs text-[#9A9A9A] mt-1">
                    Translate your domain skills into a viable, low-risk service offering without speculative overhead.
                  </p>
                </div>

                {/* Field 1: Business / Practice Name */}
                <div>
                  <label htmlFor="planner-name" className="block text-xs font-medium text-[#F1E7DB] mb-1.5">
                    1. Proposed Practice or Venture Name
                  </label>
                  <input
                    id="planner-name"
                    type="text"
                    value={plannerData.business_name}
                    onChange={(e) => setPlannerData({ ...plannerData, business_name: e.target.value })}
                    className="w-full bg-[#111] border border-[#D8C2A6]/20 rounded-xl px-4 py-2.5 text-xs text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                  />
                </div>

                {/* Field 2: Prior Domain Skills */}
                <div>
                  <label htmlFor="planner-skills" className="block text-xs font-medium text-[#F1E7DB] mb-1.5">
                    2. Core Prior Skills You Are Monetizing
                  </label>
                  <input
                    id="planner-skills"
                    type="text"
                    value={plannerData.prior_domain_skills}
                    onChange={(e) => setPlannerData({ ...plannerData, prior_domain_skills: e.target.value })}
                    className="w-full bg-[#111] border border-[#D8C2A6]/20 rounded-xl px-4 py-2.5 text-xs text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                  />
                </div>

                {/* Field 3: Target Customer */}
                <div>
                  <label htmlFor="planner-target" className="block text-xs font-medium text-[#F1E7DB] mb-1.5">
                    3. Target Client Segment / Beneficiary
                  </label>
                  <textarea
                    id="planner-target"
                    rows={2}
                    value={plannerData.target_customer}
                    onChange={(e) => setPlannerData({ ...plannerData, target_customer: e.target.value })}
                    className="w-full bg-[#111] border border-[#D8C2A6]/20 rounded-xl p-3 text-xs text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                  />
                </div>

                {/* Field 4: High-Impact 30-Day Quick Win Offering */}
                <div>
                  <label htmlFor="planner-offering" className="block text-xs font-medium text-[#F1E7DB] mb-1.5">
                    4. Initial 30-Day Quick-Win Service Offering
                  </label>
                  <textarea
                    id="planner-offering"
                    rows={2}
                    value={plannerData.core_offering}
                    onChange={(e) => setPlannerData({ ...plannerData, core_offering: e.target.value })}
                    className="w-full bg-[#111] border border-[#D8C2A6]/20 rounded-xl p-3 text-xs text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                  />
                </div>

                {/* Field 5: Low-Risk Launch Step */}
                <div>
                  <label htmlFor="planner-action" className="block text-xs font-medium text-[#F1E7DB] mb-1.5">
                    5. First Step This Week (Warm Network Outreach)
                  </label>
                  <input
                    id="planner-action"
                    type="text"
                    value={plannerData.immediate_next_step}
                    onChange={(e) => setPlannerData({ ...plannerData, immediate_next_step: e.target.value })}
                    className="w-full bg-[#111] border border-[#D8C2A6]/20 rounded-xl px-4 py-2.5 text-xs text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPlannerSaved(true);
                      setTimeout(() => setPlannerSaved(false), 3000);
                    }}
                    className="flex-1 py-3 rounded-full bg-[#D8C2A6] text-[#111111] text-xs font-semibold uppercase tracking-wider hover:bg-[#F1E7DB] transition-all flex items-center justify-center gap-2"
                  >
                    {plannerSaved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    <span>{plannerSaved ? "Plan Saved Locally" : "Save Business Plan"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const text = `BUSINESS PLAN CANVAS: ${plannerData.business_name}
Sector: ${plannerData.sector}
Core Monetized Skills: ${plannerData.prior_domain_skills}
Target Audience: ${plannerData.target_customer}
High-Impact Offering: ${plannerData.core_offering}
Pricing Model: ${plannerData.pricing_model}
First Action: ${plannerData.immediate_next_step}
Created via GFG Entrepreneurship Hub`;
                      downloadTextFile(text, "business_plan_canvas.txt");
                    }}
                    className="py-3 px-5 rounded-full bg-[#242424] hover:bg-[#333] text-xs font-medium text-[#D8C2A6] flex items-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Plan</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: MONTHLY EXPENSE TRACKER                                   */}
          {/* ================================================================ */}
          {activeTab === "expenses" && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#D8C2A6]/15">
                  <div className="text-[10px] text-[#9A9A9A] font-mono uppercase">Total Monthly Overhead</div>
                  <div className="text-2xl font-serif text-[#F1E7DB] mt-1">₹{totalMonthlyExpenses.toLocaleString("en-IN")}</div>
                </div>
                <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#D8C2A6]/15">
                  <div className="text-[10px] text-[#9A9A9A] font-mono uppercase">Calculated Hourly Benchmark</div>
                  <div className="text-2xl font-serif text-[#D8C2A6] mt-1">₹{requiredHourlyCoverage.toLocaleString("en-IN")}/hr</div>
                </div>
                <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#D8C2A6]/15">
                  <div className="text-[10px] text-[#9A9A9A] font-mono uppercase">Break-Even Client Volume</div>
                  <div className="text-2xl font-serif text-[#A56F7C] mt-1">{breakEvenHoursNeeded} billable hrs/mo</div>
                </div>
              </div>

              {/* Add Expense Form */}
              <div className="p-5 rounded-xl bg-[#1A1A1A] border border-[#D8C2A6]/10 flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label htmlFor="new-exp-name" className="block text-[11px] text-[#888] mb-1 font-mono">Expense Item</label>
                  <input
                    id="new-exp-name"
                    type="text"
                    value={newExpenseName}
                    onChange={(e) => setNewExpenseName(e.target.value)}
                    placeholder="e.g. Canva Pro, Mobile Data Pack, Packaging"
                    className="w-full bg-[#111] border border-[#D8C2A6]/20 rounded-lg px-3 py-2 text-xs text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                  />
                </div>
                <div className="w-36">
                  <label htmlFor="new-exp-cat" className="block text-[11px] text-[#888] mb-1 font-mono">Category</label>
                  <select
                    id="new-exp-cat"
                    value={newExpenseCategory}
                    onChange={(e) => setNewExpenseCategory(e.target.value)}
                    className="w-full bg-[#111] border border-[#D8C2A6]/20 rounded-lg px-3 py-2 text-xs text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                  >
                    <option value="Software">Software</option>
                    <option value="Connectivity">Connectivity</option>
                    <option value="Workspace">Workspace</option>
                    <option value="Admin">Admin</option>
                    <option value="Buffer">Buffer / Reserve</option>
                  </select>
                </div>
                <div className="w-32">
                  <label htmlFor="new-exp-amt" className="block text-[11px] text-[#888] mb-1 font-mono">Amount (₹)</label>
                  <input
                    id="new-exp-amt"
                    type="number"
                    min="100"
                    step="100"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(Number(e.target.value) || 0)}
                    className="w-full bg-[#111] border border-[#D8C2A6]/20 rounded-lg px-3 py-2 text-xs text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                  />
                </div>
                <button
                  type="button"
                  onClick={addExpense}
                  className="px-4 py-2 rounded-lg bg-[#D8C2A6] text-[#111111] text-xs font-semibold hover:bg-[#F1E7DB] transition-all"
                >
                  + Add Expense
                </button>
              </div>

              {/* Expense Items List */}
              <div className="space-y-2">
                {expenses.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#1C1C1C] border border-[#D8C2A6]/10 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#252525] text-[#D8C2A6]">
                        {item.category}
                      </span>
                      <span className="font-medium text-[#F1E7DB]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm text-[#F1E7DB]">₹{item.amount.toLocaleString("en-IN")}</span>
                      <button
                        type="button"
                        onClick={() => removeExpense(item.id)}
                        className="text-[#888] hover:text-rose-400 text-xs px-2 py-1"
                        aria-label={`Remove ${item.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 4: CLIENT PROPOSAL GENERATOR                                 */}
          {/* ================================================================ */}
          {activeTab === "proposals" && (
            <div className="space-y-8 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Inputs */}
                <div className="lg:col-span-5 space-y-4 bg-[#1A1A1A] p-6 rounded-2xl border border-[#D8C2A6]/10">
                  <h3 className="text-sm font-mono uppercase tracking-wider text-[#D8C2A6] flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Commercial Terms & Scope</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="prop-client" className="block text-[11px] text-[#888] font-mono mb-1">
                        {t("entrepreneurship.proposal_client")}
                      </label>
                      <input
                        id="prop-client"
                        type="text"
                        value={proposalInputs.client_name}
                        onChange={(e) => setProposalInputs({ ...proposalInputs, client_name: e.target.value })}
                        className="w-full bg-[#111] border border-[#D8C2A6]/20 rounded-lg p-2 text-xs text-[#F1E7DB]"
                      />
                    </div>
                    <div>
                      <label htmlFor="prop-company" className="block text-[11px] text-[#888] font-mono mb-1">
                        {t("entrepreneurship.proposal_company")}
                      </label>
                      <input
                        id="prop-company"
                        type="text"
                        value={proposalInputs.client_company}
                        onChange={(e) => setProposalInputs({ ...proposalInputs, client_company: e.target.value })}
                        className="w-full bg-[#111] border border-[#D8C2A6]/20 rounded-lg p-2 text-xs text-[#F1E7DB]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="prop-title" className="block text-[11px] text-[#888] font-mono mb-1">
                      {t("entrepreneurship.proposal_title")}
                    </label>
                    <input
                      id="prop-title"
                      type="text"
                      value={proposalInputs.project_title}
                      onChange={(e) => setProposalInputs({ ...proposalInputs, project_title: e.target.value })}
                      className="w-full bg-[#111] border border-[#D8C2A6]/20 rounded-lg p-2 text-xs text-[#F1E7DB]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="prop-fee" className="block text-[11px] text-[#888] font-mono mb-1">
                        {t("entrepreneurship.proposal_fee")}
                      </label>
                      <input
                        id="prop-fee"
                        type="number"
                        step="5000"
                        value={proposalInputs.total_fee}
                        onChange={(e) => setProposalInputs({ ...proposalInputs, total_fee: Number(e.target.value) || 0 })}
                        className="w-full bg-[#111] border border-[#D8C2A6]/20 rounded-lg p-2 text-xs font-mono text-[#F1E7DB]"
                      />
                    </div>
                    <div>
                      <label htmlFor="prop-weeks" className="block text-[11px] text-[#888] font-mono mb-1">
                        {t("entrepreneurship.proposal_weeks")}
                      </label>
                      <input
                        id="prop-weeks"
                        type="number"
                        min="1"
                        max="24"
                        value={proposalInputs.timeline_weeks}
                        onChange={(e) => setProposalInputs({ ...proposalInputs, timeline_weeks: Number(e.target.value) || 1 })}
                        className="w-full bg-[#111] border border-[#D8C2A6]/20 rounded-lg p-2 text-xs font-mono text-[#F1E7DB]"
                      />
                    </div>
                  </div>

                  {/* Deliverables management */}
                  <div>
                    <label className="block text-[11px] text-[#888] font-mono mb-1">
                      Key Scope Deliverables
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={deliverableInput}
                        onChange={(e) => setDeliverableInput(e.target.value)}
                        placeholder="Add deliverable..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddDeliverable();
                          }
                        }}
                        className="flex-1 bg-[#111] border border-[#D8C2A6]/20 rounded-lg px-2.5 py-1.5 text-xs text-[#F1E7DB]"
                      />
                      <button
                        type="button"
                        onClick={handleAddDeliverable}
                        className="px-3 py-1.5 rounded-lg bg-[#333] hover:bg-[#444] text-xs text-[#D8C2A6]"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {proposalInputs.deliverables.map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-[#111] text-[11px] text-[#C4B5A5]">
                          <span>• {d}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDeliverable(i)}
                            className="text-[#777] hover:text-rose-400 px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateProposal}
                    disabled={isGeneratingProposal}
                    className="w-full py-3 rounded-full bg-[#D8C2A6] text-[#111111] text-xs font-semibold uppercase tracking-wider hover:bg-[#F1E7DB] transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isGeneratingProposal ? "Generating..." : t("entrepreneurship.proposal_generate_btn")}</span>
                  </button>
                </div>

                {/* Generated Preview */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6]">
                      Proposal Live Preview
                    </span>
                    {generatedProposal && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(generatedProposal)}
                          className="px-3 py-1.5 rounded-lg bg-[#222] hover:bg-[#333] border border-[#D8C2A6]/15 text-xs text-[#D8C2A6] flex items-center gap-1.5 transition-all"
                        >
                          {copiedProposal ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedProposal ? t("common.copied") : t("entrepreneurship.copy_proposal")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadTextFile(generatedProposal, `Proposal_${proposalInputs.client_name.replace(/\s+/g, "_")}.md`)}
                          className="px-3 py-1.5 rounded-lg bg-[#222] hover:bg-[#333] border border-[#D8C2A6]/15 text-xs text-[#D8C2A6] flex items-center gap-1.5 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{t("entrepreneurship.download_proposal")}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-6 rounded-2xl bg-[#1A1A1A] border border-[#D8C2A6]/15 text-xs text-[#C4B5A5] font-mono leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap">
                    {generatedProposal ? (
                      generatedProposal
                    ) : (
                      <div className="text-center py-12 text-[#777]">
                        Click "Generate Formal Client Proposal" to format deliverables, commercial milestones, and payment terms into a ready-to-send document.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 5: STARTER PLAYBOOKS                                         */}
          {/* ================================================================ */}
          {activeTab === "sectors" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
              {sectorsData.map((sector) => (
                <div
                  key={sector.id}
                  className="p-6 rounded-2xl bg-[#1A1A1A] border border-[#D8C2A6]/15 space-y-4 hover:border-[#D8C2A6]/35 transition-all"
                >
                  <div>
                    <span className="micro-label text-[10px] text-[#A56F7C]">NON-IT / CONSULTING / CREATIVE</span>
                    <h3 className="text-base font-serif text-[#F1E7DB] mt-1">{sector.title}</h3>
                    <p className="text-xs text-[#9A9A9A] mt-2 leading-relaxed">{sector.description}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141414] border border-[#D8C2A6]/10 text-xs">
                    <span className="font-mono text-[#D8C2A6] text-[10px] uppercase block mb-1">
                      Typical Startup Outlay
                    </span>
                    <span className="text-[#F1E7DB]">{sector.startup_investment_range}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#888] uppercase block mb-1.5">
                      Sample Services
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sector.typical_services.map((srv: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 rounded bg-[#242424] text-[11px] text-[#C4B5A5]">
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#D8C2A6]/10">
                    <span className="text-[10px] font-mono text-[#888] uppercase block mb-1.5">
                      First 3 Steps
                    </span>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-[#F1E7DB]">
                      {sector.recommended_first_steps.map((st: string, idx: number) => (
                        <li key={idx} className="leading-relaxed text-[11px] text-[#C4B5A5]">{st}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#D8C2A6]/10 bg-[#181818] flex items-center justify-between">
          <div className="text-[11px] text-[#888] font-mono">
            GFG Module 9 — Inclusivity & Financial Independence
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#D8C2A6] text-[#111111] text-xs font-semibold uppercase tracking-wider hover:bg-[#F1E7DB] transition-all"
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
