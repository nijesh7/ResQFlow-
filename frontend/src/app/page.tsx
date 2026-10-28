"use client";

import React, { useState, useEffect } from "react";
import {
  UserRole,
  AidRequest,
  SupplyOffer,
  AllocationRecord,
  AuditLogEntry,
  NotificationItem,
  MatchingResult,
  AllocationRecommendation
} from "@/types";
import {
  INITIAL_DEMO_REQUESTS,
  INITIAL_DEMO_SUPPLIES,
  INITIAL_DEMO_ALLOCATIONS,
  INITIAL_DEMO_AUDIT_LOGS
} from "@/lib/demo-data";
import {
  checkBackendHealth,
  fetchAllocationRecommendations,
  approveAllocationAPI
} from "@/lib/api";

import { Navbar } from "@/components/Navbar";
import { RoleBanner } from "@/components/RoleBanner";
import { DisasterMap } from "@/components/DisasterMap";
import { AidRequestsTab } from "@/components/AidRequestsTab";
import { SupplyInventoryTab } from "@/components/SupplyInventoryTab";
import { AllocationEngineTab } from "@/components/AllocationEngineTab";
import { FulfilmentTrackingTab } from "@/components/FulfilmentTrackingTab";
import { AnalyticsTab } from "@/components/AnalyticsTab";
import { AdminTab } from "@/components/AdminTab";
import { AuditLogTab } from "@/components/AuditLogTab";
import { NotificationDrawer } from "@/components/NotificationDrawer";

import {
  MapPin,
  HeartHandshake,
  Package,
  BrainCircuit,
  Truck,
  BarChart3,
  ShieldCheck,
  History
} from "lucide-react";

export default function Home() {
  const [currentRole, setCurrentRole] = useState<UserRole>("COORDINATOR");
  const [activeTab, setActiveTab] = useState<string>("OVERVIEW");
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isMatchingLoading, setIsMatchingLoading] = useState<boolean>(false);

  // Core domain states
  const [requests, setRequests] = useState<AidRequest[]>(INITIAL_DEMO_REQUESTS);
  const [supplies, setSupplies] = useState<SupplyOffer[]>(INITIAL_DEMO_SUPPLIES);
  const [allocations, setAllocations] = useState<AllocationRecord[]>(INITIAL_DEMO_ALLOCATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_DEMO_AUDIT_LOGS);
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(null);

  // In-app Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n1",
      title: "Disaster Scenario Preloaded",
      message: "Cyclone / Flood demonstration dataset ready for evaluation.",
      type: "info",
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: "n2",
      title: "Stock Reservation Active",
      message: "200 liters of water dispatched to Shelter 4B.",
      type: "success",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      read: false,
    }
  ]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Check Backend health on mount
  useEffect(() => {
    let isMounted = true;
    checkBackendHealth().then((status) => {
      if (isMounted) {
        setBackendOnline(status.ok);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const addNotification = (title: string, message: string, type: "info" | "warning" | "success" | "critical") => {
    const newItem: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newItem, ...prev]);
  };

  const handleResetDemo = () => {
    setRequests(INITIAL_DEMO_REQUESTS);
    setSupplies(INITIAL_DEMO_SUPPLIES);
    setAllocations(INITIAL_DEMO_ALLOCATIONS);
    setAuditLogs(INITIAL_DEMO_AUDIT_LOGS);
    setMatchingResult(null);
    addNotification("Scenario Reset", "Disaster scenario demonstration dataset restored.", "info");
  };

  const handleCreateRequest = (newReq: Partial<AidRequest>) => {
    const req: AidRequest = {
      request_id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      requester_id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      requester_name: newReq.requester_name || "Community Relief Shelter",
      item_category: newReq.item_category || "WATER",
      description: newReq.description || "",
      quantity_required: newReq.quantity_required || 10,
      quantity_fulfilled: 0,
      unit: newReq.unit || "units",
      urgency: newReq.urgency || "NORMAL",
      location: newReq.location,
      needed_by: newReq.needed_by,
      created_at: new Date().toISOString(),
      status: "Submitted",
      verification_status: "Verified",
    };

    setRequests((prev) => [req, ...prev]);
    addNotification(
      `New ${req.urgency} Request`,
      `${req.requester_name} created request for ${req.quantity_required} ${req.unit} of ${req.item_category}.`,
      req.urgency === "CRITICAL" ? "critical" : "warning"
    );
  };

  const handleCreateSupply = (newSup: Partial<SupplyOffer>) => {
    const sup: SupplyOffer = {
      supply_id: `SUP-${Math.floor(200 + Math.random() * 800)}`,
      donor_id: `DONOR-${Math.floor(1000 + Math.random() * 9000)}`,
      donor_name: newSup.donor_name || "Community Relief Donor",
      item_category: newSup.item_category || "WATER",
      description: newSup.description || "",
      total_quantity: newSup.total_quantity || 100,
      available_quantity: newSup.total_quantity || 100,
      reserved_quantity: 0,
      unit: newSup.unit || "units",
      location: newSup.location,
      expiry_at: newSup.expiry_at,
      status: "Available",
      verification_status: "Verified",
    };

    setSupplies((prev) => [sup, ...prev]);
    addNotification(
      "New Inventory Registered",
      `${sup.donor_name} registered ${sup.total_quantity} ${sup.unit} of ${sup.item_category}.`,
      "success"
    );
  };

  const handleRunEngine = async (): Promise<MatchingResult> => {
    setIsMatchingLoading(true);
    try {
      const result = await fetchAllocationRecommendations(requests, supplies);
      setMatchingResult(result);

      if (result.duplicate_flags.length > 0) {
        addNotification(
          "Potential Duplicates Flagged",
          `${result.duplicate_flags.length} suspected duplicate requests flagged for coordinator review.`,
          "warning"
        );
      }
      if (result.unfulfilled_demands.length > 0) {
        addNotification(
          "Unfulfilled Demands Detected",
          `${result.unfulfilled_demands.length} urgent needs require additional donor supplies.`,
          "critical"
        );
      }
      return result;
    } finally {
      setIsMatchingLoading(false);
    }
  };

  const handleApproveAllocation = async (
    rec: AllocationRecommendation,
    approvedQty: number,
    overrideReason?: string
  ) => {
    const idempotencyKey = `IDEMP-${Date.now()}-${rec.recommendation_id}`;

    // 1. Transactional stock reservation
    const newRecord = await approveAllocationAPI(
      idempotencyKey,
      rec.request_id,
      rec.supply_id,
      approvedQty,
      `COORD-${currentRole}`,
      overrideReason
    );

    // 2. Safely deduct available stock and increase reserved stock
    setSupplies((prev) =>
      prev.map((s) => {
        if (s.supply_id === rec.supply_id) {
          const newAvail = Math.max(0, s.available_quantity - approvedQty);
          const newReserved = s.reserved_quantity + approvedQty;
          return {
            ...s,
            available_quantity: newAvail,
            reserved_quantity: newReserved,
            status: newAvail === 0 ? "Depleted" : s.status,
          };
        }
        return s;
      })
    );

    // 3. Update request fulfilled quantity
    setRequests((prev) =>
      prev.map((r) => {
        if (r.request_id === rec.request_id) {
          const newFulfilled = (r.quantity_fulfilled || 0) + approvedQty;
          return {
            ...r,
            quantity_fulfilled: newFulfilled,
            status: newFulfilled >= r.quantity_required ? "Fully Allocated" : "Partially Allocated",
          };
        }
        return r;
      })
    );

    // 4. Append allocation record
    setAllocations((prev) => [newRecord, ...prev]);

    // 5. Audit Log
    const audit: AuditLogEntry = {
      audit_id: `AUD-${Date.now().toString(36).toUpperCase()}`,
      actor_id: `COORD-${currentRole}`,
      action: "APPROVE_AND_RESERVE_STOCK",
      entity_type: "ALLOCATION",
      entity_id: newRecord.allocation_id,
      previous_state: { available_quantity: rec.remaining_stock_after + approvedQty },
      new_state: { available_quantity: rec.remaining_stock_after, reserved_quantity: approvedQty },
      reason: overrideReason || "Coordinator verified and approved recommendation",
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    // 6. Update matching recommendations in view
    setMatchingResult((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        recommendations: prev.recommendations.filter(
          (item) => item.recommendation_id !== rec.recommendation_id
        ),
      };
    });

    addNotification(
      "Allocation Approved & Stock Reserved",
      `Reserved ${approvedQty} ${rec.unit} for ${rec.requester_name}. Available depot stock safely updated.`,
      "success"
    );
  };

  const handleDispatch = async (allocId: string, qty: number, driverInfo: string) => {
    setAllocations((prev) =>
      prev.map((a) =>
        a.allocation_id === allocId
          ? {
              ...a,
              allocation_status: "Dispatched",
              dispatched_quantity: qty,
              updated_at: new Date().toISOString(),
            }
          : a
      )
    );

    const audit: AuditLogEntry = {
      audit_id: `AUD-${Date.now().toString(36).toUpperCase()}`,
      actor_id: "DISPATCH-LOGISTICS",
      action: "DISPATCH_AID_SUPPLIES",
      entity_type: "ALLOCATION",
      entity_id: allocId,
      new_state: { status: "Dispatched", dispatched_quantity: qty },
      reason: driverInfo,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    addNotification("Aid Dispatched", `Consignment ${allocId} marked as in-transit with ${qty} units.`, "info");
  };

  const handleConfirmDelivery = async (allocId: string, receivedQty: number, notes?: string) => {
    const alloc = allocations.find((a) => a.allocation_id === allocId);
    const isDisputed = Boolean(notes && receivedQty < (alloc?.approved_quantity || 0));

    setAllocations((prev) =>
      prev.map((a) =>
        a.allocation_id === allocId
          ? {
              ...a,
              allocation_status: isDisputed ? "Disputed" : "Received",
              received_quantity: receivedQty,
              updated_at: new Date().toISOString(),
            }
          : a
      )
    );

    // If fully received, update request status to Fulfilled
    if (!isDisputed && alloc) {
      setRequests((prev) =>
        prev.map((r) =>
          r.request_id === alloc.request_id && (r.quantity_fulfilled || 0) >= r.quantity_required
            ? { ...r, status: "Fulfilled" }
            : r
        )
      );
    }

    const audit: AuditLogEntry = {
      audit_id: `AUD-${Date.now().toString(36).toUpperCase()}`,
      actor_id: "RECIPIENT-VERIFIED",
      action: "CONFIRM_DELIVERY_RECEIPT",
      entity_type: "ALLOCATION",
      entity_id: allocId,
      new_state: { status: isDisputed ? "Disputed" : "Received", received_quantity: receivedQty },
      reason: notes || "Full quantity confirmed at shelter reception",
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    addNotification(
      isDisputed ? "Delivery Discrepancy Reported" : "Delivery Confirmed",
      `Consignment ${allocId} received: ${receivedQty} units.`,
      isDisputed ? "critical" : "success"
    );
  };

  const handleCancelAllocation = async (allocId: string, reason: string) => {
    const alloc = allocations.find((a) => a.allocation_id === allocId);
    if (!alloc) return;

    // Release stock back
    setSupplies((prev) =>
      prev.map((s) => {
        if (s.supply_id === alloc.supply_id) {
          return {
            ...s,
            available_quantity: s.available_quantity + alloc.approved_quantity,
            reserved_quantity: Math.max(0, s.reserved_quantity - alloc.approved_quantity),
            status: "Available",
          };
        }
        return s;
      })
    );

    // Revert request
    setRequests((prev) =>
      prev.map((r) => {
        if (r.request_id === alloc.request_id) {
          const newFulfilled = Math.max(0, (r.quantity_fulfilled || 0) - alloc.approved_quantity);
          return {
            ...r,
            quantity_fulfilled: newFulfilled,
            status: newFulfilled === 0 ? "Submitted" : "Partially Allocated",
          };
        }
        return r;
      })
    );

    setAllocations((prev) =>
      prev.map((a) =>
        a.allocation_id === allocId ? { ...a, allocation_status: "Cancelled", updated_at: new Date().toISOString() } : a
      )
    );

    const audit: AuditLogEntry = {
      audit_id: `AUD-${Date.now().toString(36).toUpperCase()}`,
      actor_id: `COORD-${currentRole}`,
      action: "CANCEL_ALLOCATION_AND_RELEASE_STOCK",
      entity_type: "ALLOCATION",
      entity_id: allocId,
      reason,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    addNotification("Stock Released", `Allocation ${allocId} cancelled. Stock restored to available depot inventory.`, "info");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onResetDemo={handleResetDemo}
        backendOnline={backendOnline}
        notificationCount={notifications.filter((n) => !n.read).length}
        onOpenNotifications={() => setIsDrawerOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <RoleBanner role={currentRole} />

        {/* Tab Navigation */}
        <div className="border-b border-slate-800 mb-6 overflow-x-auto scrollbar-none">
          <nav className="flex space-x-2 sm:space-x-4 min-w-max">
            {[
              { id: "OVERVIEW", label: "Operations Map", icon: MapPin },
              { id: "REQUESTS", label: `Aid Requests (${requests.length})`, icon: HeartHandshake },
              { id: "SUPPLIES", label: `Supply Depots (${supplies.length})`, icon: Package },
              { id: "ALLOCATIONS", label: "Allocation Engine", icon: BrainCircuit, badge: "Coordinator" },
              { id: "FULFILMENT", label: `Deliveries (${allocations.length})`, icon: Truck },
              { id: "ANALYTICS", label: "Analytics & Coverage", icon: BarChart3 },
              { id: "ADMIN", label: "Admin & NGOs", icon: ShieldCheck, badge: "Admin" },
              { id: "AUDIT", label: "Audit Trail", icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                    active
                      ? "border-teal-400 text-teal-400"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Display */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-6">
            <DisasterMap requests={requests} supplies={supplies} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm text-white">Most Urgent Relief Needs</h4>
                  <button onClick={() => setActiveTab("REQUESTS")} className="text-xs text-teal-400 hover:underline">
                    View All ({requests.length})
                  </button>
                </div>
                <div className="divide-y divide-slate-800">
                  {requests.slice(0, 3).map((r) => (
                    <div key={r.request_id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">{r.requester_name}</div>
                        <div className="text-slate-400 text-[11px]">{r.quantity_required} {r.unit} of {r.item_category}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        r.urgency === "CRITICAL" ? "bg-red-950 text-red-400 border border-red-800" : "bg-orange-950 text-orange-400 border border-orange-800"
                      }`}>
                        {r.urgency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm text-white">Active Consignments in Transit</h4>
                  <button onClick={() => setActiveTab("FULFILMENT")} className="text-xs text-teal-400 hover:underline">
                    Track Fulfilment ({allocations.length})
                  </button>
                </div>
                <div className="divide-y divide-slate-800">
                  {allocations.slice(0, 3).map((a) => (
                    <div key={a.allocation_id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-mono text-teal-400 font-semibold">{a.allocation_id}</div>
                        <div className="text-slate-400 text-[11px]">{a.approved_quantity} {a.unit} allocated</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-sky-950 text-sky-300 border border-sky-800">
                        {a.allocation_status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "REQUESTS" && (
          <AidRequestsTab
            requests={requests}
            onCreateRequest={handleCreateRequest}
            currentRole={currentRole}
          />
        )}

        {activeTab === "SUPPLIES" && (
          <SupplyInventoryTab
            supplies={supplies}
            onCreateSupply={handleCreateSupply}
            currentRole={currentRole}
          />
        )}

        {activeTab === "ALLOCATIONS" && (
          <AllocationEngineTab
            requests={requests}
            supplies={supplies}
            onRunEngine={handleRunEngine}
            onApproveAllocation={handleApproveAllocation}
            matchingResult={matchingResult}
            isLoading={isMatchingLoading}
          />
        )}

        {activeTab === "FULFILMENT" && (
          <FulfilmentTrackingTab
            allocations={allocations}
            onDispatch={handleDispatch}
            onConfirmDelivery={handleConfirmDelivery}
            onCancelAllocation={handleCancelAllocation}
            currentRole={currentRole}
          />
        )}

        {activeTab === "ANALYTICS" && (
          <AnalyticsTab
            requests={requests}
            supplies={supplies}
            allocations={allocations}
          />
        )}

        {activeTab === "ADMIN" && (
          <AdminTab currentRole={currentRole} />
        )}

        {activeTab === "AUDIT" && (
          <AuditLogTab logs={auditLogs} />
        )}
      </main>

      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
      />

      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>ResQFlow Humanitarian Technology &bull; Community Emergency Resource Allocation Platform &bull; Cloud Firestore Architecture</p>
      </footer>
    </div>
  );
}
