from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator

class UrgencyLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    NORMAL = "NORMAL"

class RequestStatus(str, Enum):
    DRAFT = "Draft"
    SUBMITTED = "Submitted"
    UNDER_REVIEW = "Under Review"
    APPROVED = "Approved"
    PARTIALLY_ALLOCATED = "Partially Allocated"
    FULLY_ALLOCATED = "Fully Allocated"
    FULFILLED = "Fulfilled"
    REJECTED = "Rejected"
    CANCELLED = "Cancelled"

class SupplyStatus(str, Enum):
    AVAILABLE = "Available"
    DEPLETED = "Depleted"
    EXPIRED = "Expired"
    PAUSED = "Paused"

class AllocationStatus(str, Enum):
    PROPOSED = "Proposed"
    APPROVED = "Approved"
    RESERVED = "Reserved"
    DISPATCHED = "Dispatched"
    PARTIALLY_RECEIVED = "Partially Received"
    RECEIVED = "Received"
    DISPUTED = "Disputed"
    CANCELLED = "Cancelled"

class GeoLocation(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    address: Optional[str] = "Location on File"
    approximate: bool = True

class AidRequest(BaseModel):
    request_id: str
    requester_id: str
    requester_name: Optional[str] = "Community Requester"
    organisation_id: Optional[str] = None
    item_category: str
    description: str
    quantity_required: float = Field(gt=0, description="Quantity required must be strictly positive")
    quantity_fulfilled: float = Field(default=0.0, ge=0)
    unit: str
    urgency: UrgencyLevel = UrgencyLevel.NORMAL
    location: Optional[GeoLocation] = None
    needed_by: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: RequestStatus = RequestStatus.SUBMITTED
    verification_status: str = "Verified"

    @property
    def remaining_demand(self) -> float:
        return max(0.0, self.quantity_required - self.quantity_fulfilled)

class SupplyOffer(BaseModel):
    supply_id: str
    donor_id: str
    donor_name: Optional[str] = "Community Donor"
    organisation_id: Optional[str] = None
    item_category: str
    description: str
    total_quantity: float = Field(gt=0)
    available_quantity: float = Field(ge=0)
    reserved_quantity: float = Field(default=0.0, ge=0)
    unit: str
    location: Optional[GeoLocation] = None
    expiry_at: Optional[datetime] = None
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None
    status: SupplyStatus = SupplyStatus.AVAILABLE
    verification_status: str = "Verified"

    @field_validator("available_quantity")
    def check_non_negative(cls, v):
        if v < 0:
            raise ValueError("Available quantity cannot be negative")
        return v

class AllocationRecommendation(BaseModel):
    recommendation_id: str
    request_id: str
    supply_id: str
    requester_name: str
    donor_name: str
    item_category: str
    unit: str
    requested_quantity: float
    proposed_quantity: float
    request_urgency: UrgencyLevel
    distance_km: Optional[float] = None
    priority_score: float
    priority_reasons: List[str]
    remaining_stock_after: float
    is_partial: bool
    outstanding_request_quantity: float
    needed_by: Optional[datetime] = None
    supply_expiry: Optional[datetime] = None

class UnfulfilledDemand(BaseModel):
    request_id: str
    item_category: str
    quantity_unfulfilled: float
    unit: str
    urgency: UrgencyLevel
    reason: str

class DuplicateFlag(BaseModel):
    primary_request_id: str
    duplicate_request_id: str
    similarity_score: float
    reasons: List[str]

class MatchingRequest(BaseModel):
    requests: List[AidRequest]
    supplies: List[SupplyOffer]
    check_duplicates: bool = True

class MatchingResult(BaseModel):
    recommendations: List[AllocationRecommendation]
    unfulfilled_demands: List[UnfulfilledDemand]
    duplicate_flags: List[DuplicateFlag]
    total_requests_evaluated: int
    total_supplies_evaluated: int
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class AllocationApprovalRequest(BaseModel):
    idempotency_key: str
    request_id: str
    supply_id: str
    approved_quantity: float = Field(gt=0)
    coordinator_id: str
    coordinator_name: Optional[str] = "Relief Coordinator"
    override_reason: Optional[str] = None

class AllocationRecord(BaseModel):
    allocation_id: str
    request_id: str
    supply_id: str
    approved_quantity: float
    unit: str
    allocation_status: AllocationStatus
    priority_reasons: List[str] = []
    approved_by: str
    override_reason: Optional[str] = None
    dispatched_quantity: float = 0.0
    received_quantity: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DispatchDeliveryRequest(BaseModel):
    allocation_id: str
    dispatched_quantity: float = Field(gt=0)
    dispatched_by: str
    tracking_notes: Optional[str] = None

class ConfirmDeliveryRequest(BaseModel):
    allocation_id: str
    received_quantity: float = Field(ge=0)
    recipient_id: str
    discrepancy_notes: Optional[str] = None
    confirmation_evidence: Optional[str] = None

class AuditLogEntry(BaseModel):
    audit_id: str
    actor_id: str
    action: str
    entity_type: str
    entity_id: str
    previous_state: Optional[Dict[str, Any]] = None
    new_state: Optional[Dict[str, Any]] = None
    reason: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
