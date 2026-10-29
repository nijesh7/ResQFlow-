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
import { QuickHelpBar } from "@/components/QuickHelpBar";
import { HowItWorksModal } from "@/components/HowItWorksModal";

const DEFAULT_ROLE_PERSONAS: Record<UserRole, AuthUser> = {
  COORDINATOR: {
    uid: "coord-priya-01",
    displayName: "Priya Sharma",
    email: "coordinator.priya@resqflow.org",
    role: "COORDINATOR",
    organisationName: "Coastal Disaster Relief Volunteers",
  },
  REQUESTER: {
    uid: "REQ-USR-1",
    displayName: "Dr. Suresh Kumar",
    email: "stjude.shelter@relief.org",
    role: "REQUESTER",
    organisationName: "St. Jude Relief Shelter (240 evacuees)",
  },
  DONOR: {
    uid: "DONOR-USR-2",
    displayName: "Apex Logistics Hub",
    email: "logistics.apex@donors.org",
    role: "DONOR",
    organisationName: "Apex Pharma Humanitarian Donation",
  },
  ADMIN: {
    uid: "admin-anand-01",
    displayName: "Anand Kumar",
    email: "admin.anand@resqflow.org",
    role: "ADMIN",
    organisationName: "Disaster Tech Operations Authority",
  },
};

const ROLE_DEFAULT_TABS: Record<UserRole, string> = {
  COORDINATOR: "OVERVIEW",
  REQUESTER: "REQUESTS",
  DONOR: "SUPPLIES",
  ADMIN: "ADMIN",
};

const ROLE_ALLOWED_TABS: Record<UserRole, string[]> = {
  COORDINATOR: ["OVERVIEW", "MAP", "REQUESTS", "SUPPLIES", "ALLOCATIONS", "FULFILMENT", "ANALYTICS", "AUDIT"],
  REQUESTER: ["REQUESTS", "FULFILMENT", "MAP"],
  DONOR: ["SUPPLIES", "FULFILMENT", "ANALYTICS", "MAP"],
  ADMIN: ["ADMIN", "AUDIT", "ANALYTICS", "OVERVIEW"],
};

export default function Home() {
  const [currentRole, setCurrentRole] = useState<UserRole>("COORDINATOR");
  const [activeTab, setActiveTab] = useState<string>("OVERVIEW");
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isMatchingLoading, setIsMatchingLoading] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Authentication State - Default to pre-authenticated Coordinator
  const [authUser, setAuthUser] = useState<AuthUser | null>(DEFAULT_ROLE_PERSONAS.COORDINATOR);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);

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

  // Guard activeTab based on currentRole allowed tabs
  useEffect(() => {
    const allowed = ROLE_ALLOWED_TABS[currentRole] || ROLE_ALLOWED_TABS.COORDINATOR;
    if (!allowed.includes(activeTab)) {
      setActiveTab(ROLE_DEFAULT_TABS[currentRole] || allowed[0]);
    }
  }, [currentRole, activeTab]);

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
          setActiveTab(ROLE_DEFAULT_TABS[parsed.role] || "OVERVIEW");
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

    const defaultTab = ROLE_DEFAULT_TABS[user.role] || "OVERVIEW";
    setActiveTab(defaultTab);

    addNotification(
      `Welcome, ${user.displayName}!`,
      `Signed in as ${user.role} (${user.organisationName || "Volunteer"}). Loaded specialized ${user.role} pages.`,
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

  // Instant Persona and Page Switcher
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    const persona = DEFAULT_ROLE_PERSONAS[role];
    setAuthUser(persona);
    const targetTab = ROLE_DEFAULT_TABS[role] || "OVERVIEW";
    setActiveTab(targetTab);

    if (typeof window !== "undefined") {
      localStorage.setItem("resqflow_auth_user", JSON.stringify(persona));
    }
    addNotification(
      `${role} Portal Activated`,
      `Switched to ${persona.displayName} (${persona.organisationName}). Now viewing ${role}-specific pages.`,
      "info"
    );
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

  // If user requests login modal or is not authenticated
  if (showLoginModal || !authUser) {
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
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
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
          onRoleChange={handleRoleChange}
          onSignOut={handleSignOut}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenLogin={() => setShowLoginModal(true)}
          onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Global Quick Action & Role Clarity Bar */}
          <QuickHelpBar
            currentRole={currentRole}
            onRoleChange={handleRoleChange}
            onNavigateTab={setActiveTab}
            onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
            onOpenCreateRequest={() => setActiveTab("REQUESTS")}
            onOpenCreateSupply={() => setActiveTab("SUPPLIES")}
          />

          {activeTab === "OVERVIEW" && (
            <OverviewView
              requests={requests}
              supplies={supplies}
              allocations={allocations}
              currentRole={currentRole}
              onRunEngine={handleRunEngine}
              onNavigateTab={setActiveTab}
              onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
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
                  {currentRole === "REQUESTER"
                    ? "Shelter Aid Requests & Emergency Submissions"
                    : "Shelter Aid Requests"}
                </h1>
                <p className="text-xs text-[#687386]">
                  {currentRole === "REQUESTER"
                    ? "Direct emergency demands from your shelter with automated depot matching and status tracking"
                    : "Verified relief demands submitted by field shelter leads and community response units"}
                </p>
              </div>
              <AidRequestsTab
                requests={requests}
                onCreateRequest={handleCreateRequest}
                currentRole={currentRole}
                authUser={authUser}
              />
            </div>
          )}

          {activeTab === "SUPPLIES" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
                  {currentRole === "DONOR"
                    ? "Humanitarian Depot Inventory & Pledges"
                    : "Supply Depot Inventory"}
                </h1>
                <p className="text-xs text-[#687386]">
                  {currentRole === "DONOR"
                    ? "Manage your registered relief goods, shelf-life monitoring, and shelter consignment commitments"
                    : "Verified stockpiles, humanitarian NGO donations, and reserved emergency consignments"}
                </p>
              </div>
              <SupplyInventoryTab
                supplies={supplies}
                onCreateSupply={handleCreateSupply}
                currentRole={currentRole}
                authUser={authUser}
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
              {currentRole !== "COORDINATOR" ? (
                <div className="resq-surface rounded-2xl p-8 text-center bg-[#FFFFFF]">
                  <h4 className="font-bold text-sm text-[#172033]">Coordinator Clearance Required</h4>
                  <p className="text-xs text-[#687386] mt-1 mb-4">
                    The Algorithmic Allocation Engine is restricted to Emergency Tactical Coordinators.
                  </p>
                  <button
                    onClick={() => setActiveTab(currentRole === "REQUESTER" ? "REQUESTS" : "SUPPLIES")}
                    className="px-4 py-2 rounded-xl bg-[#172033] text-white text-xs font-semibold"
                  >
                    Return to {currentRole === "REQUESTER" ? "My Requests" : "My Supplies"}
                  </button>
                </div>
              ) : (
                <AllocationEngineTab
                  requests={requests}
                  supplies={supplies}
                  onRunEngine={handleRunEngine}
                  onApproveAllocation={handleApproveAllocation}
                  matchingResult={matchingResult}
                  isLoading={isMatchingLoading}
                />
              )}
            </div>
          )}

          {activeTab === "FULFILMENT" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
                  {currentRole === "REQUESTER"
                    ? "Incoming Deliveries & Recipient Sign-Off"
                    : currentRole === "DONOR"
                    ? "Outbound Shipments & Donor Impact"
                    : "Deliveries & Chain of Custody"}
                </h1>
                <p className="text-xs text-[#687386]">
                  {currentRole === "REQUESTER"
                    ? "Live verification of incoming relief consignments with official shelter delivery sign-off"
                    : currentRole === "DONOR"
                    ? "Real-time tracking of your donated relief supplies reaching flood evacuee shelters"
                    : "Real-time consignment transit tracking, driver dispatches, and recipient delivery receipts"}
                </p>
              </div>
              <FulfilmentTrackingTab
                allocations={allocations}
                onDispatch={handleDispatch}
                onConfirmDelivery={handleConfirmDelivery}
                onCancelAllocation={handleCancelAllocation}
                currentRole={currentRole}
                authUser={authUser}
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

        {/* Plain English How It Works Modal */}
        <HowItWorksModal
          isOpen={isHowItWorksOpen}
          onClose={() => setIsHowItWorksOpen(false)}
          currentRole={currentRole}
          onSelectRole={handleRoleChange}
          onNavigateTab={setActiveTab}
        />

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
