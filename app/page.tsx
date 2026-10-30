"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  ChevronDown,
  MapPin,
  Menu,
  Users,
  X,
} from "lucide-react";
import DateRangePicker from "./components/date-range-picker";
import TravellerPicker from "./components/traveller-picker";

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [travellersOpen, setTravellersOpen] = useState(false);
  const [dates, setDates] = useState({ departure: "", returnDate: "" });
  const [travellers, setTravellers] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [formError, setFormError] = useState("");
  const router = useRouter();
  const total = travellers.adults + travellers.children + travellers.infants;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!dates.departure || !dates.returnDate) {
      setFormError("Select both departure and return dates to continue.");
      return;
    }
    setFormError("");
    const params = new URLSearchParams({
      from: String(data.get("from")),
      destination: String(data.get("destination")),
      departure: dates.departure,
      returnDate: dates.returnDate,
      adults: String(travellers.adults),
      children: String(travellers.children),
      infants: String(travellers.infants),
    });
    router.push(`/request-details?${params.toString()}`);
  }
  return (
    <main className="min-h-screen bg-[#f4f7f8] text-[#102331]">
      <header className="relative z-30 flex h-20 items-center justify-between bg-white px-5 shadow-sm sm:px-10 lg:px-16">
        <Link href="/" aria-label="Sportinuity home">
          <Image
            src="/st_logo.png"
            alt="Sportinuity"
            width={170}
            height={72}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-9 text-sm font-bold uppercase md:flex">
          <Link className="text-[#007cc2]" href="#book">
            Plan travel
          </Link>
          <Link className="text-[#17633e]" href="/services">
            Sports services
          </Link>
          <Link className="text-slate-600" href="/travel-info">
            Travel info
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/team-login"
            className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold sm:inline-flex"
          >
            Team login
          </Link>
          <Link
            href="/manage-request"
            className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold sm:inline-flex"
          >
            Manage request
          </Link>
          <button
            className="rounded-lg p-2 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav className="absolute right-5 top-16 flex w-56 flex-col gap-4 rounded-2xl bg-white p-5 shadow-xl md:hidden">
            <Link href="#book">Plan travel</Link>
            <Link href="/services">Sports services</Link>
            <Link href="/travel-info">Travel info</Link>
            <Link href="/team-login">Team login</Link>
            <Link href="/team-login">Team login</Link>
            <Link href="/manage-request">Manage request</Link>
          </nav>
        )}
      </header>
      <section
        className="relative min-h-[570px] bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg,rgba(8,25,36,.86),rgba(8,25,36,.22)),url('/sportinuity-hero.png')",
        }}
      >
        <div className="mx-auto max-w-[1360px] px-5 pb-52 pt-28 sm:px-10 lg:px-16">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-[#d0ee27]">
            Sport travel, made simple
          </p>
          <h1 className="mt-4 max-w-2xl text-5xl font-black leading-none tracking-tight text-white sm:text-7xl">
            Move your team.
            <br />
            <span className="text-[#d0ee27]">Make the moment.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/85">
            Flights, accommodation, transport and on-the-ground support for
            teams and delegations travelling to compete.
          </p>
        </div>
        <div
          id="book"
          className="absolute bottom-[-138px] left-1/2 w-[calc(100%-2rem)] max-w-[1320px] -translate-x-1/2 rounded-2xl bg-[#007cc2] p-4 shadow-2xl sm:p-6"
        >
          <div className="mb-5 flex flex-wrap gap-2">
            <button className="rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#007cc2]">
              Request logistics
            </button>
            <Link
              href="/services"
              className="rounded-lg px-5 py-3 text-sm font-bold text-white"
            >
              Explore services
            </Link>
            <Link
              href="/manage-request"
              className="rounded-lg px-5 py-3 text-sm font-bold text-white"
            >
              Manage a request
            </Link>
          </div>
          <form
            onSubmit={submit}
            className="grid gap-3 lg:grid-cols-[1fr_1fr_1.15fr_1fr_auto]"
          >
            <label className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
              <MapPin className="text-[#007cc2]" />
              <span className="flex flex-1 flex-col">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Travelling from
                </span>
                <input
                  required
                  name="from"
                  placeholder="City or airport"
                  className="bg-transparent text-sm font-semibold outline-none"
                />
              </span>
            </label>
            <label className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
              <MapPin className="text-[#007cc2]" />
              <span className="flex flex-1 flex-col">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Destination
                </span>
                <input
                  required
                  name="destination"
                  placeholder="Where are you going?"
                  className="bg-transparent text-sm font-semibold outline-none"
                />
              </span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDatesOpen(!datesOpen)}
                className="flex min-h-[68px] w-full items-center gap-3 rounded-xl bg-white px-4 text-left"
              >
                <CalendarDays className="text-[#007cc2]" />
                <span className="flex-1">
                  <span className="block text-[10px] font-bold uppercase text-slate-400">
                    Travel dates
                  </span>
                  <span className="text-sm font-semibold">
                    {dates.departure
                      ? `${dates.departure} ${dates.returnDate ? `— ${dates.returnDate}` : ""}`
                      : "Select dates"}
                  </span>
                </span>
                <ChevronDown className="text-slate-400" />
              </button>
              {datesOpen && (
                <DateRangePicker
                  value={dates}
                  onChange={setDates}
                  onDone={() => setDatesOpen(false)}
                />
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setTravellersOpen(!travellersOpen)}
                className="flex min-h-[68px] w-full items-center gap-3 rounded-xl bg-white px-4 text-left"
              >
                <Users className="text-[#007cc2]" />
                <span className="flex-1">
                  <span className="block text-[10px] font-bold uppercase text-slate-400">
                    Travellers
                  </span>
                  <span className="text-sm font-semibold">
                    {total} {total === 1 ? "traveller" : "travellers"}
                  </span>
                </span>
                <ChevronDown className="text-slate-400" />
              </button>
              {travellersOpen && (
                <TravellerPicker
                  value={travellers}
                  onChange={setTravellers}
                  onDone={() => setTravellersOpen(false)}
                />
              )}
            </div>
            <input
              type="hidden"
              name="team"
              value="Public Sportinuity request"
            />
            <button className="min-h-[68px] rounded-xl bg-[#d0ee27] px-7 font-black text-[#25370d] hover:bg-[#c1df1b]">
              CONTINUE
            </button>
          </form>
        </div>
      </section>
      <section className="mx-auto max-w-[1320px] px-5 pb-20 pt-48 sm:px-10 lg:px-16">
        <div className="grid gap-5 md:grid-cols-3">
          <Link href="/services" className="rounded-2xl bg-white p-7 shadow-sm">
            <h2 className="text-xl font-black">Travel for teams</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Group flights and coordinated itineraries built around your match
              schedule.
            </p>
            <span className="mt-6 block text-sm font-bold text-[#007cc2]">
              Explore services →
            </span>
          </Link>
          <Link href="/services" className="rounded-2xl bg-white p-7 shadow-sm">
            <h2 className="text-xl font-black">Complete logistics</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Accommodation, airport transfers, meals and local transport in one
              place.
            </p>
            <span className="mt-6 block text-sm font-bold text-[#17633e]">
              View support →
            </span>
          </Link>
          <Link
            href="/travel-info"
            className="rounded-2xl bg-[#102331] p-7 text-white shadow-sm"
          >
            <h2 className="text-xl font-black">Travel with confidence</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Practical guidance for teams travelling across Africa and beyond.
            </p>
            <span className="mt-6 block text-sm font-bold text-[#d0ee27]">
              Travel info →
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
