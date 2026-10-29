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
  saveAuditLogToFirestore
} from "@/lib/firestore-sync";

import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { OverviewView } from "@/components/OverviewView";
import { DisasterMap } from "@/components/DisasterMap";
import { AidRequestsTab } from "@/components/AidRequestsTab";
import { SupplyInventoryTab } from "@/components/SupplyInventoryTab";
import { AllocationEngineTab } from "@/components/AllocationEngineTab";
import { FulfilmentTrackingTab } from "@/components/FulfilmentTrackingTab";
import { AnalyticsTab } from "@/components/AnalyticsTab";
import { AdminTab } from "@/components/AdminTab";
import { AuditLogTab } from "@/components/AuditLogTab";
import { NotificationDrawer } from "@/components/NotificationDrawer";
import { LoginPage } from "@/components/LoginPage";

export default function Home() {
  const [currentRole, setCurrentRole] = useState<UserRole>("COORDINATOR");
  const [activeTab, setActiveTab] = useState<string>("OVERVIEW");
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isMatchingLoading, setIsMatchingLoading] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Authentication State - Default to pre-authenticated Coordinator for instant review
  const [authUser, setAuthUser] = useState<AuthUser | null>({
    uid: "coord-priya-01",
    displayName: "Priya Sharma",
    email: "coordinator.priya@resqflow.org",
    role: "COORDINATOR",
    organisationName: "Coastal Disaster Relief Volunteers",
  });
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

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
      message: "Cyclone Michaung demonstration dataset initialized for coastal relief operations.",
      type: "info",
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: "n2",
      title: "Stock Reservation Active",
      message: "200 liters of drinking water reserved for Shelter 4B.",
      type: "success",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      read: false,
    },
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

  const addNotification = (
    title: string,
    message: string,
    type: "info" | "warning" | "success" | "critical"
  ) => {
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

    if (user.role === "REQUESTER") {
      setActiveTab("REQUESTS");
    } else if (user.role === "DONOR") {
      setActiveTab("SUPPLIES");
    } else if (user.role === "COORDINATOR") {
      setActiveTab("OVERVIEW");
    } else if (user.role === "ADMIN") {
      setActiveTab("ADMIN");
    }

    addNotification(
      `Welcome, ${user.displayName}!`,
      `Signed in as ${user.role} (${user.organisationName || "Volunteer"}).`,
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

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (authUser) {
      const updated = { ...authUser, role };
      setAuthUser(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("resqflow_auth_user", JSON.stringify(updated));
      }
    }
    addNotification("Persona Switched", `Active operational role set to ${role}.`, "info");
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
        a.allocation_id === allocId
          ? { ...a, allocation_status: "Cancelled", updated_at: new Date().toISOString() }
          : a
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

    addNotification(
      "Stock Released",
      `Allocation ${allocId} cancelled. Stock restored to available depot inventory.`,
      "info"
    );
  };

  // If user requests login modal
  if (showLoginModal) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onCancel={authUser ? () => setShowLoginModal(false) : undefined}
      />
    );
  }

  const criticalCount = requests.filter((r) => r.urgency === "CRITICAL").length;
  const availableStockCount = supplies.reduce((acc, s) => acc + s.available_quantity, 0);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172033] flex flex-col font-sans selection:bg-[#F04452] selection:text-white">
      {/* 1. Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onNavigateTab={setActiveTab}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        authUser={authUser}
        onSignOut={handleSignOut}
        onOpenLogin={() => setShowLoginModal(true)}
        criticalRequestsCount={criticalCount}
        availableStockCount={availableStockCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Layout (Offset by sidebar width on large screens) */}
      <div className="lg:pl-64 flex flex-col min-h-screen flex-1">
        {/* Top Header */}
        <TopHeader
          activeTab={activeTab}
          backendOnline={backendOnline}
          notificationCount={notifications.filter((n) => !n.read).length}
          onOpenNotifications={() => setIsDrawerOpen(true)}
          onResetDemo={handleResetDemo}
          authUser={authUser}
          currentRole={currentRole}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenLogin={() => setShowLoginModal(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === "OVERVIEW" && (
            <OverviewView
              requests={requests}
              supplies={supplies}
              allocations={allocations}
              currentRole={currentRole}
              onRunEngine={handleRunEngine}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === "MAP" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
                    Geospatial Operations Map
                  </h1>
                  <p className="text-xs text-[#687386]">
                    Full-screen tactical visualization of disaster demands, depot hubs, and allocation routes
                  </p>
                </div>
              </div>
              <DisasterMap
                requests={requests}
                supplies={supplies}
                onOpenAllocations={() => setActiveTab("ALLOCATIONS")}
                compactHeight={false}
              />
            </div>
          )}

          {activeTab === "REQUESTS" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
                  Shelter Aid Requests
                </h1>
                <p className="text-xs text-[#687386]">
                  Verified relief demands submitted by field shelter leads and community response units
                </p>
              </div>
              <AidRequestsTab
                requests={requests}
                onCreateRequest={handleCreateRequest}
                currentRole={currentRole}
              />
            </div>
          )}

          {activeTab === "SUPPLIES" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
                  Supply Depot Inventory
                </h1>
                <p className="text-xs text-[#687386]">
                  Verified stockpiles, humanitarian NGO donations, and reserved emergency consignments
                </p>
              </div>
              <SupplyInventoryTab
                supplies={supplies}
                onCreateSupply={handleCreateSupply}
                currentRole={currentRole}
              />
            </div>
          )}

          {activeTab === "ALLOCATIONS" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
                  Algorithmic Allocation Workspace
                </h1>
                <p className="text-xs text-[#687386]">
                  Deterministic matching engine with explainable priority scores and transactional reservations
                </p>
              </div>
              <AllocationEngineTab
                requests={requests}
                supplies={supplies}
                onRunEngine={handleRunEngine}
                onApproveAllocation={handleApproveAllocation}
                matchingResult={matchingResult}
                isLoading={isMatchingLoading}
              />
            </div>
          )}

          {activeTab === "FULFILMENT" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
                  Deliveries &amp; Chain of Custody
                </h1>
                <p className="text-xs text-[#687386]">
                  Real-time consignment transit tracking, driver dispatches, and recipient delivery receipts
                </p>
              </div>
              <FulfilmentTrackingTab
                allocations={allocations}
                onDispatch={handleDispatch}
                onConfirmDelivery={handleConfirmDelivery}
                onCancelAllocation={handleCancelAllocation}
                currentRole={currentRole}
              />
            </div>
          )}

          {activeTab === "ANALYTICS" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
                  Resource Analytics &amp; Coverage
                </h1>
                <p className="text-xs text-[#687386]">
                  Fulfillment ratios, unmet demand diagnostics, and category stock balances
                </p>
              </div>
              <AnalyticsTab
                requests={requests}
                supplies={supplies}
                allocations={allocations}
              />
            </div>
          )}

          {activeTab === "ADMIN" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
                  Administration &amp; Governance
                </h1>
                <p className="text-xs text-[#687386]">
                  Humanitarian organization accreditation, role permissions, and Cloud Firestore synchronization
                </p>
              </div>
              <AdminTab currentRole={currentRole} />
            </div>
          )}

          {activeTab === "AUDIT" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
                  Immutable Audit Ledger
                </h1>
                <p className="text-xs text-[#687386]">
                  Cryptographic transaction audit trail preserving accountability and chain-of-custody
                </p>
              </div>
              <AuditLogTab logs={auditLogs} />
            </div>
          )}
        </main>

        {/* 3. Notification Drawer */}
        <NotificationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          notifications={notifications}
          onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
        />

        {/* 4. Elegant Footer */}
        <footer className="border-t border-[#E7EAF0] bg-[#FFFFFF] py-4 px-6 text-center text-xs text-[#687386]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-medium">
              ResQFlow Command &bull; Disaster Resource Allocation SaaS Platform
            </span>
            <span className="text-[11px] text-[#8C9BAE]">
              Cloud Firestore &bull; FastAPI Algorithmic Engine &bull; Humanitarian Technology
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
