"use client";

import {
  FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { ApiError, createTeamRequest, saveServerDraft } from "../lib/api";
import {
  clearLocalDraft,
  loadLocalDraft,
  loadServerDraft,
  saveLocalDraft,
  syncLocalDraftToServer,
  type Draft,
  type DraftTrip,
  type DraftTraveller,
} from "../lib/draft";
import { formatDateRange } from "../lib/format";
import { useTeamSession } from "../lib/use-team-session";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";

type Step = "details" | "review" | "done";

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base outline-none transition placeholder:text-slate-400 focus:border-[#007cc2] focus:ring-4 focus:ring-[#007cc2]/15";

const emptyTraveller = (
  category: DraftTraveller["category"] = "adult",
): DraftTraveller => ({
  firstName: "",
  lastName: "",
  type: "regular",
  documentNumber: "",
  dietary: "",
  category,
});

const categoryAt = (trip: DraftTrip, index: number) =>
  index < trip.adults
    ? "adult"
    : index < trip.adults + trip.children
      ? "child"
      : "infant";

/** Keeps what was typed, resizing the list to match the trip's headcount. */
function buildTravellers(
  trip: DraftTrip,
  existing: DraftTraveller[] = [],
): DraftTraveller[] {
  const total = trip.adults + trip.children + trip.infants;
  return Array.from({ length: total }, (_, index) => ({
    ...(existing[index] ?? emptyTraveller()),
    category: categoryAt(trip, index),
  }));
}

function tripFromParams(params: URLSearchParams): DraftTrip | null {
  const destination = params.get("destination");
  if (!destination) return null;
  const num = (key: string, min: number) => {
    const n = Math.floor(Number(params.get(key)));
    return Number.isFinite(n) ? Math.min(Math.max(n, min), 300) : min;
  };
  return {
    from: params.get("from") || "",
    destination,
    departure: params.get("departure") || "",
    returnDate: params.get("returnDate") || "",
    adults: num("adults", 1),
    children: num("children", 0),
    infants: num("infants", 0),
  };
}

const sameTrip = (a: DraftTrip, b: DraftTrip) =>
  a.from === b.from &&
  a.destination === b.destination &&
  a.departure === b.departure &&
  a.returnDate === b.returnDate &&
  a.adults === b.adults &&
  a.children === b.children &&
  a.infants === b.infants;

function tripQuery(trip: DraftTrip) {
  return new URLSearchParams({
    from: trip.from,
    destination: trip.destination,
    departure: trip.departure,
    returnDate: trip.returnDate,
    adults: String(trip.adults),
    children: String(trip.children),
    infants: String(trip.infants),
  }).toString();
}

function isComplete(draft: Draft) {
  return (
    draft.event.trim() !== "" &&
    draft.contact.name.trim() !== "" &&
    draft.contact.email.trim() !== "" &&
    draft.contact.phone.trim() !== "" &&
    draft.travellers.length > 0 &&
    draft.travellers.every((t) => t.firstName.trim() && t.lastName.trim())
  );
}

function RequestDetailsForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { ready, user } = useTeamSession();

  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState<Step>("details");
  const [trip, setTrip] = useState<DraftTrip | null>(null);
  const [event, setEvent] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [travellers, setTravellers] = useState<DraftTraveller[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState("");

  const lastSaved = useRef("");
  const saveChain = useRef<Promise<unknown>>(Promise.resolve());
  const submitted = useRef(false);
  const loggedIn = !!user;

  // ---- load: URL trip + saved draft ---------------------------------------
  useEffect(() => {
    if (!ready || hydrated) return;
    let cancelled = false;
    (async () => {
      let draft: Draft | null = null;
      if (user) {
        try {
          await syncLocalDraftToServer();
        } catch {
          /* keep going with whatever the server has */
        }
        try {
          draft = await loadServerDraft();
        } catch {
          draft = loadLocalDraft();
        }
      } else {
        draft = loadLocalDraft();
      }
      if (cancelled) return;

      const urlTrip = tripFromParams(params);
      let nextTrip: DraftTrip | null = null;
      let next: Draft | null = null;
      if (draft && (!urlTrip || sameTrip(urlTrip, draft.trip))) {
        nextTrip = draft.trip;
        next = {
          ...draft,
          travellers: buildTravellers(draft.trip, draft.travellers),
        };
      } else if (urlTrip) {
        nextTrip = urlTrip;
        next = {
          trip: urlTrip,
          event: "",
          contact: draft?.contact ?? { name: "", email: "", phone: "" },
          travellers: buildTravellers(urlTrip),
        };
      }

      if (next && nextTrip) {
        if (user) {
          next.contact = {
            name: next.contact.name || user.name,
            email: next.contact.email || user.email,
            phone: next.contact.phone,
          };
        }
        setTrip(nextTrip);
        setEvent(next.event);
        setContact(next.contact);
        setTravellers(next.travellers);
        lastSaved.current = JSON.stringify(next);
        if (params.get("step") === "review" && user && isComplete(next)) {
          setStep("review");
        }
      }
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, hydrated, user, params]);

  // ---- autosave (the "cart") -----------------------------------------------
  const currentDraft = useCallback(
    (): Draft | null => (trip ? { trip, event, contact, travellers } : null),
    [trip, event, contact, travellers],
  );

  useEffect(() => {
    if (!hydrated || step === "done" || submitted.current) return;
    const draft = currentDraft();
    if (!draft) return;
    const serialized = JSON.stringify(draft);
    if (serialized === lastSaved.current) return;
    const timer = setTimeout(() => {
      lastSaved.current = serialized;
      if (loggedIn) {
        saveChain.current = saveChain.current
          .catch(() => undefined)
          .then(() => saveServerDraft(draft))
          .catch(() => {
            // Fall back to this browser so nothing typed is lost.
            saveLocalDraft(draft);
          });
      } else {
        saveLocalDraft(draft);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [hydrated, step, loggedIn, currentDraft]);

  const updateTraveller = (
    index: number,
    field: keyof DraftTraveller,
    value: string,
  ) =>
    setTravellers((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );

  // ---- continue to review ---------------------------------------------------
  function toReview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const draft = currentDraft();
    if (!draft) return;
    setError("");
    if (!loggedIn) {
      // Keep the "cart" in this browser, then ask the team to sign in.
      saveLocalDraft(draft);
      const back = `/request-details?${tripQuery(draft.trip)}&step=review`;
      router.push(
        `/team-login?reason=checkout&next=${encodeURIComponent(back)}`,
      );
      return;
    }
    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---- submit -----------------------------------------------------------------
  async function submit() {
    const draft = currentDraft();
    if (!draft || busy) return;
    setBusy(true);
    setError("");
    try {
      await saveChain.current.catch(() => undefined);
      const result = await createTeamRequest({
        event: draft.event.trim(),
        location: draft.trip.destination,
        from: draft.trip.from || undefined,
        departure: draft.trip.departure || undefined,
        returnDate: draft.trip.returnDate || undefined,
        contact: draft.contact,
        travellers: draft.travellers,
      });
      submitted.current = true;
      clearLocalDraft();
      setReference(result.reference);
      setStep("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        saveLocalDraft(draft);
        const back = `/request-details?${tripQuery(draft.trip)}&step=review`;
        router.push(
          `/team-login?reason=checkout&next=${encodeURIComponent(back)}`,
        );
        return;
      }
      setError(
        err instanceof Error
          ? err.message
          : "We could not submit this request. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  // ---- render -----------------------------------------------------------------
  if (!ready || !hydrated) {
    return (
      <main className="min-h-[50vh] p-10" aria-busy="true">
        Loading request details…
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-3xl font-black">Start with your trip</h1>
        <p className="mt-3 text-slate-500">
          Tell us where and when your team is travelling, then come back here to
          add the travellers.
        </p>
        <Link
          href="/#book"
          className="mt-6 inline-block rounded-xl bg-[#007cc2] px-6 py-3 font-bold text-white hover:bg-[#006ba8]"
        >
          Plan a trip
        </Link>
      </main>
    );
  }

  const total = trip.adults + trip.children + trip.infants;
  const tripSummary = `${trip.from ? `${trip.from} → ` : ""}${trip.destination} · ${formatDateRange(trip.departure, trip.returnDate)}`;
  const steps = [
    { n: 1, label: "Trip", done: true },
    { n: 2, label: "Travellers", done: step !== "details" },
    { n: 3, label: "Review", done: step === "done" },
  ];
  const currentStep = step === "details" ? 2 : step === "review" ? 3 : 4;

  return (
    <main>
      <div className="bg-[#007cc2] px-4 py-6 text-white sm:px-9">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#d0ee27]">
              {user ? user.teamName : "Team logistics request"}
            </p>
            <p className="mt-1 text-lg font-bold sm:text-xl">{tripSummary}</p>
          </div>
          <p className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
            {total} traveller{total === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <ol
        aria-label="Request progress"
        className="mx-auto flex max-w-5xl gap-6 overflow-x-auto px-4 py-6 sm:gap-10 sm:px-9"
      >
        {steps.map(({ n, label, done }) => (
          <li
            key={n}
            aria-current={n === currentStep ? "step" : undefined}
            className={`flex shrink-0 items-center gap-2.5 text-xs font-bold uppercase tracking-wider ${
              done || n === currentStep ? "text-[#007cc2]" : "text-slate-400"
            }`}
          >
            <span
              className={`flex size-7 items-center justify-center rounded-full text-xs ${
                done
                  ? "bg-[#007cc2] text-white"
                  : n === currentStep
                    ? "border-2 border-[#007cc2] text-[#007cc2]"
                    : "border-2 border-slate-300 text-slate-400"
              }`}
            >
              {n}
            </span>
            {label}
          </li>
        ))}
      </ol>

      {step === "details" && (
        <form
          onSubmit={toReview}
          className="mx-auto max-w-5xl space-y-10 px-4 pb-6 sm:px-9"
        >
          <section>
            <p className="text-sm font-bold uppercase tracking-widest text-[#17633e]">
              Request profile
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Who is travelling?
            </h1>
            <p className="mt-2 text-slate-500">
              {loggedIn
                ? "Your progress is saved to your team account as you type."
                : "Your progress is saved in this browser. You'll sign in before you review and submit."}
            </p>
            <div className="mt-6 grid gap-4 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
              <label className="text-sm font-bold">
                Event or competition
                <input
                  required
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  className={`${inputClass} mt-2 font-normal`}
                  placeholder="e.g. Regional finals"
                />
              </label>
            </div>
          </section>

          <section>
            <p className="text-sm font-bold uppercase tracking-widest text-[#17633e]">
              Passenger data
            </p>
            <h2 className="mt-2 text-2xl font-black">Traveller details</h2>
            <p className="mt-1 text-xs text-slate-500">
              Select a class for each traveller to support rooming-list pricing.
            </p>
            <div className="mt-4 space-y-4">
              {travellers.map((traveller, index) => (
                <article
                  key={index}
                  className="rounded-3xl bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="flex items-center gap-3 font-black text-[#007cc2]">
                      <span className="flex size-8 items-center justify-center rounded-full bg-[#e8f4fb] text-sm">
                        {index + 1}
                      </span>
                      {traveller.category === "adult"
                        ? `Adult ${index + 1}`
                        : traveller.category === "child"
                          ? `Child ${index - trip.adults + 1}`
                          : `Infant ${index - trip.adults - trip.children + 1}`}
                    </h3>
                    <select
                      aria-label="Traveller class"
                      value={traveller.type}
                      onChange={(e) =>
                        updateTraveller(index, "type", e.target.value)
                      }
                      className="rounded-lg border border-[#007cc2] bg-white px-3 py-2 text-sm font-bold text-[#007cc2] outline-none transition focus:ring-4 focus:ring-[#007cc2]/15"
                    >
                      <option value="regular">Regular</option>
                      <option value="vip">VIP</option>
                      <option value="vvip">VVIP</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <input
                      required
                      aria-label="First name"
                      autoComplete="off"
                      value={traveller.firstName}
                      onChange={(e) =>
                        updateTraveller(index, "firstName", e.target.value)
                      }
                      placeholder="First name"
                      className={inputClass}
                    />
                    <input
                      required
                      aria-label="Last name"
                      autoComplete="off"
                      value={traveller.lastName}
                      onChange={(e) =>
                        updateTraveller(index, "lastName", e.target.value)
                      }
                      placeholder="Last name"
                      className={inputClass}
                    />
                    <input
                      aria-label="Passport or ID number"
                      autoComplete="off"
                      value={traveller.documentNumber}
                      onChange={(e) =>
                        updateTraveller(index, "documentNumber", e.target.value)
                      }
                      placeholder="Passport / ID number"
                      className={inputClass}
                    />
                    <input
                      aria-label="Dietary or access needs"
                      autoComplete="off"
                      value={traveller.dietary}
                      onChange={(e) =>
                        updateTraveller(index, "dietary", e.target.value)
                      }
                      placeholder="Dietary or access needs"
                      className={inputClass}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <p className="text-sm font-bold uppercase tracking-widest text-[#17633e]">
              Primary contact
            </p>
            <h2 className="mt-2 text-2xl font-black">Who should we contact?</h2>
            <div className="mt-4 grid gap-3 rounded-3xl bg-white p-5 shadow-sm sm:grid-cols-3 sm:p-6">
              <input
                required
                aria-label="Full name"
                autoComplete="name"
                value={contact.name}
                onChange={(e) =>
                  setContact({ ...contact, name: e.target.value })
                }
                placeholder="Full name"
                className={inputClass}
              />
              <input
                required
                type="email"
                aria-label="Email address"
                autoComplete="email"
                inputMode="email"
                value={contact.email}
                onChange={(e) =>
                  setContact({ ...contact, email: e.target.value })
                }
                placeholder="Email address"
                className={inputClass}
              />
              <input
                required
                aria-label="Phone number"
                autoComplete="tel"
                inputMode="tel"
                value={contact.phone}
                onChange={(e) =>
                  setContact({ ...contact, phone: e.target.value })
                }
                placeholder="Phone number"
                className={inputClass}
              />
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/#book"
              className="font-bold text-[#007cc2] hover:underline"
            >
              ← Edit trip
            </Link>
            <button
              type="submit"
              className="rounded-xl bg-[#d0ee27] px-8 py-3.5 font-black uppercase tracking-wide text-[#102331] transition hover:bg-[#c1df1b] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#d0ee27]/60 active:scale-[0.99]"
            >
              {loggedIn ? "Continue to review" : "Sign in to review"}
            </button>
          </div>
        </form>
      )}

      {step === "review" && (
        <div className="mx-auto max-w-5xl space-y-6 px-4 pb-6 sm:px-9">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#17633e]">
              Review
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Check your request
            </h1>
          </div>

          <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              {[
                ["Team", user?.teamName],
                ["Event", event],
                ["From", trip.from || "—"],
                ["Destination", trip.destination],
                ["Dates", formatDateRange(trip.departure, trip.returnDate)],
                ["Travellers", String(total)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="font-bold text-slate-500">{label}</dt>
                  <dd className="mt-0.5 font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-black">Travellers</h2>
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {travellers.map((t, i) => (
                <li
                  key={i}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                >
                  <span className="font-semibold">
                    {i + 1}. {t.firstName} {t.lastName}
                  </span>
                  <span className="text-slate-500">
                    {t.category} · {t.type}
                    {t.documentNumber ? ` · ${t.documentNumber}` : ""}
                    {t.dietary ? ` · ${t.dietary}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-black">Contact</h2>
            <p className="mt-2 text-sm">
              {contact.name} · {contact.email} · {contact.phone}
            </p>
          </section>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setStep("details")}
              disabled={busy}
              className="font-bold text-[#007cc2] hover:underline disabled:opacity-60"
            >
              ← Edit details
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="rounded-xl bg-[#d0ee27] px-8 py-3.5 font-black uppercase tracking-wide text-[#102331] transition hover:bg-[#c1df1b] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#d0ee27]/60 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="mx-auto max-w-xl px-4 pb-10 text-center sm:px-9">
          <CheckCircle2 className="mx-auto size-14 text-[#17633e]" />
          <h1 className="mt-4 text-3xl font-black">Request submitted</h1>
          <p className="mt-2 text-slate-600">
            Your reference is{" "}
            <span className="font-black text-[#102331]">{reference}</span>. We
            sent a confirmation to your email, and we&apos;ll be in touch soon.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={`/manage-request/${encodeURIComponent(reference)}`}
              className="rounded-xl bg-[#007cc2] px-6 py-3 font-bold text-white hover:bg-[#006ba8]"
            >
              View request
            </Link>
            <Link
              href="/manage-request"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold hover:bg-slate-50"
            >
              All my requests
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

export default function RequestDetailsPage() {
  return (
    <div className="min-h-screen bg-[#f4f7f8] text-[#102331]">
      <SiteHeader />
      <Suspense
        fallback={
          <main className="min-h-[50vh] p-10 text-[#102331]">
            Loading request details…
          </main>
        }
      >
        <RequestDetailsForm />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
