"use client";

import React, { useState } from "react";
import { AidRequest, UrgencyLevel, UserRole } from "@/types";
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
  Layers
} from "lucide-react";

interface AidRequestsTabProps {
  requests: AidRequest[];
  onCreateRequest: (req: Partial<AidRequest>) => void;
  currentRole: UserRole;
}

export const AidRequestsTab: React.FC<AidRequestsTabProps> = ({
  requests,
  onCreateRequest,
  currentRole,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterUrgency, setFilterUrgency] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Form State
  const [category, setCategory] = useState<string>("WATER");
  const [desc, setDesc] = useState<string>("");
  const [qty, setQty] = useState<number>(100);
  const [unit, setUnit] = useState<string>("liters");
  const [urgency, setUrgency] = useState<UrgencyLevel>("HIGH");
  const [shelterName, setShelterName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [hoursNeeded, setHoursNeeded] = useState<number>(12);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || qty <= 0) return;

    onCreateRequest({
      requester_name: shelterName || "Community Relief Center",
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
        approximate: true
      },
      needed_by: new Date(Date.now() + hoursNeeded * 3600 * 1000).toISOString(),
      status: "Submitted"
    });

    setShowModal(false);
    setDesc("");
  };

  const filtered = requests.filter((r) => {
    if (filterUrgency !== "ALL" && r.urgency !== filterUrgency) return false;
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        r.description.toLowerCase().includes(term) ||
        r.item_category.toLowerCase().includes(term) ||
        (r.requester_name && r.requester_name.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Control & Filter Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by shelter or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-teal-500 w-52 sm:w-64 font-medium"
            />
          </div>

          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Urgencies</option>
            <option value="CRITICAL">Critical (!)</option>
            <option value="HIGH">High (H)</option>
            <option value="NORMAL">Normal (N)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Partially Allocated">Partially Allocated</option>
            <option value="Fully Allocated">Fully Allocated</option>
            <option value="Fulfilled">Fulfilled</option>
          </select>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Aid Request</span>
        </button>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((req) => {
          const pct = Math.min(100, Math.round(((req.quantity_fulfilled || 0) / req.quantity_required) * 100));

          return (
            <div
              key={req.request_id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    req.urgency === "CRITICAL"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : req.urgency === "HIGH"
                      ? "bg-orange-50 text-orange-700 border-orange-200"
                      : "bg-teal-50 text-teal-700 border-teal-200"
                  }`}>
                    {req.urgency} Urgency
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-medium">
                    {req.request_id}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">
                  {req.requester_name || "Community Shelter"}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                  {req.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="truncate">{req.location?.address || "Grid zone on file"}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Needed by: {req.needed_by ? new Date(req.needed_by).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "ASAP"}</span>
                </div>
              </div>

              {/* Progress & Status */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Fulfilled:</span>
                  <span className="font-bold text-slate-900">
                    {req.quantity_fulfilled || 0} / {req.quantity_required} {req.unit} ({pct}%)
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full transition-all ${pct >= 100 ? "bg-emerald-600" : pct > 0 ? "bg-teal-600" : "bg-slate-300"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400 font-medium">Status</span>
                  <span className="font-semibold text-teal-700">{req.status}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">Submit Emergency Aid Request</h3>
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
                <label className="block text-slate-700 font-semibold mb-1">Shelter / Community Location Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ward 4 Coastal Relief Camp"
                  value={shelterName}
                  onChange={(e) => setShelterName(e.target.value)}
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
                    <option value="WATER">Drinking Water</option>
                    <option value="FOOD">Food / Rations</option>
                    <option value="MEDICINE">Medical / First Aid</option>
                    <option value="SHELTER">Shelter / Tarpaulins</option>
                    <option value="HYGIENE">Sanitation / Hygiene</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Urgency Level</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-teal-500 font-semibold"
                  >
                    <option value="CRITICAL">Critical (Immediate Danger)</option>
                    <option value="HIGH">High (Urgent 24h)</option>
                    <option value="NORMAL">Normal (48h Standard)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quantity Needed</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={qty}
                    onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
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
                <label className="block text-slate-700 font-semibold mb-1">Delivery Address / Accessibility</label>
                <input
                  type="text"
                  placeholder="e.g. Shelter 4B, Riverview Road, Chennai"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description & Vulnerability Context</label>
                <textarea
                  rows={2}
                  required
                  placeholder="State specific needs, children/elderly count, road accessibility..."
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
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
