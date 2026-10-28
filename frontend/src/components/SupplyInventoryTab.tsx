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
  Tent
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
        address: address || "Logistics Depot, Chennai",
        lat: 13.07 + (Math.random() - 0.5) * 0.06,
        lng: 80.25 + (Math.random() - 0.5) * 0.06,
        approximate: true
      },
      expiry_at: new Date(Date.now() + daysValid * 86400 * 1000).toISOString(),
      status: "Available",
      verification_status: "Verified"
    });

    setShowModal(false);
    setDesc("");
  };

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Humanitarian Supply Inventory</h3>
          <p className="text-xs text-slate-500">Available depot stocks, verified NGO donations, and safely reserved emergency consignments</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Supply Offer</span>
        </button>
      </div>

      {/* Supplies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {supplies.map((sup) => {
          const availPct = Math.round((sup.available_quantity / sup.total_quantity) * 100);
          const reservedPct = Math.round((sup.reserved_quantity / sup.total_quantity) * 100);

          return (
            <div
              key={sup.supply_id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {sup.item_category}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {sup.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">
                  {sup.donor_name || "Relief Donor Depot"}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                  {sup.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="truncate">{sup.location?.address || "Depot location on file"}</span>
                </div>

                {sup.expiry_at && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Safe until: {new Date(sup.expiry_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Stock Bar */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Available:</span>
                  <span className="font-bold text-teal-700">
                    {sup.available_quantity} / {sup.total_quantity} {sup.unit}
                  </span>
                </div>

                {/* Multi-segment stock bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                  <div
                    className="h-full bg-teal-600 transition-all"
                    style={{ width: `${availPct}%` }}
                    title={`Available: ${sup.available_quantity} ${sup.unit}`}
                  />
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${reservedPct}%` }}
                    title={`Reserved: ${sup.reserved_quantity} ${sup.unit}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Reserved: <strong className="text-amber-700">{sup.reserved_quantity} {sup.unit}</strong></span>
                  </span>
                  <span>Total: <strong>{sup.total_quantity} {sup.unit}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Registering Supplies */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">Register Humanitarian Relief Supply</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Donor or Depot Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Humanitarian Logistics Hub"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Resource Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-teal-500 font-semibold"
                  >
                    <option value="WATER">Water / Hydration</option>
                    <option value="FOOD">Food / Rations</option>
                    <option value="MEDICINE">Medical / First Aid</option>
                    <option value="SHELTER">Shelter / Tarpaulins</option>
                    <option value="HYGIENE">Sanitation / Hygiene</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Shelf Life / Expiry</label>
                  <select
                    value={daysValid}
                    onChange={(e) => setDaysValid(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-teal-500 font-semibold"
                  >
                    <option value={14}>14 Days (Perishable)</option>
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={365}>1 Year (Non-perishable)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Total Available Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalQty}
                    onChange={(e) => setTotalQty(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-teal-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Unit of Measurement</label>
                  <input
                    type="text"
                    required
                    placeholder="liters, boxes, kits"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Depot Address / Warehouse Location</label>
                <input
                  type="text"
                  placeholder="e.g. Central Warehouse, Port Road, Chennai"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Storage & Handling Notes</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Packaging details, batch info, handling or refrigeration requirements..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Register Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
