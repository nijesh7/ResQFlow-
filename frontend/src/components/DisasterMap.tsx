"use client";

import React, { useEffect, useRef, useState } from "react";
import { AidRequest, SupplyOffer } from "@/types";
import {
  MapPin,
  Layers,
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
  Package,
  SlidersHorizontal,
  Compass,
  ChevronRight,
  Navigation
} from "lucide-react";

interface DisasterMapProps {
  requests: AidRequest[];
  supplies: SupplyOffer[];
  onSelectRequest?: (req: AidRequest) => void;
  onOpenAllocations?: () => void;
  compactHeight?: boolean;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  requests,
  supplies,
  onSelectRequest,
  onOpenAllocations,
  compactHeight = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"MAP" | "LIST">("MAP");

  // Selected item for drawer
  const [selectedItem, setSelectedItem] = useState<{
    type: "REQUEST" | "SUPPLY";
    data: AidRequest | SupplyOffer;
  } | null>(null);

  const categories = [
    { id: "ALL", label: "All Categories", icon: Layers },
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

      // Default center: Chennai Flood & Coastal Relief Zone [13.06, 80.25]
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        scrollWheelZoom: true,
      }).setView([13.06, 80.25], 12);

      // Add zoom control top-right for a clean layout
      L.control.zoom({ position: "topright" }).addTo(map);

      mapInstanceRef.current = map;

      // Crisp OpenStreetMap tiles with clean restrained styling
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Clean Marker Factory
      const createMarkerIcon = (
        bgColor: string,
        textColor: string,
        symbol: string,
        isCritical: boolean = false
      ) => {
        return L.divIcon({
          className: "custom-resq-marker",
          html: `
            <div style="position: relative; cursor: pointer;">
              ${
                isCritical
                  ? `<div style="
                      position: absolute;
                      inset: -4px;
                      border-radius: 9999px;
                      background-color: rgba(240, 68, 82, 0.3);
                      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    "></div>`
                  : ""
              }
              <div style="
                background-color: ${bgColor};
                color: ${textColor};
                border: 2px solid #FFFFFF;
                box-shadow: 0 4px 10px rgba(23, 32, 51, 0.18), 0 1px 3px rgba(23, 32, 51, 0.08);
                width: 32px;
                height: 32px;
                border-radius: 9999px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 800;
                transition: transform 0.15s ease;
              ">
                ${symbol}
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
      };

      const criticalIcon = createMarkerIcon("#F04452", "#FFFFFF", "!", true);
      const highIcon = createMarkerIcon("#F4AE42", "#FFFFFF", "H");
      const normalIcon = createMarkerIcon("#12B8A6", "#FFFFFF", "N");
      const depotIcon = createMarkerIcon("#172033", "#FFFFFF", "D");

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
          const marker = L.marker([sup.location.lat, sup.location.lng], { icon: depotIcon }).addTo(map);

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
    <div className="resq-surface rounded-2xl overflow-hidden flex flex-col transition-all">
      {/* 1. Header Toolbar */}
      <div className="p-3.5 sm:p-4 border-b border-[#E7EAF0] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#FFFFFF]">
        {/* Left: Title & Summary */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E7EAF0] flex items-center justify-center text-[#F04452]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#172033]">Operations Map</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                {filteredRequests.length} Needs &bull; {filteredSupplies.length} Depots
              </span>
            </div>
            <p className="text-[11px] text-[#687386]">
              Real-time geospatial distribution of shelter demands and supply clusters
            </p>
          </div>
        </div>

        {/* Right: Search, Filter & View Toggle */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search */}
          <div className="relative min-w-[140px] sm:min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#8C9BAE]" />
            <input
              type="text"
              placeholder="Search map..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#E7EAF0] text-[#172033] text-xs rounded-lg pl-8 pr-2.5 py-1.5 focus:outline-none focus:border-[#CBD5E1]"
            />
          </div>

          {/* Urgency Filter */}
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="bg-[#F7F8FA] border border-[#E7EAF0] text-[#172033] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none font-medium cursor-pointer"
          >
            <option value="ALL">All Urgencies</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Urgency</option>
            <option value="NORMAL">Normal</option>
          </select>

          {/* Map/List Toggle */}
          <div className="flex items-center bg-[#F7F8FA] border border-[#E7EAF0] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("MAP")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === "MAP"
                  ? "bg-[#FFFFFF] text-[#172033] shadow-xs"
                  : "text-[#687386] hover:text-[#172033]"
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === "LIST"
                  ? "bg-[#FFFFFF] text-[#172033] shadow-xs"
                  : "text-[#687386] hover:text-[#172033]"
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="px-4 py-2 bg-[#FAFBFD] border-b border-[#E7EAF0] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#172033] text-white font-semibold shadow-xs"
                  : "text-[#687386] hover:text-[#172033] hover:bg-[#F0F2F6]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Map / List View Container */}
      <div className="relative flex-1">
        {viewMode === "MAP" ? (
          <div className="relative w-full">
            <div
              ref={mapContainerRef}
              className={`w-full ${compactHeight ? "h-[380px] lg:h-[420px]" : "h-[500px] lg:h-[580px]"} z-0`}
            />

            {/* Compact Map Legend overlay */}
            <div className="absolute bottom-3 left-3 z-10 bg-[#FFFFFF]/95 backdrop-blur-xs border border-[#E7EAF0] p-2.5 rounded-xl shadow-sm text-xs space-y-1.5 pointer-events-auto">
              <span className="text-[10px] font-bold text-[#8C9BAE] uppercase tracking-wider block">
                Map Legend
              </span>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-[#4A5568]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F04452]" />
                  <span>Critical Need</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F4AE42]" />
                  <span>High Urgency</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#12B8A6]" />
                  <span>Normal Need</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#172033]" />
                  <span>Supply Depot</span>
                </div>
              </div>
            </div>

            {/* Selected Marker Details Drawer */}
            {selectedItem && (
              <div className="absolute top-3 right-3 z-20 w-80 sm:w-88 max-w-[calc(100vw-24px)] bg-[#FFFFFF] border border-[#E7EAF0] rounded-xl shadow-lg p-4 animate-fade-in pointer-events-auto">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        selectedItem.type === "REQUEST"
                          ? (selectedItem.data as AidRequest).urgency === "CRITICAL"
                            ? "bg-[#FEF2F2] text-[#F04452] border border-[#FEE2E2]"
                            : "bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]"
                          : "bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]"
                      }`}
                    >
                      {selectedItem.type === "REQUEST"
                        ? `${(selectedItem.data as AidRequest).urgency} REQUEST`
                        : "SUPPLY DEPOT"}
                    </span>
                    <span className="text-xs font-mono text-[#8C9BAE]">
                      {selectedItem.type === "REQUEST"
                        ? (selectedItem.data as AidRequest).request_id
                        : (selectedItem.data as SupplyOffer).supply_id}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-1 rounded-md text-[#8C9BAE] hover:text-[#172033] hover:bg-[#F7F8FA]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="py-3 space-y-2.5">
                  <div>
                    <h4 className="font-bold text-sm text-[#172033]">
                      {selectedItem.type === "REQUEST"
                        ? (selectedItem.data as AidRequest).requester_name
                        : (selectedItem.data as SupplyOffer).donor_name}
                    </h4>
                    <p className="text-xs text-[#687386] mt-0.5">
                      {selectedItem.type === "REQUEST"
                        ? (selectedItem.data as AidRequest).description
                        : (selectedItem.data as SupplyOffer).description}
                    </p>
                  </div>

                  {/* Quantity & Location Details */}
                  <div className="grid grid-cols-2 gap-2 bg-[#F7F8FA] p-2.5 rounded-lg border border-[#E7EAF0] text-xs">
                    <div>
                      <span className="text-[10px] text-[#8C9BAE] block">
                        {selectedItem.type === "REQUEST" ? "Required Amount" : "Available Stock"}
                      </span>
                      <span className="font-bold text-[#172033] text-sm">
                        {selectedItem.type === "REQUEST"
                          ? `${(selectedItem.data as AidRequest).quantity_required} ${(selectedItem.data as AidRequest).unit}`
                          : `${(selectedItem.data as SupplyOffer).available_quantity} ${(selectedItem.data as SupplyOffer).unit}`}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#8C9BAE] block">Category</span>
                      <span className="font-semibold text-[#172033]">
                        {selectedItem.data.item_category}
                      </span>
                    </div>
                  </div>

                  {/* Privacy safeguarded Location */}
                  <div className="text-[11px] text-[#687386] flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#8C9BAE] shrink-0" />
                    <span className="truncate">
                      {selectedItem.data.location?.address || "Coastal Ward Relief Outpost (Approximate Area)"}
                    </span>
                  </div>
                </div>

                {/* Direct Action */}
                <div className="pt-2 border-t border-[#E7EAF0] flex gap-2">
                  <button
                    onClick={() => {
                      if (onOpenAllocations) onOpenAllocations();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-[#F04452] hover:bg-[#E02E3D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Match with Allocation Engine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* List Mode Alternative */
          <div className="p-4 divide-y divide-[#E7EAF0] max-h-[500px] overflow-y-auto">
            <h4 className="text-xs font-bold text-[#8C9BAE] uppercase mb-2">
              Geo-located Requests ({filteredRequests.length})
            </h4>
            {filteredRequests.map((req) => (
              <div
                key={req.request_id}
                onClick={() => {
                  setSelectedItem({ type: "REQUEST", data: req });
                  setViewMode("MAP");
                }}
                className="py-2.5 flex items-center justify-between hover:bg-[#F7F8FA] px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#172033]">{req.requester_name}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        req.urgency === "CRITICAL"
                          ? "bg-[#FEF2F2] text-[#F04452]"
                          : "bg-[#FFFBEB] text-[#B45309]"
                      }`}
                    >
                      {req.urgency}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#687386]">
                    {req.quantity_required} {req.unit} &bull; {req.item_category}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-[#8C9BAE]">{req.request_id}</span>
                  <div className="text-[10px] text-[#12B8A6] font-medium flex items-center gap-1 justify-end">
                    <span>View on Map</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
