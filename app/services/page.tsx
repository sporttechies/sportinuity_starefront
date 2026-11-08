import Link from "next/link";
import { Building2, Plane, Truck, Users } from "lucide-react";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import PageHero from "../components/page-hero";

const services = [
  {
    title: "Team flights",
    text: "Group travel planning built around fixtures, tournaments, and arrival windows.",
    icon: Plane,
  },
  {
    title: "Accommodation",
    text: "Room blocks, meal plans, team-friendly properties, and venue proximity.",
    icon: Building2,
  },
  {
    title: "Ground transport",
    text: "Airport transfers, match-day shuttles, equipment vehicles, and drivers.",
    icon: Truck,
  },
  {
    title: "Delegation support",
    text: "One coordinated request for players, staff, officials, and suppliers.",
    icon: Users,
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#f4f7f8] text-[#102331]">
      <SiteHeader />

      <main>
        <PageHero
          kicker="Sports travel services"
          title="One request. Every moving part."
        >
          Sportinuity helps teams get to the moment that matters with practical,
          coordinated logistics.
        </PageHero>

        <section className="relative z-10 mx-auto -mt-12 max-w-[1850px] px-4 sm:-mt-16 sm:px-9">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {services.map(({ title, text, icon: Icon }, index) => {
              const green = index % 2 === 1;
              return (
                <article
                  key={title}
                  className="group relative flex min-h-[320px] flex-col overflow-hidden rounded-3xl bg-white p-7 shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-xl sm:p-8"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute -right-12 -top-12 size-44 rounded-full ${
                      green ? "bg-[#eaf5ee]" : "bg-[#e8f4fb]"
                    }`}
                  />
                  <span
                    className={`relative flex size-12 items-center justify-center rounded-2xl ${
                      green
                        ? "bg-[#eaf5ee] text-[#17633e]"
                        : "bg-[#e8f4fb] text-[#007cc2]"
                    }`}
                  >
                    <Icon className="size-6" />
                  </span>
                  <h2 className="relative mt-6 text-2xl font-black">{title}</h2>
                  <p className="relative mt-3 text-base leading-7 text-slate-600">
                    {text}
                  </p>
                  <Link
                    href="/#book"
                    className="relative mt-auto inline-block pt-8 font-bold text-[#007cc2] transition group-hover:translate-x-1"
                  >
                    Request support →
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
