"use client";

import React, { useState, useEffect } from "react";
import {
  UserRole,
  AuthUser,
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
import {
  saveRequestToFirestore,
  saveSupplyToFirestore,
  saveAllocationToFirestore,
  saveAuditLogToFirestore,
  fetchRequestsFromFirestore,
  fetchSuppliesFromFirestore
} from "@/lib/firestore-sync";


import { Navbar } from "@/components/Navbar";
import { RoleBanner } from "@/components/RoleBanner";
import { DisasterMap } from "@/components/DisasterMap";
import { MissionControl360 } from "@/components/MissionControl360";
import { AidRequestsTab } from "@/components/AidRequestsTab";
import { SupplyInventoryTab } from "@/components/SupplyInventoryTab";
import { AllocationEngineTab } from "@/components/AllocationEngineTab";
import { FulfilmentTrackingTab } from "@/components/FulfilmentTrackingTab";
import { AnalyticsTab } from "@/components/AnalyticsTab";
import { AdminTab } from "@/components/AdminTab";
import { AuditLogTab } from "@/components/AuditLogTab";
import { NotificationDrawer } from "@/components/NotificationDrawer";
import { LoginPage } from "@/components/LoginPage";

import {
  MapPin,
  HeartHandshake,
  Package,
  BrainCircuit,
  Truck,
  BarChart3,
  ShieldCheck,
  History,
  Compass
} from "lucide-react";

export default function Home() {
  const [currentRole, setCurrentRole] = useState<UserRole>("COORDINATOR");
  const [activeTab, setActiveTab] = useState<string>("OVERVIEW");
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isMatchingLoading, setIsMatchingLoading] = useState<boolean>(false);

  // Authentication State
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(true);

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

  // Check Backend health and retrieve cached auth session on mount
  useEffect(() => {
    let isMounted = true;
    checkBackendHealth().then((status) => {
      if (isMounted) {
        setBackendOnline(status.ok);
      }
    });

    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("resqflow_auth_user");
      if (savedUser) {
        try {
          const parsed: AuthUser = JSON.parse(savedUser);
          setAuthUser(parsed);
          setCurrentRole(parsed.role);
        } catch (e) {
          console.error("Failed to parse cached session", e);
        }
      }
    }

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

  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    setCurrentRole(user.role);
    setShowLoginModal(false);

    // Switch default tab tailored to the user's role
    if (user.role === "REQUESTER") {
      setActiveTab("REQUESTS");
    } else if (user.role === "DONOR") {
      setActiveTab("SUPPLIES");
    } else if (user.role === "COORDINATOR") {
      setActiveTab("ALLOCATIONS");
    } else if (user.role === "ADMIN") {
      setActiveTab("ADMIN");
    }

    addNotification(
      `Welcome, ${user.displayName}!`,
      `Signed in successfully with role: ${user.role} (${user.organisationName || "Volunteer"}).`,
      "success"
    );
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("resqflow_auth_user");
    }
    setAuthUser(null);
    setShowLoginModal(true);
    addNotification("Signed Out", "You have signed out of ResQFlow.", "info");
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
      requester_id: authUser?.uid || `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      requester_name: newReq.requester_name || authUser?.displayName || "Community Relief Shelter",
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
    saveRequestToFirestore(req);
    addNotification(
      `New ${req.urgency} Request`,
      `${req.requester_name} created request for ${req.quantity_required} ${req.unit} of ${req.item_category}.`,
      req.urgency === "CRITICAL" ? "critical" : "warning"
    );
  };

  const handleCreateSupply = (newSup: Partial<SupplyOffer>) => {
    const sup: SupplyOffer = {
      supply_id: `SUP-${Math.floor(200 + Math.random() * 800)}`,
      donor_id: authUser?.uid || `DONOR-${Math.floor(1000 + Math.random() * 9000)}`,
      donor_name: newSup.donor_name || authUser?.displayName || "Community Relief Donor",
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
    saveSupplyToFirestore(sup);
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
      authUser?.displayName ? `${authUser.displayName} (${currentRole})` : `COORD-${currentRole}`,
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
    saveAllocationToFirestore(newRecord);

    // 5. Audit Log
    const audit: AuditLogEntry = {
      audit_id: `AUD-${Date.now().toString(36).toUpperCase()}`,
      actor_id: authUser?.displayName ? `${authUser.displayName} (${currentRole})` : `COORD-${currentRole}`,
      action: "APPROVE_AND_RESERVE_STOCK",
      entity_type: "ALLOCATION",
      entity_id: newRecord.allocation_id,
      previous_state: { available_quantity: rec.remaining_stock_after + approvedQty },
      new_state: { available_quantity: rec.remaining_stock_after, reserved_quantity: approvedQty },
      reason: overrideReason || "Coordinator verified and approved recommendation",
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);
    saveAuditLogToFirestore(audit);

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
      actor_id: authUser?.displayName || "DISPATCH-LOGISTICS",
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
      actor_id: authUser?.displayName || "RECIPIENT-VERIFIED",
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
      actor_id: authUser?.displayName ? `${authUser.displayName} (${currentRole})` : `COORD-${currentRole}`,
      action: "CANCEL_ALLOCATION_AND_RELEASE_STOCK",
      entity_type: "ALLOCATION",
      entity_id: allocId,
      reason,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    addNotification("Stock Released", `Allocation ${allocId} cancelled. Stock restored to available depot inventory.`, "info");
  };

  // If user clicks "Login / Select Role" or has no active session, show the login experience
  if (showLoginModal) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onCancel={authUser ? () => setShowLoginModal(false) : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          if (authUser) {
            const updated = { ...authUser, role };
            setAuthUser(updated);
            if (typeof window !== "undefined") {
              localStorage.setItem("resqflow_auth_user", JSON.stringify(updated));
            }
          }
        }}
        onResetDemo={handleResetDemo}
        backendOnline={backendOnline}
        notificationCount={notifications.filter((n) => !n.read).length}
        onOpenNotifications={() => setIsDrawerOpen(true)}
        authUser={authUser}
        onOpenLogin={() => setShowLoginModal(true)}
        onSignOut={handleSignOut}
        activeTab={activeTab}
        onNavigateTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <RoleBanner role={currentRole} onNavigateTab={setActiveTab} />

        {/* Quick KPI Overview Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Critical Requests</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {requests.filter(r => r.urgency === "CRITICAL").length}
                </span>
                <span className="text-[10px] text-red-700 font-bold px-1.5 py-0.5 rounded-full bg-red-50 border border-red-200">
                  Urgent
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Available Stock</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {supplies.reduce((acc, s) => acc + s.available_quantity, 0)}
                </span>
                <span className="text-[10px] text-teal-700 font-bold px-1.5 py-0.5 rounded-full bg-teal-50 border border-teal-200">
                  Ready Depot
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 text-teal-600">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Stock in Transit / Reserved</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {supplies.reduce((acc, s) => acc + s.reserved_quantity, 0)}
                </span>
                <span className="text-[10px] text-amber-700 font-bold px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                  Locked
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
              <Truck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Verified Deliveries</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {allocations.filter(a => a.allocation_status === "Received").length}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                  Delivered
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 mb-6 overflow-x-auto scrollbar-none">
          <nav className="flex space-x-1.5 sm:space-x-2 min-w-max pb-2">
            {[
              { id: "OVERVIEW", label: "Mission Control 360", icon: Compass, badge: "HUD" },
              { id: "REQUESTS", label: `Aid Requests (${requests.length})`, icon: HeartHandshake },
              { id: "SUPPLIES", label: `Supply Depots (${supplies.length})`, icon: Package },
              { id: "ALLOCATIONS", label: "Allocation Engine", icon: BrainCircuit, badge: "Coordinator" },
              { id: "FULFILMENT", label: `Deliveries (${allocations.length})`, icon: Truck },
              { id: "ANALYTICS", label: "Analytics & Coverage", icon: BarChart3 },
              { id: "ADMIN", label: "Admin & Firestore", icon: ShieldCheck, badge: "Live" },
              { id: "AUDIT", label: "Audit Trail", icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    active
                      ? "bg-teal-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                      active ? "bg-teal-700 text-white" : "bg-slate-200 text-slate-600"
                    }`}>
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
          <MissionControl360
            requests={requests}
            supplies={supplies}
            allocations={allocations}
            currentRole={currentRole}
            onRunEngine={handleRunEngine}
            onNavigateTab={setActiveTab}
            onExecuteCommand={(action, target) => {
              addNotification(
                `Emergency Command Dispatched`,
                `Action [${action}] directed to [${target}] by ${authUser?.displayName || currentRole}.`,
                "info"
              );
            }}
          />
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

      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        <p>ResQFlow Humanitarian Technology &bull; Community Emergency Resource Allocation Platform &bull; Cloud Firestore Architecture</p>
      </footer>
    </div>
  );
}
