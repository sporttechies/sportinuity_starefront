import Link from "next/link";
import { ClipboardList, LifeBuoy, Truck } from "lucide-react";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import PageHero from "../components/page-hero";

const cards = [
  {
    title: "Before you travel",
    text: "Share passport requirements, arrival windows, equipment notes, and dietary needs early.",
    icon: ClipboardList,
    dark: false,
  },
  {
    title: "On the ground",
    text: "Our coordination team keeps accommodation, transfers, meals, and match-day movements aligned.",
    icon: Truck,
    dark: false,
  },
  {
    title: "Need help now?",
    text: "Submit a request and our team will follow up with the next practical step.",
    icon: LifeBuoy,
    dark: true,
  },
];

export default function TravelInfoPage() {
  return (
    <div className="min-h-screen bg-[#f4f7f8] text-[#102331]">
      <SiteHeader />

      <main>
        <PageHero
          kicker="Travel information"
          title="Plan the journey beyond the fixture."
        />

        <section className="relative z-10 mx-auto -mt-12 max-w-[1850px] px-4 sm:-mt-16 sm:px-9">
          <div className="grid gap-6 md:grid-cols-3">
            {cards.map(({ title, text, icon: Icon, dark }) => (
              <article
                key={title}
                className={`relative flex min-h-[300px] flex-col overflow-hidden rounded-3xl p-7 shadow-lg sm:p-8 ${
                  dark ? "bg-[#102331] text-white" : "bg-white"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute -right-12 -top-12 size-44 rounded-full ${
                    dark ? "bg-white/5" : "bg-[#e8f4fb]"
                  }`}
                />
                <span
                  className={`relative flex size-12 items-center justify-center rounded-2xl ${
                    dark
                      ? "bg-white/10 text-[#d0ee27]"
                      : "bg-[#e8f4fb] text-[#007cc2]"
                  }`}
                >
                  <Icon className="size-6" />
                </span>
                <h2 className="relative mt-6 text-2xl font-black">{title}</h2>
                <p
                  className={`relative mt-3 text-base leading-7 ${
                    dark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {text}
                </p>
                {dark && (
                  <Link
                    href="/#book"
                    className="relative mt-auto pt-8 text-base font-bold text-[#d0ee27] hover:underline"
                  >
                    Submit a request →
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
