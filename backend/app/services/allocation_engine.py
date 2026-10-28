import math
import uuid
from datetime import datetime, timezone
from typing import List, Tuple, Optional
from ..models.schemas import (
    AidRequest,
    SupplyOffer,
    AllocationRecommendation,
    UnfulfilledDemand,
    UrgencyLevel,
    RequestStatus,
    SupplyStatus
)

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points in km."""
    R = 6371.0  # Earth's radius in kilometers
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

def normalize_text(text: str) -> str:
    return text.strip().upper().replace("_", " ").replace("-", " ")

def are_categories_compatible(cat1: str, cat2: str) -> bool:
    norm1 = normalize_text(cat1)
    norm2 = normalize_text(cat2)
    if norm1 == norm2:
        return True
    # Synonyms / Sub-categories
    synonyms = {
        "WATER": ["DRINKING WATER", "BOTTLED WATER", "CLEAN WATER"],
        "FOOD": ["RATIONS", "READY TO EAT", "CANNED FOOD", "MEALS", "DRY RATIONS"],
        "MEDICINE": ["MEDICAL SUPPLIES", "FIRST AID", "PHARMACEUTICALS"],
        "SHELTER": ["TENTS", "TARPAULINS", "BEDDING", "BLANKETS"],
        "HYGIENE": ["SANITATION", "CLEANING SUPPLIES", "SOAP"],
        "EQUIPMENT": ["GENERATORS", "BOATS", "RESCUE GEAR", "LIGHTING"]
    }
    for main_cat, syn_list in synonyms.items():
        all_family = [main_cat] + syn_list
        if norm1 in all_family and norm2 in all_family:
            return True
    return False

def are_units_compatible(unit1: str, unit2: str) -> bool:
    norm1 = normalize_text(unit1)
    norm2 = normalize_text(unit2)
    if norm1 == norm2:
        return True
    unit_groups = [
        {"L", "LITER", "LITERS", "LITRE", "LITRES"},
        {"KG", "KILOGRAM", "KILOGRAMS", "KGS"},
        {"BOX", "BOXES", "CARTON", "CARTONS", "PACK", "PACKS", "PACKAGE", "PACKAGES"},
        {"UNIT", "UNITS", "PIECE", "PIECES", "COUNT", "ITEM", "ITEMS"},
        {"KIT", "KITS"}
    ]
    for group in unit_groups:
        if norm1 in group and norm2 in group:
            return True
    return False

class RulesBasedAllocationEngine:
    def __init__(self, now: Optional[datetime] = None):
        self.now = now or datetime.now(timezone.utc)

    def run_matching(
        self,
        requests: List[AidRequest],
        supplies: List[SupplyOffer]
    ) -> Tuple[List[AllocationRecommendation], List[UnfulfilledDemand]]:
        """
        Executes deterministic rules-based allocation:
        1. Filters valid requests and supplies
        2. Sorts requests by:
           - Urgency: CRITICAL (1st) > HIGH (2nd) > NORMAL (3rd)
           - Needed-by deadline: earlier deadlines first
           - Creation timestamp: earlier requests first (FIFO)
        3. For each request, finds eligible supplies:
           - Category and unit compatibility
           - Not expired relative to now or needed_by
           - Available quantity > 0
        4. Ranks eligible supplies:
           - Priority to stock expiring sooner (prevents wastage)
           - Proximity (closer distance first)
        5. Allocates available stock without creating negative inventory
        6. Records unfulfilled demand with explanations
        """
        # Working copies of supply inventory to track safe simulation
        supply_inventory = {}
        for s in supplies:
            # Only consider verified and available offers
            if s.status == SupplyStatus.AVAILABLE and s.available_quantity > 0:
                supply_inventory[s.supply_id] = {
                    "supply": s,
                    "available": float(s.available_quantity)
                }

        # Filter valid open requests
        active_requests = [
            r for r in requests
            if r.status in [RequestStatus.SUBMITTED, RequestStatus.UNDER_REVIEW, RequestStatus.PARTIALLY_ALLOCATED]
            and r.remaining_demand > 0
        ]

        # Urgency rank mapping
        urgency_rank = {
            UrgencyLevel.CRITICAL: 0,
            UrgencyLevel.HIGH: 1,
            UrgencyLevel.NORMAL: 2
        }

        # Sort requests deterministically
        def request_sort_key(r: AidRequest):
            rank = urgency_rank.get(r.urgency, 99)
            # Default far future deadline if none
            deadline_ts = r.needed_by.timestamp() if r.needed_by else float("inf")
            created_ts = r.created_at.timestamp() if r.created_at else 0
            return (rank, deadline_ts, created_ts)

        sorted_requests = sorted(active_requests, key=request_sort_key)

        recommendations: List[AllocationRecommendation] = []
        unfulfilled: List[UnfulfilledDemand] = []

        for req in sorted_requests:
            remaining_req_qty = req.remaining_demand
            matched_for_req = False

            # Candidate supplies for this request
            eligible_supplies = []
            for s_id, s_data in supply_inventory.items():
                s = s_data["supply"]
                avail = s_data["available"]

                if avail <= 0:
                    continue

                # Category compatibility check
                if not are_categories_compatible(req.item_category, s.item_category):
                    continue

                # Unit compatibility check
                if not are_units_compatible(req.unit, s.unit):
                    continue

                # Expiry check: Must not be expired already, and must not expire before needed_by
                if s.expiry_at:
                    s_exp = s.expiry_at.replace(tzinfo=timezone.utc) if s.expiry_at.tzinfo is None else s.expiry_at
                    cur_now = self.now.replace(tzinfo=timezone.utc) if self.now.tzinfo is None else self.now
                    if s_exp <= cur_now:
                        continue
                    if req.needed_by:
                        r_need = req.needed_by.replace(tzinfo=timezone.utc) if req.needed_by.tzinfo is None else req.needed_by
                        if s_exp < r_need:
                            continue

                # Compute distance if locations are available
                dist_km = None
                if (req.location and req.location.lat is not None and req.location.lng is not None and
                    s.location and s.location.lat is not None and s.location.lng is not None):
                    dist_km = haversine_distance_km(
                        req.location.lat, req.location.lng,
                        s.location.lat, s.location.lng
                    )

                eligible_supplies.append({
                    "supply_id": s_id,
                    "supply": s,
                    "available": avail,
                    "distance_km": dist_km
                })

            if not eligible_supplies:
                unfulfilled.append(UnfulfilledDemand(
                    request_id=req.request_id,
                    item_category=req.item_category,
                    quantity_unfulfilled=remaining_req_qty,
                    unit=req.unit,
                    urgency=req.urgency,
                    reason=f"No compatible or unexpired stock available in inventory for category '{req.item_category}' ({req.unit})."
                ))
                continue

            # Rank candidate supplies:
            # 1. Expiring soonest (if shelf-life constrained, prioritize use before expiry)
            # 2. Distance (closer first)
            # 3. Available quantity (can satisfy full need)
            def supply_sort_key(item):
                s = item["supply"]
                expiry_ts = s.expiry_at.timestamp() if s.expiry_at else float("inf")
                dist = item["distance_km"] if item["distance_km"] is not None else 99999.0
                return (expiry_ts, dist)

            ranked_supplies = sorted(eligible_supplies, key=supply_sort_key)

            for item in ranked_supplies:
                if remaining_req_qty <= 0:
                    break

                s_id = item["supply_id"]
                s = item["supply"]
                current_avail = supply_inventory[s_id]["available"]

                if current_avail <= 0:
                    continue

                # Safe allocation calculation
                alloc_qty = min(remaining_req_qty, current_avail)
                is_partial = alloc_qty < remaining_req_qty
                new_avail = current_avail - alloc_qty
                supply_inventory[s_id]["available"] = new_avail
                remaining_req_qty -= alloc_qty
                matched_for_req = True

                # Explainability factors
                reasons = []
                base_score = 0.0

                # Urgency points
                if req.urgency == UrgencyLevel.CRITICAL:
                    base_score += 100.0
                    reasons.append("CRITICAL urgency prioritised (+100 pts)")
                elif req.urgency == UrgencyLevel.HIGH:
                    base_score += 50.0
                    reasons.append("HIGH urgency prioritised (+50 pts)")
                else:
                    base_score += 20.0
                    reasons.append("NORMAL urgency evaluated (+20 pts)")

                # Compatibility
                reasons.append(f"Category '{req.item_category}' compatible with supply '{s.item_category}' ({req.unit})")

                # Deadline
                if req.needed_by:
                    time_diff = (req.needed_by.replace(tzinfo=timezone.utc) - self.now.replace(tzinfo=timezone.utc)).total_seconds() / 3600.0
                    if time_diff <= 24:
                        base_score += 30.0
                        reasons.append(f"Imminent deadline within {max(0, int(time_diff))} hours (+30 pts)")
                    elif time_diff <= 72:
                        base_score += 15.0
                        reasons.append(f"Deadline within {int(time_diff)} hours (+15 pts)")

                # Expiry considerations
                if s.expiry_at:
                    days_to_expiry = (s.expiry_at.replace(tzinfo=timezone.utc) - self.now.replace(tzinfo=timezone.utc)).days
                    if days_to_expiry <= 14:
                        base_score += 25.0
                        reasons.append(f"Stock expires in {days_to_expiry} days; prioritized to prevent spoilage (+25 pts)")
                    else:
                        reasons.append(f"Stock safe for use (expires in {days_to_expiry} days)")

                # Distance
                dist_km = item["distance_km"]
                if dist_km is not None:
                    # Shorter distance bonus
                    dist_bonus = max(0.0, 20.0 - (dist_km * 0.2))
                    base_score += dist_bonus
                    reasons.append(f"Approximate transit distance: {dist_km:.1f} km (+{dist_bonus:.1f} pts)")
                else:
                    reasons.append("Transit distance not calculated (location coordinates omitted or approximate)")

                # Partial vs full
                if is_partial:
                    reasons.append(f"Partial allocation: {alloc_qty} of {req.quantity_required} {req.unit} (insufficient single-source stock)")
                else:
                    reasons.append(f"Full allocation: {alloc_qty} {req.unit} fulfills request")

                recommendation = AllocationRecommendation(
                    recommendation_id=f"rec-{uuid.uuid4().hex[:8]}",
                    request_id=req.request_id,
                    supply_id=s.supply_id,
                    requester_name=req.requester_name or "Community Requester",
                    donor_name=s.donor_name or "Community Donor",
                    item_category=req.item_category,
                    unit=req.unit,
                    requested_quantity=req.quantity_required,
                    proposed_quantity=alloc_qty,
                    request_urgency=req.urgency,
                    distance_km=dist_km,
                    priority_score=round(base_score, 2),
                    priority_reasons=reasons,
                    remaining_stock_after=new_avail,
                    is_partial=is_partial,
                    outstanding_request_quantity=remaining_req_qty,
                    needed_by=req.needed_by,
                    supply_expiry=s.expiry_at
                )
                recommendations.append(recommendation)

            # If request still has unmet demand after exhausting supplies
            if remaining_req_qty > 0:
                unfulfilled.append(UnfulfilledDemand(
                    request_id=req.request_id,
                    item_category=req.item_category,
                    quantity_unfulfilled=remaining_req_qty,
                    unit=req.unit,
                    urgency=req.urgency,
                    reason=f"Partial stock allocated, but {remaining_req_qty} {req.unit} remains unmet due to total stock depletion."
                ))

        return recommendations, unfulfilled
