"use client";

import React, { useState } from "react";
import { SupplyOffer, UserRole } from "@/types";
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

interface SupplyInventoryTabProps {
  supplies: SupplyOffer[];
  onCreateSupply: (sup: Partial<SupplyOffer>) => void;
  currentRole: UserRole;
}

export const SupplyInventoryTab: React.FC<SupplyInventoryTabProps> = ({
  supplies,
  onCreateSupply,
  currentRole,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Form State
  const [donorName, setDonorName] = useState<string>("");
  const [category, setCategory] = useState<string>("WATER");
  const [desc, setDesc] = useState<string>("");
  const [totalQty, setTotalQty] = useState<number>(200);
  const [unit, setUnit] = useState<string>("liters");
  const [address, setAddress] = useState<string>("");
  const [daysValid, setDaysValid] = useState<number>(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || totalQty <= 0) return;

    onCreateSupply({
      donor_name: donorName || "Community Relief Donor",
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
    setDonorName("");
    setAddress("");
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
      {/* 1. Metric Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="resq-surface rounded-2xl p-4 sm:p-5 bg-[#FFFFFF]">
          <span className="text-xs font-semibold text-[#687386]">Ready for Dispatch</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
              {totalAvail.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-[#0F766E] bg-[#F0FDFA] px-1.5 py-0.5 rounded border border-[#CCFBF1]">
              Available
            </span>
          </div>
          <p className="text-[11px] text-[#8C9BAE] mt-2">Verified in warehouse inventory</p>
        </div>

        <div className="resq-surface rounded-2xl p-4 sm:p-5 bg-[#FFFFFF]">
          <span className="text-xs font-semibold text-[#687386]">Allocated &amp; Locked</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
              {totalReserved.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-[#B45309] bg-[#FFFBEB] px-1.5 py-0.5 rounded border border-[#FEF3C7]">
              Reserved
            </span>
          </div>
          <p className="text-[11px] text-[#8C9BAE] mt-2">Committed to active shelter routes</p>
        </div>

        <div className="resq-surface rounded-2xl p-4 sm:p-5 bg-[#FFFFFF]">
          <span className="text-xs font-semibold text-[#687386]">Verified Stockpoints</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
              {supplies.length}
            </span>
            <span className="text-[11px] font-bold text-[#15803D] bg-[#F0FDF4] px-1.5 py-0.5 rounded border border-[#DCFCE7]">
              Depots
            </span>
          </div>
          <p className="text-[11px] text-[#8C9BAE] mt-2">Chennai Emergency Logistics Network</p>
        </div>
      </div>

      {/* 2. Control Toolbar */}
      <div className="resq-surface rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#FFFFFF]">
        <div className="flex flex-wrap items-center gap-2.5">
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

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-[#172033] hover:bg-[#232F48] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#12B8A6]" />
          <span>Register Supply Offer</span>
        </button>
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
