"use client";

import React, { useEffect, useRef, useState } from "react";
import { AidRequest, SupplyOffer } from "@/types";
import { MapPin, Layers, Filter, Eye, ListFilter } from "lucide-react";

interface DisasterMapProps {
  requests: AidRequest[];
  supplies: SupplyOffer[];
  onSelectRequest?: (req: AidRequest) => void;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  requests,
  supplies,
  onSelectRequest,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"MAP" | "LIST">("MAP");

  const filteredRequests = requests.filter((r) => {
    if (selectedCategory !== "ALL" && r.item_category !== selectedCategory) return false;
    if (selectedUrgency !== "ALL" && r.urgency !== selectedUrgency) return false;
    return true;
  });

  const filteredSupplies = supplies.filter((s) => {
    if (selectedCategory !== "ALL" && s.item_category !== selectedCategory) return false;
    return true;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || viewMode !== "MAP") return;

    let isMounted = true;

    // Dynamically import Leaflet on client
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Default center: Chennai Flood Zone area [13.06, 80.25]
      const map = L.map(mapContainerRef.current).setView([13.06, 80.25], 12);
      mapInstanceRef.current = map;

      // Clean OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Create Custom SVG icons for emergency markers
      const createIcon = (color: string, label: string) => {
        return L.divIcon({
          className: "custom-emergency-pin",
          html: `
            <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: white;">
              ${label}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
      };

      const criticalIcon = createIcon("#ef4444", "!");
      const highIcon = createIcon("#f97316", "H");
      const normalIcon = createIcon("#14b8a6", "N");
      const supplyIcon = createIcon("#0284c7", "S");

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

          marker.bindPopup(`
            <div style="font-family: inherit; font-size: 13px; color: #0f172a; min-width: 180px;">
              <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">${req.requester_name || "Shelter Request"}</div>
              <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">${req.location.address || "Approximate Zone"}</div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: 600;">Category:</span> <span>${req.item_category}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: 600;">Needed:</span> <span style="font-weight: 700; color: #ef4444;">${req.quantity_required} ${req.unit}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 600;">Urgency:</span> <span style="font-weight: 700; color: ${req.urgency === 'CRITICAL' ? '#dc2626' : '#ea580c'};">${req.urgency}</span>
              </div>
              <div style="font-size: 10px; color: #64748b; background: #f1f5f9; padding: 4px 6px; border-radius: 4px;">
                ${req.description}
              </div>
            </div>
          `);
        }
      });

      // Add Supply Depot Markers
      filteredSupplies.forEach((sup) => {
        if (sup.location?.lat && sup.location?.lng) {
          const marker = L.marker([sup.location.lat, sup.location.lng], { icon: supplyIcon }).addTo(map);

          marker.bindPopup(`
            <div style="font-family: inherit; font-size: 13px; color: #0f172a; min-width: 180px;">
              <div style="font-weight: 700; color: #0369a1; margin-bottom: 2px;">${sup.donor_name || "Supply Depot"}</div>
              <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">${sup.location.address || "Warehouse Depot"}</div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: 600;">Stock Available:</span> <span style="font-weight: 700; color: #0284c7;">${sup.available_quantity} ${sup.unit}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: 600;">Category:</span> <span>${sup.item_category}</span>
              </div>
              <div style="font-size: 10px; color: #64748b; background: #f0f9ff; padding: 4px 6px; border-radius: 4px;">
                ${sup.description}
              </div>
            </div>
          `);
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
  }, [viewMode, selectedCategory, selectedUrgency, filteredRequests.length, filteredSupplies.length]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Map Control Bar */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-teal-400" />
          <h3 className="font-semibold text-slate-100 text-sm">Disaster Relief Operations Map</h3>
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
            OpenStreetMap Tiles &bull; Approximate Coordinates
          </span>
        </div>

        {/* Filters and toggles */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Categories</option>
            <option value="WATER">Water</option>
            <option value="FOOD">Food / Rations</option>
            <option value="MEDICINE">Medicine / Triage</option>
            <option value="SHELTER">Shelter / Tarpaulins</option>
          </select>

          {/* Urgency Filter */}
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Urgencies</option>
            <option value="CRITICAL">Critical Only (!)</option>
            <option value="HIGH">High Priority (H)</option>
            <option value="NORMAL">Normal Priority (N)</option>
          </select>

          {/* Toggle Map / List */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setViewMode("MAP")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === "MAP" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Map View
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === "LIST" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              List View
            </button>
          </div>
        </div>
      </div>

      {/* Map Body or List Alternative */}
      {viewMode === "MAP" ? (
        <div className="relative">
          <div ref={mapContainerRef} className="w-full h-[450px] z-10" />

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-xs shadow-lg space-y-1.5">
            <span className="font-semibold text-slate-300 block mb-1">Map Legend</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block border border-white" />
              <span className="text-slate-300">Critical Need Request (!)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 inline-block border border-white" />
              <span className="text-slate-300">High Urgency Request (H)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-teal-500 inline-block border border-white" />
              <span className="text-slate-300">Normal Request (N)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-600 inline-block border border-white" />
              <span className="text-slate-300">Supply Depot / NGO (S)</span>
            </div>
          </div>
        </div>
      ) : (
        /* Alternative Accessible List View */
        <div className="p-4 divide-y divide-slate-800 max-h-[450px] overflow-y-auto">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Disaster Location Directory ({filteredRequests.length} requests, {filteredSupplies.length} supply depots)
          </h4>
          <div className="space-y-2 py-2">
            {filteredRequests.map((r) => (
              <div key={r.request_id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{r.requester_name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      r.urgency === "CRITICAL" ? "bg-red-950 text-red-400 border border-red-800" :
                      r.urgency === "HIGH" ? "bg-orange-950 text-orange-400 border border-orange-800" :
                      "bg-teal-950 text-teal-400 border border-teal-800"
                    }`}>
                      {r.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{r.location?.address || "Location on file"} &bull; Needs {r.quantity_required} {r.unit} of {r.item_category}</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {r.location?.lat ? `${r.location.lat.toFixed(3)}, ${r.location.lng?.toFixed(3)}` : "Approximate"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
