"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HeartHandshake,
  X,
  Droplets,
  UtensilsCrossed,
  Pill,
  Tent,
  Layers,
  Table as TableIcon,
  LayoutGrid,
  ChevronRight,
  ShieldCheck,
  Building2,
  ExternalLink
} from "lucide-react";
import { AidRequest, UrgencyLevel, UserRole, AuthUser } from "@/types";

interface AidRequestsTabProps {
  requests: AidRequest[];
  onCreateRequest: (req: Partial<AidRequest>) => void;
  currentRole: UserRole;
  authUser?: AuthUser | null;
}

export const AidRequestsTab: React.FC<AidRequestsTabProps> = ({
  requests,
  onCreateRequest,
  currentRole,
  authUser,
}) => {
  const isRequester = currentRole === "REQUESTER";
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterUrgency, setFilterUrgency] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [viewLayout, setViewLayout] = useState<"TABLE" | "CARDS">("TABLE");
  const [scopeFilter, setScopeFilter] = useState<"MY_SHELTER" | "ALL">(
    isRequester ? "MY_SHELTER" : "ALL"
  );

  // Form State
  const [category, setCategory] = useState<string>("WATER");
  const [desc, setDesc] = useState<string>("");
  const [qty, setQty] = useState<number>(100);
  const [unit, setUnit] = useState<string>("liters");
  const [urgency, setUrgency] = useState<UrgencyLevel>("CRITICAL");
  const [shelterName, setShelterName] = useState<string>(
    authUser?.organisationName || "St. Jude Relief Shelter (240 evacuees)"
  );
  const [address, setAddress] = useState<string>("Shelter 4B, Riverview Road, Chennai");
  const [hoursNeeded, setHoursNeeded] = useState<number>(12);

  // Auto-sync shelter details if authUser changes
  useEffect(() => {
    if (authUser?.organisationName) {
      setShelterName(authUser.organisationName);
    }
    if (isRequester) {
      setScopeFilter("MY_SHELTER");
    }
  }, [authUser, isRequester]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || qty <= 0) return;

    onCreateRequest({
      requester_name: shelterName || authUser?.organisationName || "Community Relief Center",
      item_category: category,
      description: desc,
      quantity_required: qty,
      quantity_fulfilled: 0,
      unit: unit,
      urgency: urgency,
      location: {
        address: address || "Disaster Relief Outpost, Chennai",
        lat: 13.06 + (Math.random() - 0.5) * 0.08,
        lng: 80.24 + (Math.random() - 0.5) * 0.08,
        approximate: true,
      },
      needed_by: new Date(Date.now() + hoursNeeded * 3600 * 1000).toISOString(),
      status: "Submitted",
    });

    setShowModal(false);
    setDesc("");
  };

  const handleQuickPreset = (
    cat: string,
    quantity: number,
    u: string,
    urg: UrgencyLevel,
    presetDesc: string
  ) => {
    onCreateRequest({
      requester_name: shelterName || authUser?.organisationName || "St. Jude Relief Shelter (240 evacuees)",
      item_category: cat,
      description: presetDesc,
      quantity_required: quantity,
      quantity_fulfilled: 0,
      unit: u,
      urgency: urg,
      location: {
        address: address || "Shelter 4B, Riverview Road, Chennai",
        lat: 13.0850,
        lng: 80.2780,
        approximate: true,
      },
      needed_by: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
      status: "Submitted",
    });
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toUpperCase()) {
      case "WATER":
        return Droplets;
      case "FOOD":
        return UtensilsCrossed;
      case "MEDICINE":
        return Pill;
      case "SHELTER":
        return Tent;
      default:
        return Layers;
    }
  };

  // Check if a request belongs to the active shelter
  const isMyShelterRequest = (r: AidRequest) => {
    const shelterKey = (authUser?.organisationName || "St. Jude").toLowerCase();
    const nameMatch = r.requester_name && r.requester_name.toLowerCase().includes(shelterKey.slice(0, 8));
    const uidMatch = r.requester_id === authUser?.uid || r.requester_id === "REQ-USR-1";
    return nameMatch || uidMatch;
  };

  const myShelterRequests = requests.filter(isMyShelterRequest);
  const myCriticalCount = myShelterRequests.filter((r) => r.urgency === "CRITICAL").length;

  const filtered = requests.filter((r) => {
    if (scopeFilter === "MY_SHELTER" && !isMyShelterRequest(r)) return false;
    if (filterCategory !== "ALL" && r.item_category.toUpperCase() !== filterCategory) return false;
    if (filterUrgency !== "ALL" && r.urgency !== filterUrgency) return false;
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        r.description.toLowerCase().includes(term) ||
        r.item_category.toLowerCase().includes(term) ||
        (r.requester_name && r.requester_name.toLowerCase().includes(term)) ||
        r.request_id.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Role-Specific Portal Header for REQUESTER */}
      {isRequester ? (
        <div className="space-y-4">
          <div className="rounded-2xl p-5 bg-gradient-to-r from-[#FFFBEB] via-[#FEF3C7]/40 to-[#FFFFFF] border border-[#FDE68A] shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] uppercase tracking-wide">
                      Shelter Lead Command
                    </span>
                    <span className="text-xs text-[#78350F] font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Zone A-4 &bull; Riverview Outpost
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#172033] mt-1">
                    {authUser?.organisationName || "St. Jude Relief Shelter (240 evacuees)"}
                  </h2>
                  <p className="text-xs text-[#687386] font-medium mt-0.5">
                    Lead Coordinator: <span className="font-semibold text-[#172033]">{authUser?.displayName || "Dr. Suresh Kumar"}</span> &bull; Potable water and medical triage outpost
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white border border-[#FDE68A] shadow-2xs text-xs">
                  <div>
                    <span className="text-[10px] text-[#8C9BAE] uppercase font-bold block">My Shelter Needs</span>
                    <span className="font-extrabold text-sm text-[#172033]">{myShelterRequests.length} Demands</span>
                  </div>
                  <div className="w-px h-7 bg-[#E7EAF0]" />
                  <div>
                    <span className="text-[10px] text-[#F04452] uppercase font-bold block">Urgent Action</span>
                    <span className="font-extrabold text-sm text-[#F04452]">{myCriticalCount} Critical</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShelterName(authUser?.organisationName || "St. Jude Relief Shelter (240 evacuees)");
                    setShowModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#F04452] hover:bg-[#E02E3D] text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer hover:shadow-red-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Custom Aid Request</span>
                </button>
              </div>
            </div>
          </div>

          {/* 1-Click Fast Presets Bar to Make Adding Demands Super Easy */}
          <div className="bg-[#FFFFFF] border border-[#E7EAF0] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                <span className="text-amber-500">⚡</span> 1-Click Fast Emergency Presets:
              </span>
              <span className="text-[11px] text-[#8C9BAE]">Tap any preset to log a verified need instantly</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() =>
                  handleQuickPreset(
                    "WATER",
                    400,
                    "liters",
                    "CRITICAL",
                    "Emergency drinking water for evacuees cut off by waterlogging."
                  )
                }
                className="p-3 rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] hover:bg-[#CCFBF1]/60 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-[#0F766E]" />
                  <span className="text-xs font-bold text-[#0F766E]">400L Water</span>
                </div>
                <span className="text-[10px] text-[#687386] mt-1 block">Critical &bull; Potable drinking</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPreset(
                    "FOOD",
                    150,
                    "boxes",
                    "HIGH",
                    "Ready-to-eat dry rations and meal packs for displaced families."
                  )
                }
                className="p-3 rounded-xl border border-[#FEF3C7] bg-[#FFFBEB] hover:bg-[#FEF3C7]/60 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-[#B45309]" />
                  <span className="text-xs font-bold text-[#B45309]">150 Food Boxes</span>
                </div>
                <span className="text-[10px] text-[#687386] mt-1 block">High urgency &bull; Family meals</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPreset(
                    "MEDICINE",
                    50,
                    "kits",
                    "CRITICAL",
                    "Antiseptic wipes, suture kits, and trauma bandages for triage."
                  )
                }
                className="p-3 rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] hover:bg-[#FEE2E2]/60 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-[#F04452]" />
                  <span className="text-xs font-bold text-[#F04452]">50 First Aid Kits</span>
                </div>
                <span className="text-[10px] text-[#687386] mt-1 block">Critical &bull; Wound triage</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPreset(
                    "SHELTER",
                    30,
                    "kits",
                    "NORMAL",
                    "Heavy duty tarpaulins and waterproof rope for damaged roofs."
                  )
                }
                className="p-3 rounded-xl border border-[#EDE9FE] bg-[#F5F3FF] hover:bg-[#EDE9FE]/60 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Tent className="w-4 h-4 text-[#7C3AED]" />
                  <span className="text-xs font-bold text-[#7C3AED]">30 Tarpaulins</span>
                </div>
                <span className="text-[10px] text-[#687386] mt-1 block">Normal &bull; Shelter weatherproofing</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* 1. Header Toolbar with Scope Filter */}
      <div className="resq-surface rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#FFFFFF]">
        {/* Left: Scope Tabs & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Scope Toggle for Requesters */}
          {isRequester && (
            <div className="flex items-center bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-1">
              <button
                onClick={() => setScopeFilter("MY_SHELTER")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  scopeFilter === "MY_SHELTER"
                    ? "bg-[#FFFFFF] text-[#B45309] shadow-xs border border-[#FDE68A]"
                    : "text-[#687386] hover:text-[#172033]"
                }`}
              >
                My Shelter Demands ({myShelterRequests.length})
              </button>
              <button
                onClick={() => setScopeFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  scopeFilter === "ALL"
                    ? "bg-[#FFFFFF] text-[#172033] shadow-xs border border-[#E7EAF0]"
                    : "text-[#687386] hover:text-[#172033]"
                }`}
              >
                All Community Demands ({requests.length})
              </button>
            </div>
          )}

          <div className="relative min-w-[180px] sm:min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8C9BAE]" />
            <input
              type="text"
              placeholder="Filter item or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#E7EAF0] text-[#172033] text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-[#CBD5E1]"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#F7F8FA] border border-[#E7EAF0] text-[#172033] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="WATER">Water</option>
            <option value="FOOD">Food</option>
            <option value="MEDICINE">Medicine</option>
            <option value="SHELTER">Shelter</option>
          </select>

          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="bg-[#F7F8FA] border border-[#E7EAF0] text-[#172033] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Urgencies</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#F7F8FA] border border-[#E7EAF0] text-[#172033] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Partially Allocated">Partially Allocated</option>
            <option value="Fully Allocated">Fully Allocated</option>
            <option value="Fulfilled">Fulfilled</option>
          </select>
        </div>

        {/* Right: Layout Toggle & Create Action (Only for non-requesters to avoid duplicate button) */}
        <div className="flex items-center gap-2.5 justify-between md:justify-end">
          {/* Table / Cards view switch */}
          <div className="flex items-center bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-0.5">
            <button
              onClick={() => setViewLayout("TABLE")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewLayout === "TABLE" ? "bg-[#FFFFFF] text-[#172033] shadow-xs" : "text-[#8C9BAE] hover:text-[#172033]"
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewLayout("CARDS")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewLayout === "CARDS" ? "bg-[#FFFFFF] text-[#172033] shadow-xs" : "text-[#8C9BAE] hover:text-[#172033]"
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {!isRequester && (
            <button
              onClick={() => {
                setShelterName(authUser?.organisationName || "Community Relief Shelter");
                setShowModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#F04452] hover:bg-[#E02E3D] text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Request</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Data Table or Cards View */}
      {viewLayout === "TABLE" ? (
        <div className="resq-surface rounded-2xl overflow-hidden bg-[#FFFFFF]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAFBFD] border-b border-[#E7EAF0] text-[11px] font-semibold text-[#8C9BAE] uppercase tracking-wider">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Shelter / Location</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Required Qty</th>
                  <th className="py-3 px-4">Fulfilled</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Required By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EAF0] text-xs">
                {filtered.map((req) => {
                  const Icon = getCategoryIcon(req.item_category);
                  const isCritical = req.urgency === "CRITICAL";
                  const pct = Math.min(
                    100,
                    Math.round(((req.quantity_fulfilled || 0) / req.quantity_required) * 100)
                  );

                  return (
                    <tr
                      key={req.request_id}
                      className="hover:bg-[#FAFBFD] transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-[#172033]">
                        {req.request_id}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#172033]">
                          {req.requester_name || "Community Relief Camp"}
                        </div>
                        <div className="text-[11px] text-[#687386] line-clamp-1 max-w-xs">
                          {req.description}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#F7F8FA] border border-[#E7EAF0] text-[#172033] font-medium text-[11px]">
                          <Icon className="w-3.5 h-3.5 text-[#687386]" />
                          {req.item_category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isCritical
                              ? "bg-[#FEF2F2] text-[#F04452] border border-[#FEE2E2]"
                              : req.urgency === "HIGH"
                              ? "bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]"
                              : "bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]"
                          }`}
                        >
                          {req.urgency}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-[#172033]">
                        {req.quantity_required} {req.unit}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-[#E7EAF0] overflow-hidden">
                            <div
                              className={`h-full ${
                                pct >= 100 ? "bg-[#12B8A6]" : pct > 0 ? "bg-[#F4AE42]" : "bg-transparent"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-[#687386] font-mono">
                            {pct}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] font-semibold ${
                            req.status === "Fulfilled"
                              ? "text-[#15803D]"
                              : req.status.includes("Allocated")
                              ? "text-[#0F766E]"
                              : "text-[#172033]"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-[11px] text-[#687386] font-mono">
                        {req.needed_by
                          ? new Date(req.needed_by).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "ASAP"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-[#E7EAF0] bg-[#FAFBFD] flex items-center justify-between text-xs text-[#687386]">
            <span>Showing {filtered.length} of {requests.length} total aid requests</span>
            <span>Protected under humanitarian confidentiality guidelines</span>
          </div>
        </div>
      ) : (
        /* Cards View Alternative */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((req) => {
            const Icon = getCategoryIcon(req.item_category);
            const isCritical = req.urgency === "CRITICAL";
            const pct = Math.min(
              100,
              Math.round(((req.quantity_fulfilled || 0) / req.quantity_required) * 100)
            );

            return (
              <div
                key={req.request_id}
                className="resq-surface-hover rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 bg-[#FFFFFF]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isCritical
                          ? "bg-[#FEF2F2] text-[#F04452] border border-[#FEE2E2]"
                          : req.urgency === "HIGH"
                          ? "bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]"
                          : "bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]"
                      }`}
                    >
                      {req.urgency}
                    </span>
                    <span className="text-[11px] font-mono text-[#8C9BAE]">
                      {req.request_id}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#172033] line-clamp-1 mb-1">
                    {req.requester_name || "Community Relief Camp"}
                  </h4>
                  <p className="text-xs text-[#687386] line-clamp-2 mb-3">
                    {req.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-[#4A5568] mb-1">
                    <MapPin className="w-3.5 h-3.5 text-[#8C9BAE] shrink-0" />
                    <span className="truncate">
                      {req.location?.address || "Coastal Ward Relief Camp"}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E7EAF0] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#687386]">Fulfilled:</span>
                    <span className="font-bold text-[#172033]">
                      {req.quantity_fulfilled || 0} / {req.quantity_required} {req.unit} ({pct}%)
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-[#E7EAF0] overflow-hidden">
                    <div
                      className={`h-full ${
                        pct >= 100 ? "bg-[#12B8A6]" : pct > 0 ? "bg-[#F4AE42]" : "bg-transparent"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-[#8C9BAE]">Status</span>
                    <span className="font-semibold text-[#172033]">{req.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Create Aid Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#172033]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7EAF0] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#F04452] flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-[#172033] text-base">
                  Submit Shelter Aid Demand
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-md text-[#8C9BAE] hover:text-[#172033]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#172033] font-semibold mb-1">
                  Shelter / Camp Location Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ward 4 Coastal Relief Camp"
                  value={shelterName}
                  onChange={(e) => setShelterName(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-2.5 text-[#172033] focus:outline-none focus:border-[#CBD5E1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#172033] font-semibold mb-1">
                    Resource Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-2.5 text-[#172033] focus:outline-none cursor-pointer"
                  >
                    <option value="WATER">Drinking Water</option>
                    <option value="FOOD">Food / Rations</option>
                    <option value="MEDICINE">Medical Kits</option>
                    <option value="SHELTER">Tarpaulins &amp; Tents</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#172033] font-semibold mb-1">Urgency</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                    className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-2.5 text-[#172033] focus:outline-none cursor-pointer"
                  >
                    <option value="CRITICAL">Critical (Immediate Need)</option>
                    <option value="HIGH">High Urgency</option>
                    <option value="NORMAL">Normal Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#172033] font-semibold mb-1">Required Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-2.5 text-[#172033] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#172033] font-semibold mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-2.5 text-[#172033] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#172033] font-semibold mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Specify recipient count, vulnerability factors, or access instructions..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-2.5 text-[#172033] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#172033] font-semibold mb-1">
                  Approximate Location Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marina Beach Coastal Sector, Chennai"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-2.5 text-[#172033] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E7EAF0]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-xl text-[#687386] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#F04452] hover:bg-[#E02E3D] text-white font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Submit Demand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
