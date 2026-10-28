import threading
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Tuple, Optional
from ..models.schemas import (
    AllocationRecord,
    AllocationStatus,
    RequestStatus,
    SupplyStatus,
    AuditLogEntry
)

class StockReservationError(Exception):
    def __init__(self, message: str, code: str = "RESERVATION_FAILED"):
        super().__init__(message)
        self.code = code
        self.message = message

class TransactionalReservationService:
    """
    Server-side transactional reservation manager.
    Enforces atomic stock reservation, concurrency locking, idempotency guarantees,
    inventory non-negativity, and audit trail logging.
    """
    def __init__(self):
        self._lock = threading.Lock()
        self._idempotency_cache: Dict[str, AllocationRecord] = {}
        # In-memory stores for standalone operation, unit tests, and local resilience
        self.requests_db: Dict[str, Dict[str, Any]] = {}
        self.supplies_db: Dict[str, Dict[str, Any]] = {}
        self.allocations_db: Dict[str, AllocationRecord] = {}
        self.audit_logs: list[AuditLogEntry] = []

    def approve_allocation_transactional(
        self,
        idempotency_key: str,
        request_id: str,
        supply_id: str,
        approved_quantity: float,
        coordinator_id: str,
        override_reason: Optional[str] = None
    ) -> Tuple[AllocationRecord, AuditLogEntry]:
        """
        Executes safe atomic reservation:
        1. Checks idempotency key to prevent double allocation on network retry
        2. Acquires transaction lock
        3. Revalidates current request state and remaining demand
        4. Revalidates available supply stock
        5. Atomically deducts available quantity, increments reserved quantity
        6. Updates request status and allocation record
        7. Writes audit log entry
        """
        with self._lock:
            # 1. Idempotency Check
            if idempotency_key in self._idempotency_cache:
                existing_record = self._idempotency_cache[idempotency_key]
                # Return cached result safely
                return existing_record, None

            # 2. Validate Request
            if request_id not in self.requests_db:
                raise StockReservationError(f"Request '{request_id}' not found", "REQUEST_NOT_FOUND")

            req = self.requests_db[request_id]
            req_status = req.get("status", RequestStatus.SUBMITTED)
            if req_status in [RequestStatus.FULFILLED, RequestStatus.CANCELLED, RequestStatus.REJECTED]:
                raise StockReservationError(f"Request is already {req_status}", "INVALID_REQUEST_STATUS")

            qty_required = float(req["quantity_required"])
            qty_fulfilled = float(req.get("quantity_fulfilled", 0.0))
            remaining_needed = max(0.0, qty_required - qty_fulfilled)

            if remaining_needed <= 0:
                raise StockReservationError("Request is already fully fulfilled", "DEMAND_EXHAUSTED")

            if approved_quantity > remaining_needed:
                # Cap or reject
                approved_quantity = remaining_needed

            # 3. Validate Supply Stock
            if supply_id not in self.supplies_db:
                raise StockReservationError(f"Supply '{supply_id}' not found", "SUPPLY_NOT_FOUND")

            supply = self.supplies_db[supply_id]
            supply_status = supply.get("status", SupplyStatus.AVAILABLE)
            if supply_status != SupplyStatus.AVAILABLE:
                raise StockReservationError(f"Supply is not available ({supply_status})", "SUPPLY_UNAVAILABLE")

            avail_qty = float(supply.get("available_quantity", 0.0))
            if avail_qty <= 0:
                raise StockReservationError("No available stock remaining for this supply", "INSUFFICIENT_STOCK")

            # Check if available quantity is sufficient
            if approved_quantity > avail_qty:
                raise StockReservationError(
                    f"Requested {approved_quantity} units exceeds available stock of {avail_qty} units",
                    "INSUFFICIENT_STOCK"
                )

            # 4. Atomic Inventory State Transition
            prev_supply_state = {
                "available_quantity": avail_qty,
                "reserved_quantity": float(supply.get("reserved_quantity", 0.0))
            }

            supply["available_quantity"] = round(avail_qty - approved_quantity, 3)
            supply["reserved_quantity"] = round(float(supply.get("reserved_quantity", 0.0)) + approved_quantity, 3)
            if supply["available_quantity"] == 0:
                supply["status"] = SupplyStatus.DEPLETED

            new_supply_state = {
                "available_quantity": supply["available_quantity"],
                "reserved_quantity": supply["reserved_quantity"]
            }

            # Update Request State
            new_qty_fulfilled = round(qty_fulfilled + approved_quantity, 3)
            req["quantity_fulfilled"] = new_qty_fulfilled
            if new_qty_fulfilled >= qty_required:
                req["status"] = RequestStatus.FULLY_ALLOCATED
            else:
                req["status"] = RequestStatus.PARTIALLY_ALLOCATED

            # 5. Create Allocation Record
            allocation_id = f"alloc-{uuid.uuid4().hex[:10]}"
            allocation = AllocationRecord(
                allocation_id=allocation_id,
                request_id=request_id,
                supply_id=supply_id,
                approved_quantity=approved_quantity,
                unit=req.get("unit", "units"),
                allocation_status=AllocationStatus.RESERVED,
                priority_reasons=["Coordinator verified and approved"],
                approved_by=coordinator_id,
                override_reason=override_reason,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )

            self.allocations_db[allocation_id] = allocation
            self._idempotency_cache[idempotency_key] = allocation

            # 6. Audit Trail
            audit = AuditLogEntry(
                audit_id=f"audit-{uuid.uuid4().hex[:8]}",
                actor_id=coordinator_id,
                action="APPROVE_AND_RESERVE_STOCK",
                entity_type="ALLOCATION",
                entity_id=allocation_id,
                previous_state=prev_supply_state,
                new_state=new_supply_state,
                reason=override_reason or "Stock reserved within allocation limits",
                timestamp=datetime.now(timezone.utc)
            )
            self.audit_logs.append(audit)

            return allocation, audit

    def cancel_allocation(self, allocation_id: str, actor_id: str, reason: str) -> AllocationRecord:
        """
        Releases reserved stock and reverts request allocation upon cancellation.
        """
        with self._lock:
            if allocation_id not in self.allocations_db:
                raise StockReservationError(f"Allocation '{allocation_id}' not found", "ALLOCATION_NOT_FOUND")

            alloc = self.allocations_db[allocation_id]
            if alloc.allocation_status in [AllocationStatus.CANCELLED, AllocationStatus.RECEIVED]:
                raise StockReservationError(f"Cannot cancel allocation in state '{alloc.allocation_status}'", "INVALID_STATE")

            # Release stock back to supply
            supply_id = alloc.supply_id
            if supply_id in self.supplies_db:
                s = self.supplies_db[supply_id]
                s["reserved_quantity"] = max(0.0, round(float(s["reserved_quantity"]) - alloc.approved_quantity, 3))
                s["available_quantity"] = round(float(s["available_quantity"]) + alloc.approved_quantity, 3)
                if s["status"] == SupplyStatus.DEPLETED and s["available_quantity"] > 0:
                    s["status"] = SupplyStatus.AVAILABLE

            # Revert request fulfilled quantity
            req_id = alloc.request_id
            if req_id in self.requests_db:
                r = self.requests_db[req_id]
                r["quantity_fulfilled"] = max(0.0, round(float(r.get("quantity_fulfilled", 0.0)) - alloc.approved_quantity, 3))
                if r["quantity_fulfilled"] == 0:
                    r["status"] = RequestStatus.SUBMITTED
                else:
                    r["status"] = RequestStatus.PARTIALLY_ALLOCATED

            alloc.allocation_status = AllocationStatus.CANCELLED
            alloc.updated_at = datetime.now(timezone.utc)

            # Audit
            audit = AuditLogEntry(
                audit_id=f"audit-{uuid.uuid4().hex[:8]}",
                actor_id=actor_id,
                action="CANCEL_ALLOCATION_AND_RELEASE_STOCK",
                entity_type="ALLOCATION",
                entity_id=allocation_id,
                reason=reason,
                timestamp=datetime.now(timezone.utc)
            )
            self.audit_logs.append(audit)

            return alloc

    def record_dispatch(self, allocation_id: str, dispatched_quantity: float, actor_id: str) -> AllocationRecord:
        with self._lock:
            if allocation_id not in self.allocations_db:
                raise StockReservationError(f"Allocation '{allocation_id}' not found", "NOT_FOUND")

            alloc = self.allocations_db[allocation_id]
            if alloc.allocation_status != AllocationStatus.RESERVED:
                raise StockReservationError(f"Cannot dispatch allocation in '{alloc.allocation_status}' status", "INVALID_STATE")

            if dispatched_quantity > alloc.approved_quantity:
                raise StockReservationError(f"Dispatched quantity cannot exceed approved quantity {alloc.approved_quantity}", "DISPATCH_EXCEEDED")

            alloc.dispatched_quantity = dispatched_quantity
            alloc.allocation_status = AllocationStatus.DISPATCHED
            alloc.updated_at = datetime.now(timezone.utc)

            audit = AuditLogEntry(
                audit_id=f"audit-{uuid.uuid4().hex[:8]}",
                actor_id=actor_id,
                action="DISPATCH_AID_SUPPLIES",
                entity_type="ALLOCATION",
                entity_id=allocation_id,
                new_state={"dispatched_quantity": dispatched_quantity, "status": "Dispatched"},
                timestamp=datetime.now(timezone.utc)
            )
            self.audit_logs.append(audit)
            return alloc

    def confirm_delivery(
        self,
        allocation_id: str,
        received_quantity: float,
        recipient_id: str,
        discrepancy_notes: Optional[str] = None
    ) -> AllocationRecord:
        with self._lock:
            if allocation_id not in self.allocations_db:
                raise StockReservationError(f"Allocation '{allocation_id}' not found", "NOT_FOUND")

            alloc = self.allocations_db[allocation_id]
            if alloc.allocation_status not in [AllocationStatus.DISPATCHED, AllocationStatus.PARTIALLY_RECEIVED]:
                raise StockReservationError(f"Cannot confirm delivery for allocation in '{alloc.allocation_status}' status", "INVALID_STATE")

            alloc.received_quantity = round(alloc.received_quantity + received_quantity, 3)

            # Check if partial or disputed
            if discrepancy_notes and alloc.received_quantity < alloc.dispatched_quantity:
                alloc.allocation_status = AllocationStatus.DISPUTED
            elif alloc.received_quantity >= alloc.approved_quantity:
                alloc.allocation_status = AllocationStatus.RECEIVED
                # Update request status to FULFILLED if total demand reached
                req_id = alloc.request_id
                if req_id in self.requests_db:
                    r = self.requests_db[req_id]
                    if float(r.get("quantity_fulfilled", 0.0)) >= float(r.get("quantity_required", 0.0)):
                        r["status"] = RequestStatus.FULFILLED
            else:
                alloc.allocation_status = AllocationStatus.PARTIALLY_RECEIVED

            alloc.updated_at = datetime.now(timezone.utc)

            audit = AuditLogEntry(
                audit_id=f"audit-{uuid.uuid4().hex[:8]}",
                actor_id=recipient_id,
                action="CONFIRM_DELIVERY_RECEIPT",
                entity_type="ALLOCATION",
                entity_id=allocation_id,
                new_state={"received_quantity": alloc.received_quantity, "status": alloc.allocation_status},
                reason=discrepancy_notes,
                timestamp=datetime.now(timezone.utc)
            )
            self.audit_logs.append(audit)
            return alloc

# Singleton service instance
reservation_service = TransactionalReservationService()
