import { AidRequest, SupplyOffer, AllocationRecord, AuditLogEntry, Organisation } from "@/types";

export const DEMO_ORGANISATIONS: Organisation[] = [
  {
    organisationId: "ORG-001",
    name: "Coastal Disaster Relief Volunteers",
    organisationType: "NGO",
    verificationStatus: "Verified",
    serviceArea: "North Zone & Flood Prone Basins",
    contactEmail: "coastal.relief@example.org"
  },
  {
    organisationId: "ORG-002",
    name: "Apex Medical Humanitarian Corps",
    organisationType: "Hospital",
    verificationStatus: "Verified",
    serviceArea: "Metro Area Trauma Response",
    contactEmail: "medical.corps@example.org"
  },
  {
    organisationId: "ORG-003",
    name: "Community Food Bank Coalition",
    organisationType: "Community Group",
    verificationStatus: "Pending",
    serviceArea: "Eastern District Relief Shelters",
    contactEmail: "foodbank@example.org"
  }
];

export const INITIAL_DEMO_REQUESTS: AidRequest[] = [
  {
    request_id: "REQ-101",
    requester_id: "REQ-USR-1",
    requester_name: "St. Jude Relief Shelter (240 evacuees)",
    organisation_id: "ORG-001",
    item_category: "WATER",
    description: "Urgent potable drinking water needed for elderly evacuees and children cut off by flash floods.",
    quantity_required: 400,
    quantity_fulfilled: 0,
    unit: "liters",
    urgency: "CRITICAL",
    location: {
      lat: 13.0850,
      lng: 80.2780,
      address: "Shelter 4B, Riverview Road, Chennai",
      approximate: true
    },
    needed_by: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: "Submitted",
    verification_status: "Verified"
  },
  {
    request_id: "REQ-102",
    requester_id: "REQ-USR-2",
    requester_name: "Suburban Community Clinic",
    organisation_id: "ORG-002",
    item_category: "MEDICINE",
    description: "Antiseptic wipes, suture kits, and trauma bandages for flood injury triage.",
    quantity_required: 60,
    quantity_fulfilled: 0,
    unit: "kits",
    urgency: "CRITICAL",
    location: {
      lat: 13.0420,
      lng: 80.2450,
      address: "Triage Outpost, Ward 12, Chennai",
      approximate: true
    },
    needed_by: new Date(Date.now() + 10 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    status: "Submitted",
    verification_status: "Verified"
  },
  {
    request_id: "REQ-103",
    requester_id: "REQ-USR-3",
    requester_name: "High School Evacuation Camp",
    organisation_id: "ORG-003",
    item_category: "FOOD",
    description: "Dry rations and ready-to-eat meal packs for 120 displaced families.",
    quantity_required: 150,
    quantity_fulfilled: 0,
    unit: "boxes",
    urgency: "HIGH",
    location: {
      lat: 13.0600,
      lng: 80.2200,
      address: "Govt Higher Secondary Ground, Chennai",
      approximate: true
    },
    needed_by: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    status: "Submitted",
    verification_status: "Verified"
  },
  {
    request_id: "REQ-104",
    requester_id: "REQ-USR-1", // duplicate test pattern: same requester
    requester_name: "St. Jude Relief Shelter (Duplicate entry)",
    organisation_id: "ORG-001",
    item_category: "WATER",
    description: "Urgent potable drinking water needed for evacuees cut off by waterlogging.",
    quantity_required: 380,
    quantity_fulfilled: 0,
    unit: "liters",
    urgency: "CRITICAL",
    location: {
      lat: 13.0852,
      lng: 80.2782,
      address: "Shelter 4B, Riverview Road, Chennai",
      approximate: true
    },
    needed_by: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    status: "Submitted",
    verification_status: "Pending Review"
  },
  {
    request_id: "REQ-105",
    requester_id: "REQ-USR-4",
    requester_name: "Coastal Fisherfolk Community Center",
    item_category: "SHELTER",
    description: "Heavy duty tarpaulins and waterproof rope for damaged coastal roofs.",
    quantity_required: 40,
    quantity_fulfilled: 0,
    unit: "kits",
    urgency: "NORMAL",
    location: {
      lat: 13.0100,
      lng: 80.2600,
      address: "Kottivakkam Coastal Hamlet",
      approximate: true
    },
    needed_by: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    status: "Submitted",
    verification_status: "Verified"
  }
];

export const INITIAL_DEMO_SUPPLIES: SupplyOffer[] = [
  {
    supply_id: "SUP-201",
    donor_id: "DONOR-USR-1",
    donor_name: "Metropolitan Water Supply Reserve",
    organisation_id: "ORG-001",
    item_category: "WATER",
    description: "Clean drinking water in sealed 20-liter food-grade containers.",
    total_quantity: 600,
    available_quantity: 600,
    reserved_quantity: 0,
    unit: "liters",
    location: {
      lat: 13.0900,
      lng: 80.2700,
      address: "Depot North, Central Avenue",
      approximate: true
    },
    expiry_at: new Date(Date.now() + 30 * 86400 * 1000).toISOString(),
    status: "Available",
    verification_status: "Verified"
  },
  {
    supply_id: "SUP-202",
    donor_id: "DONOR-USR-2",
    donor_name: "Apex Pharma Humanitarian Donation",
    organisation_id: "ORG-002",
    item_category: "MEDICINE",
    description: "Sterile first aid kits and trauma bandages ready for field triage.",
    total_quantity: 45, // Less than the 60 required (tests partial allocation)
    available_quantity: 45,
    reserved_quantity: 0,
    unit: "kits",
    location: {
      lat: 13.0500,
      lng: 80.2400,
      address: "Apex Medical Logistics Hub",
      approximate: true
    },
    expiry_at: new Date(Date.now() + 180 * 86400 * 1000).toISOString(),
    status: "Available",
    verification_status: "Verified"
  },
  {
    supply_id: "SUP-203",
    donor_id: "DONOR-USR-3",
    donor_name: "Central Rotary Disaster Reserve",
    item_category: "FOOD",
    description: "Fortified dry ration boxes (rice, pulses, energy biscuits, oil).",
    total_quantity: 200,
    available_quantity: 200,
    reserved_quantity: 0,
    unit: "boxes",
    location: {
      lat: 13.0650,
      lng: 80.2150,
      address: "Rotary Disaster Warehouse West",
      approximate: true
    },
    expiry_at: new Date(Date.now() + 90 * 86400 * 1000).toISOString(),
    status: "Available",
    verification_status: "Verified"
  },
  {
    supply_id: "SUP-204",
    donor_id: "DONOR-USR-4",
    donor_name: "Coastal Construction Supply Depot",
    item_category: "SHELTER",
    description: "Weather-resistant 15x12ft tarpaulin sheets and tie-down cord.",
    total_quantity: 25,
    available_quantity: 25,
    reserved_quantity: 0,
    unit: "kits",
    location: {
      lat: 13.0150,
      lng: 80.2550,
      address: "Depot South Harbor Yard",
      approximate: true
    },
    expiry_at: new Date(Date.now() + 365 * 86400 * 1000).toISOString(),
    status: "Available",
    verification_status: "Verified"
  }
];

export const INITIAL_DEMO_ALLOCATIONS: AllocationRecord[] = [
  {
    allocation_id: "ALLOC-DEMO-01",
    request_id: "REQ-101",
    supply_id: "SUP-201",
    approved_quantity: 200,
    unit: "liters",
    allocation_status: "Dispatched",
    priority_reasons: [
      "CRITICAL urgency prioritised (+100 pts)",
      "Category 'WATER' compatible with supply 'WATER' (liters)",
      "Transit distance: 1.4 km"
    ],
    approved_by: "COORDINATOR-PRIYA",
    dispatched_quantity: 200,
    received_quantity: 0,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }
];

export const INITIAL_DEMO_AUDIT_LOGS: AuditLogEntry[] = [
  {
    audit_id: "AUD-001",
    actor_id: "COORD-ANAND",
    action: "APPROVE_AND_RESERVE_STOCK",
    entity_type: "ALLOCATION",
    entity_id: "ALLOC-DEMO-01",
    previous_state: { available_quantity: 600, reserved_quantity: 0 },
    new_state: { available_quantity: 400, reserved_quantity: 200 },
    reason: "Disaster shelter water urgency certified by field coordinator",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    audit_id: "AUD-002",
    actor_id: "VOLUNTEER-RAVI",
    action: "DISPATCH_AID_SUPPLIES",
    entity_type: "ALLOCATION",
    entity_id: "ALLOC-DEMO-01",
    new_state: { dispatched_quantity: 200, status: "Dispatched" },
    reason: "Loaded onto relief pickup truck TN-01-V-8821",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }
];
