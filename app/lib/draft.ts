// The request "cart". While signed out it lives in localStorage; once the team
// signs in it is written to the database (and removed from localStorage), so
// it follows the team across devices.
import { getServerDraft, saveServerDraft } from "./api";

export type DraftTrip = {
  from: string;
  destination: string;
  departure: string;
  returnDate: string;
  adults: number;
  children: number;
  infants: number;
};

export type DraftTraveller = {
  firstName: string;
  lastName: string;
  type: string;
  documentNumber: string;
  dietary: string;
  category: "adult" | "child" | "infant";
};

export type Draft = {
  trip: DraftTrip;
  event: string;
  contact: { name: string; email: string; phone: string };
  travellers: DraftTraveller[];
};

const KEY = "sportinuity_request_draft";
// Traveller details can include passport numbers, so a draft left on a shared
// computer expires by itself.
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const text = (value: unknown) => (typeof value === "string" ? value : "");
const count = (value: unknown, min: number, fallback: number) => {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) ? Math.min(Math.max(n, min), 300) : fallback;
};

/** Accepts anything (stored JSON, API payload) and returns a safe Draft or null. */
export function normalizeDraft(raw: unknown): Draft | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const t = (r.trip || {}) as Record<string, unknown>;
  if (!t || typeof t !== "object") return null;
  const contact = (r.contact || {}) as Record<string, unknown>;
  const travellers = Array.isArray(r.travellers) ? r.travellers : [];
  return {
    trip: {
      from: text(t.from),
      destination: text(t.destination),
      departure: text(t.departure),
      returnDate: text(t.returnDate),
      adults: count(t.adults, 1, 1),
      children: count(t.children, 0, 0),
      infants: count(t.infants, 0, 0),
    },
    event: text(r.event),
    contact: {
      name: text(contact.name),
      email: text(contact.email),
      phone: text(contact.phone),
    },
    travellers: travellers.slice(0, 300).map((item) => {
      const x = (item || {}) as Record<string, unknown>;
      const category = x.category === "child" || x.category === "infant" ? x.category : "adult";
      return {
        firstName: text(x.firstName),
        lastName: text(x.lastName),
        type: text(x.type) || "regular",
        documentNumber: text(x.documentNumber),
        dietary: text(x.dietary),
        category,
      };
    }),
  };
}

export function loadLocalDraft(): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!stored || Date.now() - Number(stored.savedAt) > MAX_AGE_MS) {
      if (stored) localStorage.removeItem(KEY);
      return null;
    }
    return normalizeDraft(stored.draft);
  } catch {
    return null;
  }
}

export function saveLocalDraft(draft: Draft) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ savedAt: Date.now(), draft }));
  } catch {
    // Storage full or blocked (private mode): the form still works, it just
    // won't be remembered.
  }
}

export function clearLocalDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export async function loadServerDraft(): Promise<Draft | null> {
  return normalizeDraft((await getServerDraft()).data);
}

/**
 * Moves a draft made while signed out into the team's account. The local
 * copy is only removed once the server has it. Anything made on this device
 * just now wins over an older draft already on the server.
 */
export async function syncLocalDraftToServer(): Promise<void> {
  const local = loadLocalDraft();
  if (!local) return;
  await saveServerDraft(local);
  clearLocalDraft();
}
