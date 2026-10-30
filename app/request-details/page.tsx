"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createLogisticsRequest } from "../lib/api";

type Traveller = {
  firstName: string;
  lastName: string;
  type: string;
  documentNumber: string;
  dietary: string;
  category: "adult" | "child" | "infant";
};
const emptyTraveller = (
  category: Traveller["category"] = "adult",
): Traveller => ({
  firstName: "",
  lastName: "",
  type: "regular",
  documentNumber: "",
  dietary: "",
  category,
});

function RequestDetailsForm() {
  const params = useSearchParams();
  const adults = Number(params.get("adults") || 1);
  const children = Number(params.get("children") || 0);
  const infants = Number(params.get("infants") || 0);
  const total = adults + children + infants;
  const [travellers, setTravellers] = useState(() =>
    Array.from({ length: total }, (_, index) =>
      emptyTraveller(
        index < adults
          ? "adult"
          : index < adults + children
            ? "child"
            : "infant",
      ),
    ),
  );
  const [team, setTeam] = useState("");
  const [event, setEvent] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState("");
  const updateTraveller = (
    index: number,
    field: keyof Traveller,
    value: string,
  ) =>
    setTravellers((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  async function submit(eventObject: FormEvent<HTMLFormElement>) {
    eventObject.preventDefault();
    setStatus("Submitting request…");
    try {
      const result = await createLogisticsRequest({
        team,
        event,
        location: params.get("destination"),
        people: total,
        from: params.get("from"),
        departure: params.get("departure"),
        returnDate: params.get("returnDate"),
        contact,
        travellers,
      });
      setStatus(
        `Request ${result.data?.reference || result.reference || "received"} submitted successfully.`,
      );
    } catch {
      setStatus(
        "We could not submit this request. Please check the details and try again.",
      );
    }
  }
  const tripSummary = useMemo(
    () =>
      `${params.get("from")} → ${params.get("destination")} · ${params.get("departure")} — ${params.get("returnDate")}`,
    [params],
  );
  return (
    <main className="min-h-screen bg-[#f4f7f8] text-[#102331]">
      <header className="border-b bg-white px-5 py-4 sm:px-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-xl font-black text-[#007cc2]">
            Sportinuity
          </Link>
          <Link href="/" className="text-sm font-bold text-[#007cc2]">
            Back to trip search
          </Link>
        </div>
      </header>
      <div className="bg-[#007cc2] px-5 py-5 text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#d0ee27]">
              Team logistics request
            </p>
            <p className="mt-1 font-bold">{tripSummary}</p>
          </div>
          <p className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
            {total} traveller{total === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      <nav className="mx-auto flex max-w-5xl gap-5 overflow-x-auto px-5 py-6 text-xs font-bold uppercase tracking-wider sm:px-10">
        <span className="border-b-2 border-[#007cc2] pb-2 text-[#007cc2]">
          1 Trip
        </span>
        <span className="border-b-2 border-[#007cc2] pb-2 text-[#007cc2]">
          2 Travellers
        </span>
        <span className="pb-2 text-slate-400">3 Services</span>
        <span className="pb-2 text-slate-400">4 Review</span>
      </nav>
      <form
        onSubmit={submit}
        className="mx-auto max-w-5xl space-y-7 px-5 pb-16 sm:px-10"
      >
        <section>
          <p className="font-bold uppercase tracking-widest text-[#17633e]">
            Request profile
          </p>
          <h1 className="mt-2 text-4xl font-black">Tell us about your team</h1>
          <p className="mt-2 text-slate-500">
            We use these details to build the right rooming list, transport plan
            and quote.
          </p>
          <div className="mt-6 grid gap-4 rounded-3xl bg-white p-5 shadow-sm sm:grid-cols-2">
            <label className="text-sm font-bold">
              Team or organisation
              <input
                required
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="mt-2 h-12 w-full rounded-xl border px-3 font-normal outline-none focus:ring-2 focus:ring-[#007cc2]"
                placeholder="e.g. Harbour Sharks FC"
              />
            </label>
            <label className="text-sm font-bold">
              Event or competition
              <input
                required
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="mt-2 h-12 w-full rounded-xl border px-3 font-normal outline-none focus:ring-2 focus:ring-[#007cc2]"
                placeholder="e.g. Regional finals"
              />
            </label>
          </div>
        </section>
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-bold uppercase tracking-widest text-[#17633e]">
                Passenger data
              </p>
              <h2 className="mt-2 text-2xl font-black">Traveller details</h2>
            </div>
            <p className="text-xs text-slate-500">
              Select a class for each traveller to support rooming-list pricing.
            </p>
          </div>
          <div className="mt-4 space-y-4">
            {travellers.map((traveller, index) => (
              <article
                key={index}
                className="rounded-3xl bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-black text-[#007cc2]">
                    {index < adults
                      ? `Adult ${index + 1}`
                      : index < adults + children
                        ? `Child ${index - adults + 1}`
                        : `Infant ${index - adults - children + 1}`}
                  </h3>
                  <select
                    value={traveller.type}
                    onChange={(e) =>
                      updateTraveller(index, "type", e.target.value)
                    }
                    className="rounded-lg border border-[#007cc2] px-3 py-2 text-sm font-bold text-[#007cc2]"
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
                    value={traveller.firstName}
                    onChange={(e) =>
                      updateTraveller(index, "firstName", e.target.value)
                    }
                    placeholder="First name"
                    className="h-11 rounded-xl border px-3"
                  />
                  <input
                    required
                    value={traveller.lastName}
                    onChange={(e) =>
                      updateTraveller(index, "lastName", e.target.value)
                    }
                    placeholder="Last name"
                    className="h-11 rounded-xl border px-3"
                  />
                  <input
                    value={traveller.documentNumber}
                    onChange={(e) =>
                      updateTraveller(index, "documentNumber", e.target.value)
                    }
                    placeholder="Passport / ID number"
                    className="h-11 rounded-xl border px-3"
                  />
                  <input
                    value={traveller.dietary}
                    onChange={(e) =>
                      updateTraveller(index, "dietary", e.target.value)
                    }
                    placeholder="Dietary or access needs"
                    className="h-11 rounded-xl border px-3"
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
        <section>
          <p className="font-bold uppercase tracking-widest text-[#17633e]">
            Primary contact
          </p>
          <h2 className="mt-2 text-2xl font-black">Who should we contact?</h2>
          <div className="mt-4 grid gap-3 rounded-3xl bg-white p-5 shadow-sm sm:grid-cols-3">
            <input
              required
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              placeholder="Full name"
              className="h-11 rounded-xl border px-3"
            />
            <input
              required
              type="email"
              value={contact.email}
              onChange={(e) =>
                setContact({ ...contact, email: e.target.value })
              }
              placeholder="Email address"
              className="h-11 rounded-xl border px-3"
            />
            <input
              required
              value={contact.phone}
              onChange={(e) =>
                setContact({ ...contact, phone: e.target.value })
              }
              placeholder="Phone number"
              className="h-11 rounded-xl border px-3"
            />
          </div>
        </section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="font-bold text-[#007cc2]">
            ← Edit trip
          </Link>
          <button className="rounded-xl bg-[#d0ee27] px-8 py-3 font-black text-[#102331]">
            Submit request
          </button>
        </div>
        {status && (
          <p
            role="status"
            className="rounded-xl bg-white p-4 text-center font-bold text-[#17633e] shadow-sm"
          >
            {status}
          </p>
        )}
      </form>
    </main>
  );
}

export default function RequestDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f4f7f8] p-10 text-[#102331]">
          Loading request details…
        </main>
      }
    >
      <RequestDetailsForm />
    </Suspense>
  );
}
