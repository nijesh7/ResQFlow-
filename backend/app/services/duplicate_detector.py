from datetime import timedelta
from typing import List
from difflib import SequenceMatcher
from ..models.schemas import AidRequest, DuplicateFlag
from .allocation_engine import haversine_distance_km, normalize_text

def text_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

class DuplicateDetector:
    """
    Identifies duplicate or highly similar aid requests for human review.
    Does NOT auto-delete or silently drop requests. Flags them transparently.
    """
    def __init__(self, time_window_hours: int = 48, proximity_threshold_km: float = 0.5):
        self.time_window = timedelta(hours=time_window_hours)
        self.proximity_threshold_km = proximity_threshold_km

    def detect_duplicates(self, requests: List[AidRequest]) -> List[DuplicateFlag]:
        flags: List[DuplicateFlag] = []
        n = len(requests)

        for i in range(n):
            for j in range(i + 1, n):
                r1 = requests[i]
                r2 = requests[j]

                # If different categories, unlikely to be duplicate
                if normalize_text(r1.item_category) != normalize_text(r2.item_category):
                    continue

                reasons = []
                score = 0.0

                # Check 1: Same requester
                same_requester = (r1.requester_id == r2.requester_id)
                if same_requester:
                    score += 0.40
                    reasons.append("Submitted by the exact same requester ID")

                # Check 2: Similar description
                desc_sim = text_similarity(r1.description, r2.description)
                if desc_sim > 0.8:
                    score += 0.35
                    reasons.append(f"Request descriptions have {int(desc_sim * 100)}% textual similarity")
                elif desc_sim > 0.5:
                    score += 0.15
                    reasons.append(f"Moderate description similarity ({int(desc_sim * 100)}%)")

                # Check 3: Geographic proximity
                if (r1.location and r1.location.lat is not None and r1.location.lng is not None and
                    r2.location and r2.location.lat is not None and r2.location.lng is not None):
                    dist = haversine_distance_km(
                        r1.location.lat, r1.location.lng,
                        r2.location.lat, r2.location.lng
                    )
                    if dist <= self.proximity_threshold_km:
                        score += 0.25
                        reasons.append(f"Locations are virtually identical ({dist * 1000:.0f} meters apart)")

                # Check 4: Created in close time window
                if r1.created_at and r2.created_at:
                    time_diff = abs(r1.created_at - r2.created_at)
                    if time_diff <= self.time_window:
                        score += 0.15
                        hours_apart = time_diff.total_seconds() / 3600.0
                        reasons.append(f"Created within {hours_apart:.1f} hours of each other")

                # Check 5: Identical unit and similar quantity
                if r1.unit.lower() == r2.unit.lower():
                    qty_ratio = min(r1.quantity_required, r2.quantity_required) / max(r1.quantity_required, r2.quantity_required)
                    if qty_ratio > 0.85:
                        score += 0.15
                        reasons.append(f"Quantities are nearly identical ({r1.quantity_required} vs {r2.quantity_required} {r1.unit})")

                # If cumulative score indicates high similarity, flag for coordinator review
                if score >= 0.65:
                    flags.append(DuplicateFlag(
                        primary_request_id=r1.request_id,
                        duplicate_request_id=r2.request_id,
                        similarity_score=round(min(1.0, score), 2),
                        reasons=reasons
                    ))

        return flags
