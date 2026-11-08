"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createLogisticsRequest } from "../lib/api";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";

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

const steps = [
  { n: 1, label: "Trip", done: true },
  { n: 2, label: "Travellers", done: true },
  { n: 3, label: "Services", done: false },
  { n: 4, label: "Review", done: false },
];

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base outline-none transition placeholder:text-slate-400 focus:border-[#007cc2] focus:ring-4 focus:ring-[#007cc2]/15";

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
    <main>
      {/* Trip summary band */}
      <div className="bg-[#007cc2] px-4 py-6 text-white sm:px-9">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#d0ee27]">
              Team logistics request
            </p>
            <p className="mt-1 text-lg font-bold sm:text-xl">{tripSummary}</p>
          </div>
          <p className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
            {total} traveller{total === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Progress steps */}
      <ol
        aria-label="Request progress"
        className="mx-auto flex max-w-5xl gap-6 overflow-x-auto px-4 py-6 sm:gap-10 sm:px-9"
      >
        {steps.map(({ n, label, done }) => (
          <li
            key={n}
            aria-current={n === 2 ? "step" : undefined}
            className={`flex shrink-0 items-center gap-2.5 text-xs font-bold uppercase tracking-wider ${
              done ? "text-[#007cc2]" : "text-slate-400"
            }`}
          >
            <span
              className={`flex size-7 items-center justify-center rounded-full text-xs ${
                done
                  ? "bg-[#007cc2] text-white"
                  : "border-2 border-slate-300 text-slate-400"
              }`}
            >
              {n}
            </span>
            {label}
          </li>
        ))}
      </ol>

      <form
        onSubmit={submit}
        className="mx-auto max-w-5xl space-y-10 px-4 pb-6 sm:px-9"
      >
        <section>
          <p className="text-sm font-bold uppercase tracking-widest text-[#17633e]">
            Request profile
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Tell us about your team
          </h1>
          <p className="mt-2 text-slate-500">
            We use these details to build the right rooming list, transport plan
            and quote.
          </p>
          <div className="mt-6 grid gap-4 rounded-3xl bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6">
            <label className="text-sm font-bold">
              Team or organisation
              <input
                required
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className={`${inputClass} mt-2 font-normal`}
                placeholder="e.g. Harbour Sharks FC"
              />
            </label>
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
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#17633e]">
                Passenger data
              </p>
              <h2 className="mt-2 text-2xl font-black">Traveller details</h2>
            </div>
            <p className="max-w-sm text-xs text-slate-500">
              Select a class for each traveller to support rooming-list pricing.
            </p>
          </div>
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
                    {index < adults
                      ? `Adult ${index + 1}`
                      : index < adults + children
                        ? `Child ${index - adults + 1}`
                        : `Infant ${index - adults - children + 1}`}
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
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
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
          <Link href="/" className="font-bold text-[#007cc2] hover:underline">
            ← Edit trip
          </Link>
          <button
            type="submit"
            className="rounded-xl bg-[#d0ee27] px-8 py-3.5 font-black uppercase tracking-wide text-[#102331] transition hover:bg-[#c1df1b] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#d0ee27]/60 active:scale-[0.99]"
          >
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
