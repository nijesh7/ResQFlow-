export type UrgencyLevel = "CRITICAL" | "HIGH" | "NORMAL";

export type RequestStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Partially Allocated"
  | "Fully Allocated"
  | "Fulfilled"
  | "Rejected"
  | "Cancelled";

export type SupplyStatus = "Available" | "Depleted" | "Expired" | "Paused";

export type AllocationStatus =
  | "Proposed"
  | "Approved"
  | "Reserved"
  | "Dispatched"
  | "Partially Received"
  | "Received"
  | "Disputed"
  | "Cancelled";

export type UserRole = "REQUESTER" | "DONOR" | "COORDINATOR" | "ADMIN";

export interface GeoLocation {
  lat?: number;
  lng?: number;
  address?: string;
  approximate?: boolean;
}

export interface AidRequest {
  request_id: string;
  requester_id: string;
  requester_name?: string;
  organisation_id?: string;
  item_category: string;
  description: string;
  quantity_required: number;
  quantity_fulfilled: number;
  unit: string;
  urgency: UrgencyLevel;
  location?: GeoLocation;
  needed_by?: string;
  created_at: string;
  status: RequestStatus;
  verification_status?: string;
}

export interface SupplyOffer {
  supply_id: string;
  donor_id: string;
  donor_name?: string;
  organisation_id?: string;
  item_category: string;
  description: string;
  total_quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  unit: string;
  location?: GeoLocation;
  expiry_at?: string;
  available_from?: string;
  available_until?: string;
  status: SupplyStatus;
  verification_status?: string;
}

export interface AllocationRecommendation {
  recommendation_id: string;
  request_id: string;
  supply_id: string;
  requester_name: string;
  donor_name: string;
  item_category: string;
  unit: string;
  requested_quantity: number;
  proposed_quantity: number;
  request_urgency: UrgencyLevel;
  distance_km?: number | null;
  priority_score: number;
  priority_reasons: string[];
  remaining_stock_after: number;
  is_partial: boolean;
  outstanding_request_quantity: number;
  needed_by?: string;
  supply_expiry?: string;
}

export interface UnfulfilledDemand {
  request_id: string;
  item_category: string;
  quantity_unfulfilled: number;
  unit: string;
  urgency: UrgencyLevel;
  reason: string;
}

export interface DuplicateFlag {
  primary_request_id: string;
  duplicate_request_id: string;
  similarity_score: number;
  reasons: string[];
}

export interface MatchingResult {
  recommendations: AllocationRecommendation[];
  unfulfilled_demands: UnfulfilledDemand[];
  duplicate_flags: DuplicateFlag[];
  total_requests_evaluated: number;
  total_supplies_evaluated: number;
  generated_at: string;
}

export interface AllocationRecord {
  allocation_id: string;
  request_id: string;
  supply_id: string;
  approved_quantity: number;
  unit: string;
  allocation_status: AllocationStatus;
  priority_reasons: string[];
  approved_by: string;
  override_reason?: string;
  dispatched_quantity: number;
  received_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  audit_id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  previous_state?: Record<string, unknown>;
  new_state?: Record<string, unknown>;
  reason?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "critical";
  timestamp: string;
  read: boolean;
}

export interface Organisation {
  organisationId: string;
  name: string;
  organisationType: "NGO" | "Government" | "Community Group" | "Hospital" | "Shelter";
  verificationStatus: "Verified" | "Pending" | "Suspended";
  serviceArea: string;
  contactEmail: string;
}
