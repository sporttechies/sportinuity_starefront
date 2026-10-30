import Link from "next/link";
const services = [
  [
    "Team flights",
    "Group travel planning built around fixtures, tournaments, and arrival windows.",
  ],
  [
    "Accommodation",
    "Room blocks, meal plans, team-friendly properties, and venue proximity.",
  ],
  [
    "Ground transport",
    "Airport transfers, match-day shuttles, equipment vehicles, and drivers.",
  ],
  [
    "Delegation support",
    "One coordinated request for players, staff, officials, and suppliers.",
  ],
];
export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#f4f7f8] text-[#102331]">
      <header className="flex items-center justify-between bg-white px-5 py-4 shadow-sm sm:px-12">
        <Link href="/">
          <strong className="text-xl font-black text-[#007cc2]">
            Sportinuity
          </strong>
        </Link>
        <Link href="/" className="text-sm font-bold text-[#007cc2]">
          Back home
        </Link>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-10">
        <p className="font-bold uppercase tracking-widest text-[#17633e]">
          Sports travel services
        </p>
        <h1 className="mt-3 max-w-2xl text-5xl font-black tracking-tight">
          One request. Every moving part.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Sportinuity helps teams get to the moment that matters with practical,
          coordinated logistics.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {services.map(([title, text]) => (
            <article key={title} className="rounded-2xl bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-black">{title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{text}</p>
              <Link
                href="/#book"
                className="mt-7 inline-block font-bold text-[#007cc2]"
              >
                Request support →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
