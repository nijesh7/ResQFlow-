"use client";

import React, { useEffect, useRef, useState } from "react";
import { AidRequest, SupplyOffer } from "@/types";
import {
  MapPin,
  Layers,
  Filter,
  Search,
  Droplets,
  UtensilsCrossed,
  Pill,
  Tent,
  X,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Package
} from "lucide-react";

interface DisasterMapProps {
  requests: AidRequest[];
  supplies: SupplyOffer[];
  onSelectRequest?: (req: AidRequest) => void;
  onOpenAllocations?: () => void;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  requests,
  supplies,
  onSelectRequest,
  onOpenAllocations,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"MAP" | "LIST">("MAP");

  // Selected item for the right-side detail drawer
  const [selectedItem, setSelectedItem] = useState<{
    type: "REQUEST" | "SUPPLY";
    data: AidRequest | SupplyOffer;
  } | null>(null);

  const categories = [
    { id: "ALL", label: "All Items", icon: Layers },
    { id: "WATER", label: "Water", icon: Droplets },
    { id: "FOOD", label: "Food", icon: UtensilsCrossed },
    { id: "MEDICINE", label: "Medicine", icon: Pill },
    { id: "SHELTER", label: "Shelter", icon: Tent },
  ];

  // Filtering
  const filteredRequests = requests.filter((r) => {
    if (selectedCategory !== "ALL" && r.item_category.toUpperCase() !== selectedCategory) return false;
    if (selectedUrgency !== "ALL" && r.urgency !== selectedUrgency) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = (r.requester_name || "").toLowerCase().includes(term);
      const matchCat = r.item_category.toLowerCase().includes(term);
      const matchId = r.request_id.toLowerCase().includes(term);
      const matchAddr = (r.location?.address || "").toLowerCase().includes(term);
      if (!matchName && !matchCat && !matchId && !matchAddr) return false;
    }
    return true;
  });

  const filteredSupplies = supplies.filter((s) => {
    if (selectedCategory !== "ALL" && s.item_category.toUpperCase() !== selectedCategory) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = (s.donor_name || "").toLowerCase().includes(term);
      const matchCat = s.item_category.toLowerCase().includes(term);
      const matchId = s.supply_id.toLowerCase().includes(term);
      const matchAddr = (s.location?.address || "").toLowerCase().includes(term);
      if (!matchName && !matchCat && !matchId && !matchAddr) return false;
    }
    return true;
  });

  // Map Initialization & Updates
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || viewMode !== "MAP") return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Default center: Chennai Flood Zone area [13.06, 80.25]
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([13.06, 80.25], 12);

      mapInstanceRef.current = map;

      // Clean OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Custom Clean Marker Icons
      const createIcon = (color: string, border: string, text: string) => {
        return L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div style="
              background-color: ${color};
              border: 2px solid ${border};
              width: 30px;
              height: 30px;
              border-radius: 9999px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: 800;
              color: white;
              cursor: pointer;
            ">
              ${text}
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
      };

      const criticalIcon = createIcon("#dc2626", "#ffffff", "!");
      const highIcon = createIcon("#ea580c", "#ffffff", "H");
      const normalIcon = createIcon("#0d9488", "#ffffff", "N");
      const supplyIcon = createIcon("#0284c7", "#ffffff", "S");

      // Add Request Markers
      filteredRequests.forEach((req) => {
        if (req.location?.lat && req.location?.lng) {
          const icon =
            req.urgency === "CRITICAL"
              ? criticalIcon
              : req.urgency === "HIGH"
              ? highIcon
              : normalIcon;

          const marker = L.marker([req.location.lat, req.location.lng], { icon }).addTo(map);

          marker.on("click", () => {
            setSelectedItem({ type: "REQUEST", data: req });
            if (onSelectRequest) onSelectRequest(req);
          });
        }
      });

      // Add Supply Depot Markers
      filteredSupplies.forEach((sup) => {
        if (sup.location?.lat && sup.location?.lng) {
          const marker = L.marker([sup.location.lat, sup.location.lng], { icon: supplyIcon }).addTo(map);

          marker.on("click", () => {
            setSelectedItem({ type: "SUPPLY", data: sup });
          });
        }
      });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [viewMode, selectedCategory, selectedUrgency, searchTerm, filteredRequests.length, filteredSupplies.length]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Top Map Control Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
              <MapPin className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">Emergency Operations Center</h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {filteredRequests.length} Needs &bull; {filteredSupplies.length} Depots
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Geospatial tracking of urgent demand and verified depot supplies &bull; Click any marker to inspect
          </p>
        </div>

        {/* Search, Filter & View Controls */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search location or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 w-44 sm:w-52"
            />
          </div>

          {/* Urgency Filter */}
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Urgencies</option>
            <option value="CRITICAL">Critical Priority (!)</option>
            <option value="HIGH">High Priority (H)</option>
            <option value="NORMAL">Normal Priority (N)</option>
          </select>

          {/* Map vs List toggle */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode("MAP")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                viewMode === "MAP"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                viewMode === "LIST"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Category:
        </span>
        {categories.map((c) => {
          const Icon = c.icon;
          const active = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                active
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Map + Detail Drawer Layout */}
      {viewMode === "MAP" ? (
        <div className="relative flex flex-col md:flex-row h-[520px]">
          {/* Map Area */}
          <div className="flex-1 relative h-full">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Clean Map Legend */}
            <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 text-xs shadow-md space-y-1.5 pointer-events-auto">
              <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block mb-0.5">
                Map Markers
              </span>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-red-600 border border-white" />
                <span>Critical Aid Request (!)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-orange-500 border border-white" />
                <span>High Urgency (H)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-teal-600 border border-white" />
                <span>Normal Urgency (N)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-sky-600 border border-white" />
                <span>Verified Supply Depot (S)</span>
              </div>
            </div>
          </div>

          {/* Right-Side Item Inspection Drawer */}
          {selectedItem && (
            <div className="w-full md:w-80 lg:w-96 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-5 flex flex-col justify-between overflow-y-auto shadow-lg z-20 shrink-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    selectedItem.type === "REQUEST"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-sky-50 text-sky-800 border-sky-200"
                  }`}>
                    {selectedItem.type === "REQUEST" ? "Aid Demand Details" : "Depot Inventory Details"}
                  </span>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {selectedItem.type === "REQUEST" ? (
                  // Request Details View
                  (() => {
                    const req = selectedItem.data as AidRequest;
                    const matchingSupplies = supplies.filter(
                      (s) => s.item_category.toUpperCase() === req.item_category.toUpperCase() && s.available_quantity > 0
                    );

                    return (
                      <div className="space-y-3.5 text-xs">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-slate-400 font-semibold">{req.request_id}</span>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                              req.urgency === "CRITICAL"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : req.urgency === "HIGH"
                                ? "bg-orange-50 text-orange-700 border border-orange-200"
                                : "bg-teal-50 text-teal-700 border border-teal-200"
                            }`}>
                              {req.urgency}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900">{req.requester_name}</h4>
                          <p className="text-slate-500 mt-1 leading-relaxed">{req.description}</p>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Category:</span>
                            <span className="font-bold text-slate-800">{req.item_category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Required Quantity:</span>
                            <span className="font-bold text-slate-900">{req.quantity_required} {req.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Fulfilled So Far:</span>
                            <span className="font-bold text-teal-700">{req.quantity_fulfilled || 0} {req.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Location Area:</span>
                            <span className="font-semibold text-slate-800">{req.location?.address || "Grid zone on file"}</span>
                          </div>
                        </div>

                        {/* Matching Supplies Breakdown */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                            <span>Compatible Depot Supplies:</span>
                            <span className="font-bold text-teal-700">{matchingSupplies.length} Available</span>
                          </div>
                          {matchingSupplies.length === 0 ? (
                            <p className="text-slate-400 italic text-[11px]">No active depots currently stock this item.</p>
                          ) : (
                            <div className="space-y-1.5 max-h-36 overflow-y-auto">
                              {matchingSupplies.map((s) => (
                                <div key={s.supply_id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-[11px]">
                                  <span className="truncate max-w-[160px] font-medium text-slate-700">{s.donor_name}</span>
                                  <span className="font-bold text-teal-700">{s.available_quantity} {s.unit}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  // Supply Details View
                  (() => {
                    const sup = selectedItem.data as SupplyOffer;
                    return (
                      <div className="space-y-3.5 text-xs">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-slate-400 font-semibold">{sup.supply_id}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                              {sup.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900">{sup.donor_name}</h4>
                          <p className="text-slate-500 mt-1 leading-relaxed">{sup.description}</p>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Resource Category:</span>
                            <span className="font-bold text-slate-800">{sup.item_category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Available Stock:</span>
                            <span className="font-bold text-sky-700">{sup.available_quantity} {sup.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Reserved in Transit:</span>
                            <span className="font-bold text-amber-700">{sup.reserved_quantity} {sup.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Total Registered:</span>
                            <span className="font-semibold text-slate-900">{sup.total_quantity} {sup.unit}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Action Button in Drawer */}
              {onOpenAllocations && selectedItem.type === "REQUEST" && (
                <button
                  onClick={onOpenAllocations}
                  className="w-full mt-4 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Evaluate in Allocation Engine</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Clean List Mode */
        <div className="p-4 sm:p-6 divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
          <div className="space-y-2">
            {filteredRequests.map((r) => (
              <div
                key={r.request_id}
                onClick={() => setSelectedItem({ type: "REQUEST", data: r })}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-semibold text-slate-400">{r.request_id}</span>
                    <span className="text-sm font-bold text-slate-900">{r.requester_name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      r.urgency === "CRITICAL"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : r.urgency === "HIGH"
                        ? "bg-orange-50 text-orange-700 border-orange-200"
                        : "bg-teal-50 text-teal-700 border-teal-200"
                    }`}>
                      {r.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Needs <strong className="text-slate-800">{r.quantity_required} {r.unit}</strong> of {r.item_category} &bull; {r.location?.address || "Grid zone on file"}
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-xs font-semibold text-teal-700">{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
