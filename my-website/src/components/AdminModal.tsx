"use client";

import React, { useState } from "react";
import { X, Search, Check, ShieldAlert, CheckCircle2, UserCheck, Eye, Filter } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: any[];
  onApproveReport?: (id: string) => void;
  onFlagReport?: (id: string) => void;
}

export function AdminModal({
  isOpen,
  onClose,
  reports,
  onApproveReport,
  onFlagReport,
}: AdminModalProps) {
  const [activeTab, setActiveTab] = useState<"moderation" | "projects" | "users">("moderation");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  if (!isOpen) return null;

  const mockReports = [
    {
      id: "rep-001",
      title: "Illegal chemical discharge into Bellandur lake feeder stream",
      sdg: "06",
      location: "Bangalore, Sector 2",
      reportedBy: "citizen_412",
      date: "2026-10-10",
      status: "PENDING_REVIEW",
      confidence: "94% AI CONFIRMED",
    },
    {
      id: "rep-002",
      title: "Urban canopy degradation and asphalt heat radiation",
      sdg: "11",
      location: "Koramangala 4th Block",
      reportedBy: "priya.sharma@example.com",
      date: "2026-10-09",
      status: "VERIFIED",
      confidence: "99% SATELLITE MATCH",
    },
    {
      id: "rep-003",
      title: "Open agricultural stubble burn plume detected",
      sdg: "13",
      location: "Peri-urban Northern Ring",
      reportedBy: "field_sensor_09",
      date: "2026-10-08",
      status: "VERIFIED",
      confidence: "96% THERMAL ANOMALY",
    },
    {
      id: "rep-004",
      title: "Unsegregated hospital biomedical plastic waste dumping",
      sdg: "12",
      location: "Industrial Corridor Ward 12",
      reportedBy: "eco_guard_3",
      date: "2026-10-07",
      status: "ACTION_DISPATCHED",
      confidence: "91% PHOTO EVIDENCE",
    },
  ];

  const filteredReports = mockReports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 lg:p-12 bg-black/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl bg-[#E4C29B] text-[#151A17] rounded-none md:rounded-2xl shadow-2xl border border-[#18372C]/15 overflow-hidden my-auto max-h-screen md:max-h-[92vh] flex flex-col font-sans">
        {/* Header Bar */}
        <div className="px-6 md:px-10 py-5 border-b border-[#18372C]/15 flex items-center justify-between bg-[#E4C29B]/90 backdrop-blur-xs sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#18372C]" />
            <span className="micro-label">GOVERNANCE & MODERATION SYSTEM</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#18372C]/10 text-[#18372C] transition-colors"
            aria-label="Close admin modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls & Filters */}
        <div className="px-6 md:px-10 py-4 border-b border-[#18372C]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#F5E8D5]/50">
          <div className="flex items-center space-x-1 border border-[#18372C]/15 rounded-md p-1 bg-[#E4C29B]">
            <button
              onClick={() => setActiveTab("moderation")}
              className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-all ${
                activeTab === "moderation"
                  ? "bg-[#18372C] text-[#F5E8D5]"
                  : "text-[#18372C] hover:opacity-75"
              }`}
            >
              Problem Moderation ({filteredReports.length})
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-all ${
                activeTab === "projects"
                  ? "bg-[#18372C] text-[#F5E8D5]"
                  : "text-[#18372C] hover:opacity-75"
              }`}
            >
              Project Approvals (3)
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-all ${
                activeTab === "users"
                  ? "bg-[#18372C] text-[#F5E8D5]"
                  : "text-[#18372C] hover:opacity-75"
              }`}
            >
              User Roles
            </button>
          </div>

          {/* Search & Status Filter */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#18372C]/50" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F5E8D5] border border-[#18372C]/20 rounded font-mono focus:outline-hidden"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-[#F5E8D5] border border-[#18372C]/20 rounded px-2.5 py-1.5 font-mono text-[#18372C] focus:outline-hidden"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING_REVIEW">Pending</option>
              <option value="VERIFIED">Verified</option>
              <option value="ACTION_DISPATCHED">Dispatched</option>
            </select>
          </div>
        </div>

        {/* Content Table Area */}
        <div className="overflow-y-auto px-6 md:px-10 py-6 flex-1">
          {activeTab === "moderation" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-[#18372C]/20 text-[#18372C]/70">
                    <th className="py-3 px-3">ID / SDG</th>
                    <th className="py-3 px-3">REPORTED INCIDENT</th>
                    <th className="py-3 px-3">LOCATION</th>
                    <th className="py-3 px-3">DATE</th>
                    <th className="py-3 px-3">STATUS</th>
                    <th className="py-3 px-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18372C]/10">
                  {filteredReports.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F5E8D5]/60 transition-colors"
                    >
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-bold text-[#18372C]">{item.id}</span>
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-[#18372C]/10 rounded font-bold">
                          SDG {item.sdg}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-sans font-medium text-[#151A17] line-clamp-1">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-[#3F7E44]">{item.confidence}</div>
                      </td>
                      <td className="py-3.5 px-3 text-[#18372C]/80 whitespace-nowrap">
                        {item.location}
                      </td>
                      <td className="py-3.5 px-3 text-[#18372C]/60 whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            item.status === "VERIFIED"
                              ? "bg-[#3F7E44]/15 text-[#3F7E44]"
                              : item.status === "ACTION_DISPATCHED"
                              ? "bg-blue-600/15 text-blue-900"
                              : "bg-amber-600/15 text-amber-900"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => alert(`Viewing details for ${item.id}`)}
                            className="p-1.5 hover:bg-[#18372C]/10 rounded text-[#18372C]"
                            title="Inspect Evidence"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => alert(`Report ${item.id} verified and dispatched to community coalition.`)}
                            className="p-1.5 hover:bg-[#3F7E44]/10 rounded text-[#3F7E44]"
                            title="Approve / Verify"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => alert(`Report ${item.id} flagged for secondary review.`)}
                            className="p-1.5 hover:bg-red-500/10 rounded text-red-800"
                            title="Flag / Require More Evidence"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-4">
              <div className="text-xs font-mono text-[#18372C]/70">
                ACTIVE COMMUNITY PROJECT COALITION PROPOSALS PENDING CIVIC APPROVAL
              </div>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-4 bg-[#F5E8D5] border border-[#18372C]/15 flex items-center justify-between">
                  <div>
                    <span className="font-bold">PROPOSAL 04:</span> Solar Canal Rooftop Covering (SDG 06 & 07)
                    <div className="text-[11px] text-[#18372C]/60">Lead: Green Grid Karnataka // Target: 1.2MW</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-[#18372C] text-[#F5E8D5] rounded text-[11px]">
                      Approve Project ↗
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[#F5E8D5] border border-[#18372C]/15 flex items-center justify-between">
                  <div>
                    <span className="font-bold">PROPOSAL 05:</span> Biophilic Corridor Connectivity (SDG 15)
                    <div className="text-[11px] text-[#18372C]/60">Lead: Urban Forestry Collective // 280 Hectares</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-[#18372C] text-[#F5E8D5] rounded text-[11px]">
                      Approve Project ↗
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#F5E8D5] border border-[#18372C]/15 flex items-center justify-between">
                <div>
                  <span className="font-bold">priya.sharma@example.com</span> (Citizen Steward)
                  <div className="text-[11px] text-[#18372C]/60">Impact Score: 88 // 3 Verified Reports</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-[#3F7E44]/15 text-[#3F7E44] rounded">
                  ACTIVE
                </span>
              </div>
              <div className="p-3 bg-[#F5E8D5] border border-[#18372C]/15 flex items-center justify-between">
                <div>
                  <span className="font-bold">hr@novatech.com</span> (Corporate Sponsor / Project Lead)
                  <div className="text-[11px] text-[#18372C]/60">Organization: Nova Technologies // 1 Verified Coalition</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-[#3F7E44]/15 text-[#3F7E44] rounded">
                  PARTNER
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
