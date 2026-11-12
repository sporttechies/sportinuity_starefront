"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  MapPin,
  Plane,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import DateRangePicker from "./components/date-range-picker";
import TravellerPicker from "./components/traveller-picker";
import SiteHeader from "./components/site-header";
import SiteFooter from "./components/site-footer";
import HeroSlider, { type HeroSlide } from "./components/hero-slider";

const heroSlides: HeroSlide[] = [
  {
    image: "/hero/1.png",
    layout: "left",
    kicker: "Sport travel, made simple",
    headline: "Move your team.",
    highlight: "Make the moment.",
    description:
      "Flights, accommodation, transport and on-the-ground support for teams and delegations travelling to compete.",
  },
  {
    image: "/hero/2.png",
    layout: "right",
    kicker: "Team flights",
    headline: "Fly together.",
    highlight: "Land ready to compete.",
    description:
      "Group bookings, seats that keep your squad together and room for kit and equipment.",
  },
  // {
  //   image: "/hero/3.png",
  //   layout: "full",
  //   // kicker: "Wherever the game is",
  //   // headline: "From the first booking",
  //   // highlight: "to the final whistle.",
  //   // description:
  //   //   "One request, one team, and every part of your journey taken care of.",
  // },
  {
    image: "/hero/4.png",
    layout: "left",
    kicker: "Accommodation",
    headline: "Rest well.",
    highlight: "Perform better.",
    description:
      "Team-friendly stays close to the venue, with the space and meals athletes need to recover.",
  },
  {
    image: "/hero/5.png",
    layout: "right",
    kicker: "Transport & support",
    headline: "We handle the logistics.",
    highlight: "You focus on the game.",
    description:
      "Airport transfers, venue shuttles and on-the-ground support for coaches, managers and delegations.",
  },
];

type CardVariant = "blue" | "green" | "dark";

const serviceCards: {
  href: string;
  kicker: string;
  title: string;
  body: string;
  cta: string;
  icon: LucideIcon;
  variant: CardVariant;
}[] = [
  {
    href: "/services",
    kicker: "Team travel",
    title: "Travel for teams",
    body: "Group flights and coordinated itineraries built around your match schedule.",
    cta: "Explore services →",
    icon: Plane,
    variant: "blue",
  },
  {
    href: "/services",
    kicker: "On the ground",
    title: "Complete logistics",
    body: "Accommodation, airport transfers, meals and local transport in one place.",
    cta: "View support →",
    icon: Building2,
    variant: "green",
  },
  {
    href: "/travel-info",
    kicker: "Guidance",
    title: "Travel with confidence",
    body: "Practical guidance for teams travelling across Africa and beyond.",
    cta: "Travel info →",
    icon: ShieldCheck,
    variant: "dark",
  },
];

const cardStyles: Record<
  CardVariant,
  {
    card: string;
    blob: string;
    icon: string;
    kicker: string;
    body: string;
    cta: string;
  }
> = {
  blue: {
    card: "bg-white border border-slate-200",
    blob: "bg-[#e8f4fb]",
    icon: "bg-[#e8f4fb] text-[#007cc2]",
    kicker: "text-[#007cc2]",
    body: "text-slate-500",
    cta: "text-[#007cc2]",
  },
  green: {
    card: "bg-white border border-slate-200",
    blob: "bg-[#eaf5ee]",
    icon: "bg-[#eaf5ee] text-[#17633e]",
    kicker: "text-[#17633e]",
    body: "text-slate-500",
    cta: "text-[#17633e]",
  },
  dark: {
    card: "bg-[#102331] text-white",
    blob: "bg-white/5",
    icon: "bg-white/10 text-[#d0ee27]",
    kicker: "text-[#d0ee27]",
    body: "text-slate-300",
    cta: "text-[#d0ee27]",
  },
};

const quickLinks = [
  {
    href: "/manage-request",
    title: "Manage your request",
    body: "Check on a request you've already submitted.",
  },
  {
    href: "/travel-info",
    title: "Travel info",
    body: "Practical guidance for teams travelling across Africa and beyond.",
  },
  {
    href: "/services",
    title: "Sports services",
    body: "Accommodation, airport transfers, meals and local transport in one place.",
  },
  {
    href: "/team-login",
    title: "Team login",
    body: "Sign in to your team account.",
  },
];

const fieldHeight = "h-[68px] sm:h-[72px]";

export default function Page() {
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
    <div className="min-h-screen bg-[#f4f7f8] text-[#102331]">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative">
          <HeroSlider slides={heroSlides} />

          {/* Tabs overlapping the hero, attached to the booking panel */}
          <div
            id="book"
            className="relative z-10 mx-auto -mt-14 max-w-[1850px] scroll-mt-24 px-4 sm:-mt-16 sm:px-9"
          >
            <div className="grid grid-cols-3 gap-1.5 sm:flex sm:gap-2">
              <button
                type="button"
                aria-current="true"
                className="flex items-center justify-center rounded-t-xl bg-[#007cc2] px-2 py-3 text-center text-xs font-black uppercase leading-tight text-[#d0ee27] sm:px-8 sm:py-4 sm:text-base lg:text-lg"
              >
                Request logistics
              </button>
              <Link
                href="/services"
                className="flex items-center justify-center rounded-t-xl bg-white px-2 py-3 text-center text-xs font-black uppercase leading-tight text-[#007cc2] transition hover:bg-slate-50 sm:px-8 sm:py-4 sm:text-base lg:text-lg"
              >
                Explore services
              </Link>
              <Link
                href="/manage-request"
                className="flex items-center justify-center rounded-t-xl bg-white px-2 py-3 text-center text-xs font-black uppercase leading-tight text-[#007cc2] transition hover:bg-slate-50 sm:px-8 sm:py-4 sm:text-base lg:text-lg"
              >
                Manage a request
              </Link>
            </div>

            <div className="rounded-2xl rounded-tl-none bg-[#007cc2] p-4 shadow-2xl sm:p-6 lg:p-8">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-[#007cc2] sm:text-base">
                  Round trip
                </span>
                <p className="text-sm font-medium text-white/85 sm:text-base">
                  Tell us about your team&apos;s journey.
                </p>
              </div>

              <form
                onSubmit={submit}
                className="grid gap-3 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.5fr)_minmax(0,.9fr)_auto]"
              >
                {/* From / To in one white box */}
                <div className="grid overflow-hidden rounded-xl bg-white sm:grid-cols-2">
                  <label
                    className={`flex ${fieldHeight} items-center gap-3 px-4 transition focus-within:bg-slate-50`}
                  >
                    <MapPin className="shrink-0 text-[#007cc2]" />
                    <span className="sr-only">Travelling from</span>
                    <input
                      required
                      name="from"
                      placeholder="Travelling from"
                      className="w-full min-w-0 bg-transparent text-base font-semibold outline-none placeholder:font-medium placeholder:text-slate-400"
                    />
                  </label>
                  <label
                    className={`flex ${fieldHeight} items-center gap-3 border-t border-slate-200 px-4 transition focus-within:bg-slate-50 sm:border-l sm:border-t-0`}
                  >
                    <MapPin className="shrink-0 text-[#007cc2]" />
                    <span className="sr-only">Destination</span>
                    <input
                      required
                      name="destination"
                      placeholder="Destination"
                      className="w-full min-w-0 bg-transparent text-base font-semibold outline-none placeholder:font-medium placeholder:text-slate-400"
                    />
                  </label>
                </div>

                {/* Dates */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDatesOpen(!datesOpen)}
                    aria-label="Travel dates"
                    aria-expanded={datesOpen}
                    className={`grid ${fieldHeight} w-full grid-cols-2 items-center rounded-xl bg-white text-left transition hover:bg-slate-50`}
                  >
                    <span className="flex min-w-0 items-center gap-3 px-4">
                      <CalendarDays className="shrink-0 text-[#007cc2]" />
                      <span
                        className={`truncate text-base ${
                          dates.departure
                            ? "font-semibold"
                            : "font-medium text-slate-400"
                        }`}
                      >
                        {dates.departure || "Departure"}
                      </span>
                    </span>
                    <span className="flex h-full min-w-0 items-center border-l border-slate-200 px-4">
                      <span
                        className={`truncate text-base ${
                          dates.returnDate
                            ? "font-semibold"
                            : "font-medium text-slate-400"
                        }`}
                      >
                        {dates.returnDate || "Return"}
                      </span>
                    </span>
                  </button>
                  {datesOpen && (
                    <DateRangePicker
                      value={dates}
                      onChange={setDates}
                      onDone={() => setDatesOpen(false)}
                    />
                  )}
                </div>

                {/* Travellers */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTravellersOpen(!travellersOpen)}
                    aria-expanded={travellersOpen}
                    className={`flex ${fieldHeight} w-full items-center gap-3 rounded-xl bg-white px-4 text-left transition hover:bg-slate-50`}
                  >
                    <Users className="shrink-0 text-[#007cc2]" />
                    <span className="flex-1 whitespace-nowrap text-base font-semibold">
                      {total} {total === 1 ? "traveller" : "travellers"}
                    </span>
                    <ChevronDown className="shrink-0 text-[#007cc2]" />
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
                <button
                  type="submit"
                  className={`${fieldHeight} rounded-xl bg-[#d0ee27] px-8 text-lg font-black uppercase tracking-wide text-[#25370d] transition hover:bg-[#c1df1b] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 active:scale-[0.99]`}
                >
                  Continue
                </button>
              </form>

              {formError && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-red-700"
                >
                  {formError}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="mx-auto max-w-[1850px] px-4 pt-16 sm:px-9 sm:pt-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.16em] text-[#102331]">
                Explore more
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#007cc2] sm:text-4xl">
                Services for teams
              </h2>
            </div>
            <Link
              href="/services"
              className="text-base font-bold text-[#007cc2] hover:underline"
            >
              See all our services →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {serviceCards.map(
              ({ href, kicker, title, body, cta, icon: Icon, variant }) => {
                const s = cardStyles[variant];
                return (
                  <Link
                    key={title}
                    href={href}
                    className={`group relative flex min-h-[320px] flex-col overflow-hidden rounded-3xl p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl sm:p-8 ${s.card}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute -right-12 -top-12 size-44 rounded-full ${s.blob}`}
                    />
                    <span
                      className={`relative flex size-12 items-center justify-center rounded-2xl ${s.icon}`}
                    >
                      <Icon className="size-6" />
                    </span>
                    <p
                      className={`relative mt-6 text-xs font-bold uppercase tracking-[.16em] ${s.kicker}`}
                    >
                      {kicker}
                    </p>
                    <h3 className="relative mt-2 text-2xl font-black">
                      {title}
                    </h3>
                    <p
                      className={`relative mt-3 text-base leading-7 ${s.body}`}
                    >
                      {body}
                    </p>
                    <span
                      className={`relative mt-auto pt-8 text-base font-bold transition group-hover:translate-x-1 ${s.cta}`}
                    >
                      {cta}
                    </span>
                  </Link>
                );
              },
            )}
          </div>
        </section>

        {/* Quick links */}
        <section className="mx-auto max-w-[1850px] px-4 pt-16 sm:px-9 sm:pt-20">
          <div className="mb-8 text-center">
            <p className="text-sm font-bold uppercase tracking-[.16em] text-[#102331]">
              Get ready
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#007cc2] sm:text-4xl">
              Know before you travel
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map(({ href, title, body }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-2xl bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="text-2xl font-black leading-tight text-[#007cc2]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{body}</p>
                <span className="mt-5 block text-sm font-bold text-[#17633e] transition group-hover:translate-x-1">
                  Go →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
