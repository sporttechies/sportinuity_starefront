import Link from "next/link";
export default function TravelInfoPage() {
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
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-10">
        <p className="font-bold uppercase tracking-widest text-[#17633e]">
          Travel information
        </p>
        <h1 className="mt-3 text-5xl font-black tracking-tight">
          Plan the journey beyond the fixture.
        </h1>
        <div className="mt-10 grid gap-4">
          {[
            [
              "Before you travel",
              "Share passport requirements, arrival windows, equipment notes, and dietary needs early.",
            ],
            [
              "On the ground",
              "Our coordination team keeps accommodation, transfers, meals, and match-day movements aligned.",
            ],
            [
              "Need help now?",
              "Submit a request and our team will follow up with the next practical step.",
            ],
          ].map(([title, text]) => (
            <article key={title} className="rounded-2xl bg-white p-7 shadow-sm">
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-2 leading-7 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
