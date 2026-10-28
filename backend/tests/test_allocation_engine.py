import pytest
import concurrent.futures
from datetime import datetime, timezone, timedelta
from app.models.schemas import (
    AidRequest,
    SupplyOffer,
    UrgencyLevel,
    RequestStatus,
    SupplyStatus,
    GeoLocation,
    AllocationStatus
)
from app.services.allocation_engine import (
    RulesBasedAllocationEngine,
    are_categories_compatible,
    are_units_compatible,
    haversine_distance_km
)
from app.services.duplicate_detector import DuplicateDetector
from app.services.reservation_service import (
    TransactionalReservationService,
    StockReservationError
)

@pytest.fixture
def base_time():
    return datetime(2026, 10, 28, 12, 0, 0, tzinfo=timezone.utc)

@pytest.fixture
def engine(base_time):
    return RulesBasedAllocationEngine(now=base_time)

@pytest.fixture
def reservation_svc():
    return TransactionalReservationService()

# 1. Matching compatible item categories & Rejecting incompatible
def test_category_and_unit_compatibility():
    assert are_categories_compatible("WATER", "Drinking Water") is True
    assert are_categories_compatible("FOOD", "Rations") is True
    assert are_categories_compatible("MEDICINE", "WATER") is False
    assert are_categories_compatible("SHELTER", "CLOTHING") is False

    assert are_units_compatible("L", "liters") is True
    assert are_units_compatible("boxes", "pack") is True
    assert are_units_compatible("kg", "liters") is False

# 2. Prioritising critical requests
def test_prioritises_critical_requests(engine, base_time):
    req_normal = AidRequest(
        request_id="REQ-NORMAL",
        requester_id="USER-1",
        item_category="WATER",
        description="Drinking water for community hall",
        quantity_required=100.0,
        unit="liters",
        urgency=UrgencyLevel.NORMAL,
        created_at=base_time - timedelta(hours=2)
    )
    req_critical = AidRequest(
        request_id="REQ-CRITICAL",
        requester_id="USER-2",
        item_category="WATER",
        description="Urgent water for neonatal care unit",
        quantity_required=100.0,
        unit="liters",
        urgency=UrgencyLevel.CRITICAL,
        created_at=base_time - timedelta(hours=1)
    )
    supply = SupplyOffer(
        supply_id="SUP-1",
        donor_id="DONOR-1",
        item_category="WATER",
        description="Mineral drinking water bottles",
        total_quantity=100.0,
        available_quantity=100.0,
        unit="liters"
    )

    recs, unfulfilled = engine.run_matching([req_normal, req_critical], [supply])

    # Only 100L available, critical request MUST get it
    assert len(recs) == 1
    assert recs[0].request_id == "REQ-CRITICAL"
    assert recs[0].proposed_quantity == 100.0
    assert recs[0].remaining_stock_after == 0.0

    # Normal request should be listed in unfulfilled demands
    assert len(unfulfilled) == 1
    assert unfulfilled[0].request_id == "REQ-NORMAL"
    assert unfulfilled[0].quantity_unfulfilled == 100.0

# 3. Partial allocation when supplies are insufficient
def test_partial_allocation(engine, base_time):
    req = AidRequest(
        request_id="REQ-PARTIAL",
        requester_id="USER-3",
        item_category="FOOD",
        description="Emergency dry ration kits",
        quantity_required=50.0,
        unit="boxes",
        urgency=UrgencyLevel.HIGH,
        created_at=base_time
    )
    supply = SupplyOffer(
        supply_id="SUP-2",
        donor_id="DONOR-2",
        item_category="FOOD",
        description="Ready-to-eat ration boxes",
        total_quantity=20.0,
        available_quantity=20.0,
        unit="boxes"
    )

    recs, unfulfilled = engine.run_matching([req], [supply])
    assert len(recs) == 1
    assert recs[0].proposed_quantity == 20.0
    assert recs[0].is_partial is True
    assert recs[0].outstanding_request_quantity == 30.0

    # 30 boxes must be in unfulfilled
    assert len(unfulfilled) == 1
    assert unfulfilled[0].quantity_unfulfilled == 30.0

# 4. Multiple requests competing for same stock
def test_competing_requests_for_same_stock(engine, base_time):
    req1 = AidRequest(
        request_id="REQ-COMP-1",
        requester_id="USER-A",
        item_category="MEDICINE",
        description="Trauma bandages",
        quantity_required=40.0,
        unit="kits",
        urgency=UrgencyLevel.CRITICAL,
        created_at=base_time - timedelta(minutes=10)
    )
    req2 = AidRequest(
        request_id="REQ-COMP-2",
        requester_id="USER-B",
        item_category="MEDICINE",
        description="Trauma bandages",
        quantity_required=40.0,
        unit="kits",
        urgency=UrgencyLevel.HIGH,
        created_at=base_time - timedelta(minutes=20)
    )
    supply = SupplyOffer(
        supply_id="SUP-COMP-1",
        donor_id="DONOR-X",
        item_category="MEDICINE",
        description="Sterile Trauma kits",
        total_quantity=50.0,
        available_quantity=50.0,
        unit="kits"
    )

    recs, unfulfilled = engine.run_matching([req1, req2], [supply])
    # 50 total. Req 1 (Critical) gets 40, Req 2 (High) gets remaining 10
    assert len(recs) == 2
    assert recs[0].request_id == "REQ-COMP-1"
    assert recs[0].proposed_quantity == 40.0
    assert recs[1].request_id == "REQ-COMP-2"
    assert recs[1].proposed_quantity == 10.0
    assert recs[1].is_partial is True
    # Req 2 has 30 unmet
    assert len(unfulfilled) == 1
    assert unfulfilled[0].request_id == "REQ-COMP-2"
    assert unfulfilled[0].quantity_unfulfilled == 30.0

# 5. Rejecting expired supplies
def test_rejects_expired_supplies(engine, base_time):
    req = AidRequest(
        request_id="REQ-MED",
        requester_id="USER-4",
        item_category="MEDICINE",
        description="First aid antiseptic solutions",
        quantity_required=10.0,
        unit="kits",
        urgency=UrgencyLevel.HIGH,
        needed_by=base_time + timedelta(days=2),
        created_at=base_time
    )
    expired_supply = SupplyOffer(
        supply_id="SUP-EXP",
        donor_id="DONOR-3",
        item_category="MEDICINE",
        description="Expired antiseptic pack",
        total_quantity=20.0,
        available_quantity=20.0,
        unit="kits",
        expiry_at=base_time - timedelta(days=1)
    )

    recs, unfulfilled = engine.run_matching([req], [expired_supply])
    assert len(recs) == 0
    assert len(unfulfilled) == 1

# 6. Handling missing locations gracefully
def test_missing_location_handling(engine, base_time):
    req = AidRequest(
        request_id="REQ-NO-LOC",
        requester_id="USER-5",
        item_category="WATER",
        description="Water without GPS coords",
        quantity_required=50.0,
        unit="liters",
        urgency=UrgencyLevel.NORMAL,
        location=None,
        created_at=base_time
    )
    supply = SupplyOffer(
        supply_id="SUP-LOC",
        donor_id="DONOR-4",
        item_category="WATER",
        description="Water at warehouse",
        total_quantity=100.0,
        available_quantity=100.0,
        unit="liters",
        location=GeoLocation(lat=13.0827, lng=80.2707, address="Central Depot")
    )

    recs, unfulfilled = engine.run_matching([req], [supply])
    assert len(recs) == 1
    assert recs[0].distance_km is None
    assert any("not calculated" in r.lower() or "coordinates omitted" in r.lower() for r in recs[0].priority_reasons)

# 7. Distance calculation when locations present
def test_distance_calculation():
    # Chennai to Tambaram ~ 27 km
    dist = haversine_distance_km(13.0827, 80.2707, 12.9249, 80.1000)
    assert 20.0 < dist < 35.0

# 8. Safe Transactional Reservation & Preventing Negative Inventory
def test_transactional_stock_reservation(reservation_svc):
    reservation_svc.requests_db["R-1"] = {
        "request_id": "R-1",
        "quantity_required": 100.0,
        "quantity_fulfilled": 0.0,
        "status": RequestStatus.SUBMITTED,
        "unit": "liters"
    }
    reservation_svc.supplies_db["S-1"] = {
        "supply_id": "S-1",
        "available_quantity": 80.0,
        "reserved_quantity": 0.0,
        "status": SupplyStatus.AVAILABLE
    }

    # Approve 50L
    alloc, audit = reservation_svc.approve_allocation_transactional(
        idempotency_key="IDEMP-1",
        request_id="R-1",
        supply_id="S-1",
        approved_quantity=50.0,
        coordinator_id="COORD-1"
    )

    assert alloc.approved_quantity == 50.0
    assert alloc.allocation_status == AllocationStatus.RESERVED
    assert reservation_svc.supplies_db["S-1"]["available_quantity"] == 30.0
    assert reservation_svc.supplies_db["S-1"]["reserved_quantity"] == 50.0
    assert reservation_svc.requests_db["R-1"]["quantity_fulfilled"] == 50.0
    assert reservation_svc.requests_db["R-1"]["status"] == RequestStatus.PARTIALLY_ALLOCATED

    # Idempotent retry with same key returns identical record without double deducting
    alloc_retry, _ = reservation_svc.approve_allocation_transactional(
        idempotency_key="IDEMP-1",
        request_id="R-1",
        supply_id="S-1",
        approved_quantity=50.0,
        coordinator_id="COORD-1"
    )
    assert alloc_retry.allocation_id == alloc.allocation_id
    assert reservation_svc.supplies_db["S-1"]["available_quantity"] == 30.0

    # Attempting to allocate more than available 30L raises StockReservationError
    with pytest.raises(StockReservationError) as exc_info:
        reservation_svc.approve_allocation_transactional(
            idempotency_key="IDEMP-2",
            request_id="R-1",
            supply_id="S-1",
            approved_quantity=40.0,
            coordinator_id="COORD-1"
        )
    assert "exceeds available stock" in str(exc_info.value)
    # Available stock must remain strictly non-negative
    assert reservation_svc.supplies_db["S-1"]["available_quantity"] == 30.0

# 9. Concurrent Stock Reservation Simulation
def test_concurrent_stock_reservations_safety(reservation_svc):
    reservation_svc.requests_db["REQ-RACE-1"] = {
        "request_id": "REQ-RACE-1",
        "quantity_required": 50.0,
        "quantity_fulfilled": 0.0,
        "status": RequestStatus.SUBMITTED,
        "unit": "units"
    }
    reservation_svc.requests_db["REQ-RACE-2"] = {
        "request_id": "REQ-RACE-2",
        "quantity_required": 50.0,
        "quantity_fulfilled": 0.0,
        "status": RequestStatus.SUBMITTED,
        "unit": "units"
    }
    reservation_svc.supplies_db["SUP-RACE"] = {
        "supply_id": "SUP-RACE",
        "available_quantity": 60.0,
        "reserved_quantity": 0.0,
        "status": SupplyStatus.AVAILABLE
    }

    # Two concurrent coordinators try to approve 50 units each, but only 60 total exist
    successes = []
    failures = []

    def try_reserve(req_id, key):
        try:
            alloc, _ = reservation_svc.approve_allocation_transactional(
                idempotency_key=key,
                request_id=req_id,
                supply_id="SUP-RACE",
                approved_quantity=50.0,
                coordinator_id="COORD-RACE"
            )
            successes.append(alloc)
        except StockReservationError as e:
            failures.append(e)

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        f1 = executor.submit(try_reserve, "REQ-RACE-1", "KEY-A")
        f2 = executor.submit(try_reserve, "REQ-RACE-2", "KEY-B")
        concurrent.futures.wait([f1, f2])

    # Exactly 1 can succeed for 50, leaving 10 units. The other must fail with INSUFFICIENT_STOCK
    assert len(successes) == 1
    assert len(failures) == 1
    assert failures[0].code == "INSUFFICIENT_STOCK"
    assert reservation_svc.supplies_db["SUP-RACE"]["available_quantity"] == 10.0
    assert reservation_svc.supplies_db["SUP-RACE"]["reserved_quantity"] == 50.0

# 10. Cancellation and Stock Release
def test_cancellation_releases_reserved_stock(reservation_svc):
    reservation_svc.requests_db["R-2"] = {
        "request_id": "R-2",
        "quantity_required": 50.0,
        "quantity_fulfilled": 0.0,
        "status": RequestStatus.SUBMITTED,
        "unit": "boxes"
    }
    reservation_svc.supplies_db["S-2"] = {
        "supply_id": "S-2",
        "available_quantity": 50.0,
        "reserved_quantity": 0.0,
        "status": SupplyStatus.AVAILABLE
    }

    alloc, _ = reservation_svc.approve_allocation_transactional(
        idempotency_key="IDEMP-CANCEL-1",
        request_id="R-2",
        supply_id="S-2",
        approved_quantity=50.0,
        coordinator_id="COORD-1"
    )
    assert reservation_svc.supplies_db["S-2"]["available_quantity"] == 0.0
    assert reservation_svc.supplies_db["S-2"]["reserved_quantity"] == 50.0

    cancelled_alloc = reservation_svc.cancel_allocation(
        allocation_id=alloc.allocation_id,
        actor_id="COORD-1",
        reason="Recipient no longer needs supplies"
    )
    assert cancelled_alloc.allocation_status == AllocationStatus.CANCELLED
    assert reservation_svc.supplies_db["S-2"]["available_quantity"] == 50.0
    assert reservation_svc.supplies_db["S-2"]["reserved_quantity"] == 0.0
    assert reservation_svc.requests_db["R-2"]["quantity_fulfilled"] == 0.0

# 11. Fulfilment: Dispatch and Partial Delivery Confirmation
def test_fulfilment_dispatch_and_confirmation(reservation_svc):
    reservation_svc.requests_db["R-3"] = {
        "request_id": "R-3",
        "quantity_required": 20.0,
        "quantity_fulfilled": 0.0,
        "status": RequestStatus.SUBMITTED,
        "unit": "kits"
    }
    reservation_svc.supplies_db["S-3"] = {
        "supply_id": "S-3",
        "available_quantity": 20.0,
        "reserved_quantity": 0.0,
        "status": SupplyStatus.AVAILABLE
    }

    alloc, _ = reservation_svc.approve_allocation_transactional(
        idempotency_key="IDEMP-DELIV-1",
        request_id="R-3",
        supply_id="S-3",
        approved_quantity=20.0,
        coordinator_id="COORD-1"
    )

    dispatched = reservation_svc.record_dispatch(alloc.allocation_id, 20.0, "DRIVER-1")
    assert dispatched.allocation_status == AllocationStatus.DISPATCHED

    confirmed = reservation_svc.confirm_delivery(
        allocation_id=alloc.allocation_id,
        received_quantity=15.0,
        recipient_id="RECIPIENT-1",
        discrepancy_notes="Damaged box, 5 kits missing"
    )
    assert confirmed.allocation_status == AllocationStatus.DISPUTED
    assert confirmed.received_quantity == 15.0

# 12. Duplicate Request Detection
def test_duplicate_request_detection(base_time):
    detector = DuplicateDetector()
    r1 = AidRequest(
        request_id="REQ-DUP-1",
        requester_id="USER-SAME",
        item_category="WATER",
        description="Flood relief drinking water bottles needed urgently",
        quantity_required=100.0,
        unit="liters",
        urgency=UrgencyLevel.HIGH,
        location=GeoLocation(lat=13.0827, lng=80.2707),
        created_at=base_time
    )
    r2 = AidRequest(
        request_id="REQ-DUP-2",
        requester_id="USER-SAME",
        item_category="WATER",
        description="Flood relief drinking water bottles needed urgently",
        quantity_required=100.0,
        unit="liters",
        urgency=UrgencyLevel.HIGH,
        location=GeoLocation(lat=13.0828, lng=80.2708),
        created_at=base_time + timedelta(minutes=15)
    )

    flags = detector.detect_duplicates([r1, r2])
    assert len(flags) == 1
    assert flags[0].similarity_score >= 0.70
    assert any("exact same requester" in r.lower() for r in flags[0].reasons)
