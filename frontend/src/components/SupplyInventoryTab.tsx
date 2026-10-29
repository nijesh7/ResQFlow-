"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Package,
  MapPin,
  Calendar,
  Lock,
  Building2,
  X,
  Droplets,
  UtensilsCrossed,
  Pill,
  Tent,
  AlertTriangle,
  CheckCircle2,
  Search,
  ShieldCheck,
  ChevronRight,
  Boxes
} from "lucide-react";
import { SupplyOffer, UserRole, AuthUser } from "@/types";

interface SupplyInventoryTabProps {
  supplies: SupplyOffer[];
  onCreateSupply: (sup: Partial<SupplyOffer>) => void;
  currentRole: UserRole;
  authUser?: AuthUser | null;
}

export const SupplyInventoryTab: React.FC<SupplyInventoryTabProps> = ({
  supplies,
  onCreateSupply,
  currentRole,
  authUser,
}) => {
  const isDonor = currentRole === "DONOR";
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [scopeFilter, setScopeFilter] = useState<"MY_DEPOT" | "ALL">(
    isDonor ? "MY_DEPOT" : "ALL"
  );

  // Form State
  const [donorName, setDonorName] = useState<string>(
    authUser?.organisationName || "Apex Pharma Humanitarian Donation"
  );
  const [category, setCategory] = useState<string>("WATER");
  const [desc, setDesc] = useState<string>("");
  const [totalQty, setTotalQty] = useState<number>(200);
  const [unit, setUnit] = useState<string>("liters");
  const [address, setAddress] = useState<string>("Apex Medical Logistics Hub, Chennai");
  const [daysValid, setDaysValid] = useState<number>(30);

  // Check if a supply belongs to the active donor
  const isMyDepotSupply = (s: SupplyOffer) => {
    const donorKey = (authUser?.organisationName || "Apex").toLowerCase();
    const nameMatch = s.donor_name && s.donor_name.toLowerCase().includes(donorKey.slice(0, 4));
    const uidMatch = s.donor_id === authUser?.uid || s.donor_id === "DONOR-USR-2";
    return nameMatch || uidMatch;
  };

  const mySupplies = supplies.filter(isMyDepotSupply);
  const myTotalPledged = mySupplies.reduce((acc, s) => acc + s.total_quantity, 0);
  const myTotalAvail = mySupplies.reduce((acc, s) => acc + s.available_quantity, 0);
  const myTotalReserved = mySupplies.reduce((acc, s) => acc + s.reserved_quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || totalQty <= 0) return;

    onCreateSupply({
      donor_name: donorName || authUser?.organisationName || "Community Relief Donor",
      item_category: category,
      description: desc,
      total_quantity: totalQty,
      available_quantity: totalQty,
      reserved_quantity: 0,
      unit: unit,
      location: {
        address: address || "Central Logistics Depot, Chennai",
        lat: 13.07 + (Math.random() - 0.5) * 0.06,
        lng: 80.25 + (Math.random() - 0.5) * 0.06,
        approximate: true,
      },
      expiry_at: new Date(Date.now() + daysValid * 86400 * 1000).toISOString(),
      status: "Available",
      verification_status: "Verified",
    });

    setShowModal(false);
    setDesc("");
  };

  const handleQuickPledge = (
    cat: string,
    quantity: number,
    u: string,
    batchDesc: string
  ) => {
    onCreateSupply({
      donor_name: donorName || authUser?.organisationName || "Apex Pharma Humanitarian Donation",
      item_category: cat,
      description: batchDesc,
      total_quantity: quantity,
      available_quantity: quantity,
      reserved_quantity: 0,
      unit: u,
      location: {
        address: address || "Apex Medical Logistics Hub, Chennai",
        lat: 13.0500,
        lng: 80.2400,
        approximate: true,
      },
      expiry_at: new Date(Date.now() + 60 * 86400 * 1000).toISOString(),
      status: "Available",
      verification_status: "Verified",
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
        return Package;
    }
  };

  const totalAvail = supplies.reduce((acc, s) => acc + s.available_quantity, 0);
  const totalReserved = supplies.reduce((acc, s) => acc + s.reserved_quantity, 0);
  const totalAll = supplies.reduce((acc, s) => acc + s.total_quantity, 0);

  const filtered = supplies.filter((s) => {
    if (scopeFilter === "MY_DEPOT" && !isMyDepotSupply(s)) return false;
    if (selectedCategory !== "ALL" && s.item_category.toUpperCase() !== selectedCategory) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        s.description.toLowerCase().includes(term) ||
        s.donor_name?.toLowerCase().includes(term) ||
        s.item_category.toLowerCase().includes(term) ||
        s.supply_id.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Role-Specific Portal Header for DONOR */}
      {isDonor ? (
        <div className="space-y-4">
          <div className="rounded-2xl p-5 bg-gradient-to-r from-[#F0FDFA] via-[#CCFBF1]/40 to-[#FFFFFF] border border-[#99F6E4] shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#115E59] text-white flex items-center justify-center shrink-0 shadow-sm shadow-teal-500/20">
                  <Boxes className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] uppercase tracking-wide">
                      Humanitarian Partner Portal
                    </span>
                    <span className="text-xs text-[#0F766E] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Depot #DEP-01 &bull; Verified Accreditation
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#172033] mt-1">
                    {authUser?.organisationName || "Apex Pharma Humanitarian Donation"}
                  </h2>
                  <p className="text-xs text-[#687386] font-medium mt-0.5">
                    Logistics Manager: <span className="font-semibold text-[#172033]">{authUser?.displayName || "Apex Logistics Hub"}</span> &bull; Stock synchronized with Central Allocation Engine
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white border border-[#99F6E4] shadow-2xs text-xs">
                  <div>
                    <span className="text-[10px] text-[#8C9BAE] uppercase font-bold block">My Donated Units</span>
                    <span className="font-extrabold text-sm text-[#172033]">{myTotalPledged.toLocaleString()}</span>
                  </div>
                  <div className="w-px h-7 bg-[#E7EAF0]" />
                  <div>
                    <span className="text-[10px] text-[#0F766E] uppercase font-bold block">Available Stock</span>
                    <span className="font-extrabold text-sm text-[#0F766E]">{myTotalAvail.toLocaleString()}</span>
                  </div>
                  <div className="w-px h-7 bg-[#E7EAF0]" />
                  <div>
                    <span className="text-[10px] text-[#B45309] uppercase font-bold block">Allocated to Shelters</span>
                    <span className="font-extrabold text-sm text-[#B45309]">{myTotalReserved.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDonorName(authUser?.organisationName || "Apex Pharma Humanitarian Donation");
                    setShowModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#172033] hover:bg-[#232F48] text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#12B8A6]" />
                  <span>+ Custom Supply Pledge</span>
                </button>
              </div>
            </div>
          </div>

          {/* 1-Click Fast Stock Pledge Presets to Make Donating Super Easy */}
          <div className="bg-[#FFFFFF] border border-[#E7EAF0] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                <span className="text-teal-600">⚡</span> 1-Click Fast Donation Presets:
              </span>
              <span className="text-[11px] text-[#8C9BAE]">Tap any batch preset to commit verified stock instantly</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() =>
                  handleQuickPledge(
                    "WATER",
                    600,
                    "liters",
                    "Pallet of sealed 20-liter drinking water cans ready for transit."
                  )
                }
                className="p-3 rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] hover:bg-[#CCFBF1]/60 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-[#0F766E]" />
                  <span className="text-xs font-bold text-[#0F766E]">+ 600L Water</span>
                </div>
                <span className="text-[10px] text-[#687386] mt-1 block">Pallet sealed &bull; Ready</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPledge(
                    "MEDICINE",
                    60,
                    "kits",
                    "Emergency sterile trauma kits, bandages, and antibiotic ointments."
                  )
                }
                className="p-3 rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] hover:bg-[#FEE2E2]/60 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-[#F04452]" />
                  <span className="text-xs font-bold text-[#F04452]">+ 60 Trauma Kits</span>
                </div>
                <span className="text-[10px] text-[#687386] mt-1 block">Hospital grade &bull; Valid 90d</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPledge(
                    "FOOD",
                    200,
                    "boxes",
                    "High-calorie emergency food bars and ready-to-eat meal rations."
                  )
                }
                className="p-3 rounded-xl border border-[#FEF3C7] bg-[#FFFBEB] hover:bg-[#FEF3C7]/60 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-[#B45309]" />
                  <span className="text-xs font-bold text-[#B45309]">+ 200 Ration Boxes</span>
                </div>
                <span className="text-[10px] text-[#687386] mt-1 block">Ready meals &bull; Shelf stable</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPledge(
                    "SHELTER",
                    40,
                    "kits",
                    "Reinforced disaster tarpaulins, tent poles, and heavy-duty ground pegs."
                  )
                }
                className="p-3 rounded-xl border border-[#EDE9FE] bg-[#F5F3FF] hover:bg-[#EDE9FE]/60 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Tent className="w-4 h-4 text-[#7C3AED]" />
                  <span className="text-xs font-bold text-[#7C3AED]">+ 40 Shelter Kits</span>
                </div>
                <span className="text-[10px] text-[#687386] mt-1 block">Weatherproof &bull; Evacuee grade</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* 1. Metric Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="resq-surface rounded-2xl p-4 sm:p-5 bg-[#FFFFFF]">
          <span className="text-xs font-semibold text-[#687386]">Ready for Dispatch</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
              {(isDonor ? myTotalAvail : totalAvail).toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-[#0F766E] bg-[#F0FDFA] px-1.5 py-0.5 rounded border border-[#CCFBF1]">
              Available
            </span>
          </div>
          <p className="text-[11px] text-[#8C9BAE] mt-2">
            {isDonor ? "In your depot inventory" : "Verified in warehouse inventory"}
          </p>
        </div>

        <div className="resq-surface rounded-2xl p-4 sm:p-5 bg-[#FFFFFF]">
          <span className="text-xs font-semibold text-[#687386]">Allocated &amp; Locked</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
              {(isDonor ? myTotalReserved : totalReserved).toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-[#B45309] bg-[#FFFBEB] px-1.5 py-0.5 rounded border border-[#FEF3C7]">
              Reserved
            </span>
          </div>
          <p className="text-[11px] text-[#8C9BAE] mt-2">
            {isDonor ? "Reserved for active shelter routes" : "Committed to active shelter routes"}
          </p>
        </div>

        <div className="resq-surface rounded-2xl p-4 sm:p-5 bg-[#FFFFFF]">
          <span className="text-xs font-semibold text-[#687386]">
            {isDonor ? "Active Batches" : "Verified Stockpoints"}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
              {isDonor ? mySupplies.length : supplies.length}
            </span>
            <span className="text-[11px] font-bold text-[#15803D] bg-[#F0FDF4] px-1.5 py-0.5 rounded border border-[#DCFCE7]">
              {isDonor ? "Batches" : "Depots"}
            </span>
          </div>
          <p className="text-[11px] text-[#8C9BAE] mt-2">
            {isDonor ? "Medical & relief supplies registered" : "Chennai Emergency Logistics Network"}
          </p>
        </div>
      </div>

      {/* 2. Control Toolbar with Scope Toggle */}
      <div className="resq-surface rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#FFFFFF]">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Scope Toggle for Donors */}
          {isDonor && (
            <div className="flex items-center bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-1">
              <button
                onClick={() => setScopeFilter("MY_DEPOT")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  scopeFilter === "MY_DEPOT"
                    ? "bg-[#FFFFFF] text-[#0F766E] shadow-xs border border-[#99F6E4]"
                    : "text-[#687386] hover:text-[#172033]"
                }`}
              >
                My Depot Stock ({mySupplies.length})
              </button>
              <button
                onClick={() => setScopeFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  scopeFilter === "ALL"
                    ? "bg-[#FFFFFF] text-[#172033] shadow-xs border border-[#E7EAF0]"
                    : "text-[#687386] hover:text-[#172033]"
                }`}
              >
                All Depots ({supplies.length})
              </button>
            </div>
          )}
          <div className="relative min-w-[200px] sm:min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8C9BAE]" />
            <input
              type="text"
              placeholder="Search inventory, donor, or depot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#E7EAF0] text-[#172033] text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-[#CBD5E1]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#F7F8FA] border border-[#E7EAF0] text-[#172033] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="WATER">Water</option>
            <option value="FOOD">Food</option>
            <option value="MEDICINE">Medicine</option>
            <option value="SHELTER">Shelter</option>
          </select>
        </div>

        {!isDonor && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-[#172033] hover:bg-[#232F48] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#12B8A6]" />
            <span>Register Supply Offer</span>
          </button>
        )}
      </div>

      {/* 3. Supplies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sup) => {
          const Icon = getCategoryIcon(sup.item_category);
          const availPct = Math.round((sup.available_quantity / sup.total_quantity) * 100);
          const reservedPct = Math.round((sup.reserved_quantity / sup.total_quantity) * 100);

          return (
            <div
              key={sup.supply_id}
              className="resq-surface-hover rounded-2xl p-5 flex flex-col justify-between space-y-4 bg-[#FFFFFF]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#F7F8FA] border border-[#E7EAF0] text-[11px] font-semibold text-[#172033]">
                    <Icon className="w-3.5 h-3.5 text-[#687386]" />
                    {sup.item_category}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                    {sup.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#172033] mb-1 line-clamp-1">
                  {sup.donor_name || "Regional Logistics Depot"}
                </h4>
                <p className="text-xs text-[#687386] line-clamp-2 mb-3">
                  {sup.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-[#4A5568] mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#8C9BAE] shrink-0" />
                  <span className="truncate">{sup.location?.address || "Central Chennai Depot"}</span>
                </div>

                {sup.expiry_at && (
                  <div className="flex items-center gap-2 text-[11px] text-[#687386]">
                    <Calendar className="w-3.5 h-3.5 text-[#8C9BAE] shrink-0" />
                    <span>Safe until: {new Date(sup.expiry_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Multi-segment capacity progress bar */}
              <div className="pt-3 border-t border-[#E7EAF0] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#687386]">Available Stock:</span>
                  <span className="font-bold text-[#12B8A6]">
                    {sup.available_quantity} / {sup.total_quantity} {sup.unit}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-[#E7EAF0] overflow-hidden flex">
                  <div
                    className="h-full bg-[#12B8A6] transition-all"
                    style={{ width: `${availPct}%` }}
                    title={`Available: ${sup.available_quantity} ${sup.unit}`}
                  />
                  <div
                    className="h-full bg-[#F4AE42] transition-all"
                    style={{ width: `${reservedPct}%` }}
                    title={`Reserved: ${sup.reserved_quantity} ${sup.unit}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8C9BAE] pt-0.5">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#F4AE42]" />
                    {sup.reserved_quantity} {sup.unit} reserved
                  </span>
                  <span className="font-mono">{sup.supply_id}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Register Supply Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#172033]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7EAF0] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F0FDFA] text-[#12B8A6] flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-[#172033] text-base">Register Humanitarian Inventory</h3>
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
                  Donor / Depot Facility Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red Cross Warehouse &bull; Depot 2"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-2.5 text-[#172033] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#172033] font-semibold mb-1">Resource Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-2.5 text-[#172033] focus:outline-none cursor-pointer"
                  >
                    <option value="WATER">Drinking Water</option>
                    <option value="FOOD">Food Supplies</option>
                    <option value="MEDICINE">Medical Kits</option>
                    <option value="SHELTER">Tents &amp; Blankets</option>
                  </select>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#172033] font-semibold mb-1">Total Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalQty}
                    onChange={(e) => setTotalQty(Number(e.target.value))}
                    className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-2.5 text-[#172033] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#172033] font-semibold mb-1">Shelf Life (Days)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={daysValid}
                    onChange={(e) => setDaysValid(Number(e.target.value))}
                    className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-2.5 text-[#172033] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#172033] font-semibold mb-1">Description &amp; Specifications</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Specify packaging, batch details, or special storage conditions..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-2.5 text-[#172033] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#172033] font-semibold mb-1">Depot Address</label>
                <input
                  type="text"
                  placeholder="e.g. Guindy Industrial Estate Logistics Hub, Chennai"
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
                  className="px-4 py-2 rounded-xl bg-[#12B8A6] hover:bg-[#0D9488] text-white font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Register Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
