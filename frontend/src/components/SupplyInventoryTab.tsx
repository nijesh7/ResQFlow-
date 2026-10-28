"use client";

import React, { useState } from "react";
import { SupplyOffer, UserRole } from "@/types";
import { PlusCircle, Search, Package, MapPin, Calendar, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState<string>("ALL");
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
        address: address || "Depot Logistics Hub, Chennai",
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
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Humanitarian Supply Inventory</h3>
          <p className="text-xs text-slate-400">Available depots, verified NGO donations, and reserved emergency stock</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Register Supply Offer
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
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-3 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                    {sup.item_category}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                    {sup.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">
                  {sup.donor_name || "Relief Donor Depot"}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {sup.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="truncate">{sup.location?.address || "Depot Location on file"}</span>
                </div>

                {sup.expiry_at && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Safe until: {new Date(sup.expiry_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Stock Bar */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Available:</span>
                  <span className="font-bold text-teal-300">
                    {sup.available_quantity} / {sup.total_quantity} {sup.unit}
                  </span>
                </div>

                {/* Multi-segment stock bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                  <div
                    className="h-full bg-teal-500 transition-all"
                    style={{ width: `${availPct}%` }}
                    title={`Available: ${sup.available_quantity} ${sup.unit}`}
                  />
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${reservedPct}%` }}
                    title={`Reserved: ${sup.reserved_quantity} ${sup.unit}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    Reserved: <strong className="text-amber-400">{sup.reserved_quantity} {sup.unit}</strong>
                  </span>
                  <span>Total: <strong>{sup.total_quantity} {sup.unit}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Supply Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white text-base">Register Humanitarian Relief Supply</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Donor or Depot Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Relief Logistics Hub"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Item Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="WATER">Water / Hydration</option>
                    <option value="FOOD">Food / Rations</option>
                    <option value="MEDICINE">Medicine / First Aid</option>
                    <option value="SHELTER">Shelter / Tarpaulins</option>
                    <option value="HYGIENE">Sanitation / Hygiene</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Shelf Life / Expiry</label>
                  <select
                    value={daysValid}
                    onChange={(e) => setDaysValid(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
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
                  <label className="block text-slate-300 font-semibold mb-1">Total Available Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalQty}
                    onChange={(e) => setTotalQty(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit of Measurement</label>
                  <input
                    type="text"
                    required
                    placeholder="liters, boxes, kits"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Depot Address / Warehouse Location</label>
                <input
                  type="text"
                  placeholder="e.g. Central Warehouse, Port Road, Chennai"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Inventory & Storage Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Packaging details, batch info, handling or refrigeration requirements..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold"
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
