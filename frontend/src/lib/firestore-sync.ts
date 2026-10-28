import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp
} from "firebase/firestore";
import {
  AidRequest,
  SupplyOffer,
  AllocationRecord,
  AuditLogEntry,
  Organisation
} from "@/types";
import {
  INITIAL_DEMO_REQUESTS,
  INITIAL_DEMO_SUPPLIES,
  INITIAL_DEMO_ALLOCATIONS,
  INITIAL_DEMO_AUDIT_LOGS,
  DEMO_ORGANISATIONS
} from "./demo-data";

export async function seedFirestoreWithDemoData(): Promise<{ success: boolean; message: string }> {
  if (!db) {
    return { success: false, message: "Firestore is not initialized." };
  }

  try {
    // 1. Seed Organisations
    for (const org of DEMO_ORGANISATIONS) {
      await setDoc(doc(db, "organisations", org.organisationId), {
        ...org,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    // 2. Seed Aid Requests
    for (const req of INITIAL_DEMO_REQUESTS) {
      await setDoc(doc(db, "aidRequests", req.request_id), {
        ...req,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    // 3. Seed Supply Offers
    for (const sup of INITIAL_DEMO_SUPPLIES) {
      await setDoc(doc(db, "supplyOffers", sup.supply_id), {
        ...sup,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    // 4. Seed Allocations
    for (const alloc of INITIAL_DEMO_ALLOCATIONS) {
      await setDoc(doc(db, "allocations", alloc.allocation_id), {
        ...alloc,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    // 5. Seed Audit Logs
    for (const log of INITIAL_DEMO_AUDIT_LOGS) {
      await setDoc(doc(db, "auditLogs", log.audit_id), {
        ...log,
        timestamp: Timestamp.now(),
      });
    }

    return {
      success: true,
      message: `Successfully seeded Firestore with ${INITIAL_DEMO_REQUESTS.length} requests, ${INITIAL_DEMO_SUPPLIES.length} supplies, and ${INITIAL_DEMO_ALLOCATIONS.length} allocations!`,
    };
  } catch (error: any) {
    console.error("Error seeding Firestore:", error);
    return {
      success: false,
      message: error.message || "Failed to seed Firestore collections.",
    };
  }
}

export async function fetchRequestsFromFirestore(): Promise<AidRequest[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, "aidRequests"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as AidRequest);
  } catch (e) {
    console.warn("Could not fetch requests from Firestore:", e);
    return [];
  }
}

export async function fetchSuppliesFromFirestore(): Promise<SupplyOffer[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, "supplyOffers"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as SupplyOffer);
  } catch (e) {
    console.warn("Could not fetch supplies from Firestore:", e);
    return [];
  }
}

export async function saveRequestToFirestore(req: AidRequest) {
  if (!db) return;
  try {
    await setDoc(doc(db, "aidRequests", req.request_id), {
      ...req,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (e) {
    console.warn("Firestore write skipped/failed:", e);
  }
}

export async function saveSupplyToFirestore(sup: SupplyOffer) {
  if (!db) return;
  try {
    await setDoc(doc(db, "supplyOffers", sup.supply_id), {
      ...sup,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (e) {
    console.warn("Firestore write skipped/failed:", e);
  }
}

export async function saveAllocationToFirestore(alloc: AllocationRecord) {
  if (!db) return;
  try {
    await setDoc(doc(db, "allocations", alloc.allocation_id), {
      ...alloc,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (e) {
    console.warn("Firestore write skipped/failed:", e);
  }
}

export async function saveAuditLogToFirestore(audit: AuditLogEntry) {
  if (!db) return;
  try {
    await setDoc(doc(db, "auditLogs", audit.audit_id), {
      ...audit,
      timestamp: Timestamp.now(),
    });
  } catch (e) {
    console.warn("Firestore write skipped/failed:", e);
  }
}
