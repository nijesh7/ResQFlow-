from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Header, status
from ..models.schemas import (
    MatchingRequest,
    MatchingResult,
    AllocationApprovalRequest,
    AllocationRecord,
    DispatchDeliveryRequest,
    ConfirmDeliveryRequest,
    AuditLogEntry,
    AidRequest,
    SupplyOffer
)
from ..services.allocation_engine import RulesBasedAllocationEngine
from ..services.duplicate_detector import DuplicateDetector
from ..services.reservation_service import reservation_service, StockReservationError

router = APIRouter()
duplicate_detector = DuplicateDetector()

@router.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "ResQFlow Intelligent Resource Allocation Engine",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "mode": "production-ready"
    }

@router.post("/matching/recommendations", response_model=MatchingResult, tags=["Matching Engine"])
async def generate_recommendations(payload: MatchingRequest):
    """
    Executes rules-based matching between active aid requests and available supplies.
    Provides explainable recommendation scores, handles partial allocations,
    and identifies unfulfilled demand and suspected duplicate requests.
    """
    if not payload.requests:
        return MatchingResult(
            recommendations=[],
            unfulfilled_demands=[],
            duplicate_flags=[],
            total_requests_evaluated=0,
            total_supplies_evaluated=len(payload.supplies)
        )

    # Populate in-memory database for reservation sync
    for r in payload.requests:
        reservation_service.requests_db[r.request_id] = r.dict()
    for s in payload.supplies:
        reservation_service.supplies_db[s.supply_id] = s.dict()

    engine = RulesBasedAllocationEngine()
    recs, unfulfilled = engine.run_matching(payload.requests, payload.supplies)

    duplicate_flags = []
    if payload.check_duplicates:
        duplicate_flags = duplicate_detector.detect_duplicates(payload.requests)

    return MatchingResult(
        recommendations=recs,
        unfulfilled_demands=unfulfilled,
        duplicate_flags=duplicate_flags,
        total_requests_evaluated=len(payload.requests),
        total_supplies_evaluated=len(payload.supplies)
    )

@router.post("/allocations/preview", tags=["Matching Engine"])
async def preview_allocation(payload: AllocationApprovalRequest):
    """
    Calculates the impact of an allocation without committing stock or writing audit logs.
    """
    if payload.request_id not in reservation_service.requests_db:
        raise HTTPException(status_code=404, detail="Request not found in working context")
    if payload.supply_id not in reservation_service.supplies_db:
        raise HTTPException(status_code=404, detail="Supply not found in working context")

    req = reservation_service.requests_db[payload.request_id]
    supply = reservation_service.supplies_db[payload.supply_id]

    remaining_needed = max(0.0, float(req["quantity_required"]) - float(req.get("quantity_fulfilled", 0.0)))
    avail = float(supply["available_quantity"])

    feasible_qty = min(payload.approved_quantity, avail, remaining_needed)
    remaining_stock = avail - feasible_qty
    remaining_demand = remaining_needed - feasible_qty

    return {
        "request_id": payload.request_id,
        "supply_id": payload.supply_id,
        "requested_quantity": payload.approved_quantity,
        "feasible_quantity": feasible_qty,
        "is_feasible": feasible_qty > 0,
        "remaining_supply_stock": remaining_stock,
        "remaining_unfulfilled_demand": remaining_demand,
        "requires_partial_flag": feasible_qty < remaining_needed
    }

@router.post("/allocations/approve", response_model=AllocationRecord, tags=["Allocations"])
async def approve_allocation(payload: AllocationApprovalRequest):
    """
    Safely approves an allocation and reserves stock with transaction safety and idempotency.
    """
    try:
        allocation, audit = reservation_service.approve_allocation_transactional(
            idempotency_key=payload.idempotency_key,
            request_id=payload.request_id,
            supply_id=payload.supply_id,
            approved_quantity=payload.approved_quantity,
            coordinator_id=payload.coordinator_id,
            override_reason=payload.override_reason
        )
        return allocation
    except StockReservationError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": e.code, "message": e.message}
        )

@router.post("/allocations/{allocation_id}/cancel", response_model=AllocationRecord, tags=["Allocations"])
async def cancel_allocation(
    allocation_id: str,
    actor_id: str = Query(..., description="ID of coordinator or admin cancelling"),
    reason: str = Query("Coordinator cancelled", description="Reason for cancellation")
):
    """
    Cancels an allocation, restores reserved stock to available inventory, and reverts request status.
    """
    try:
        return reservation_service.cancel_allocation(allocation_id, actor_id, reason)
    except StockReservationError as e:
        raise HTTPException(status_code=400, detail={"code": e.code, "message": e.message})

@router.post("/deliveries/{allocation_id}/dispatch", response_model=AllocationRecord, tags=["Fulfilment"])
async def dispatch_delivery(allocation_id: str, payload: DispatchDeliveryRequest):
    """
    Marks an allocation as dispatched and records transit details.
    """
    try:
        return reservation_service.record_dispatch(
            allocation_id=allocation_id,
            dispatched_quantity=payload.dispatched_quantity,
            actor_id=payload.dispatched_by
        )
    except StockReservationError as e:
        raise HTTPException(status_code=400, detail={"code": e.code, "message": e.message})

@router.post("/deliveries/{allocation_id}/confirm", response_model=AllocationRecord, tags=["Fulfilment"])
async def confirm_delivery(allocation_id: str, payload: ConfirmDeliveryRequest):
    """
    Confirms receipt of aid supplies. Validates partial vs full delivery or records discrepancies.
    """
    try:
        return reservation_service.confirm_delivery(
            allocation_id=allocation_id,
            received_quantity=payload.received_quantity,
            recipient_id=payload.recipient_id,
            discrepancy_notes=payload.discrepancy_notes
        )
    except StockReservationError as e:
        raise HTTPException(status_code=400, detail={"code": e.code, "message": e.message})

@router.get("/audit/logs", response_model=List[AuditLogEntry], tags=["Audit"])
async def get_audit_logs(limit: int = 50):
    """
    Returns immutable audit log records.
    """
    return list(reversed(reservation_service.audit_logs))[:limit]
