import type { ReactNode } from "react";

/**
 * Shared banner for inner pages (services, travel info, manage request…).
 * Same look as the home hero: photo, dark diagonal panel, lime kicker.
 */
export default function PageHero({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-[#102331]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/sportinuity-hero.png')" }}
      />
      {/* Small screens: full-width tint */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#081924]/95 via-[#081924]/75 to-[#081924]/40 lg:hidden"
      />
      {/* Large screens: diagonal panel behind the text */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 hidden w-[70%] bg-[#081924]/90 [clip-path:polygon(0_0,100%_0,78%_100%,0_100%)] lg:block"
      />
      <div className="relative mx-auto max-w-[1850px] px-4 pb-20 pt-14 sm:px-9 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-[#d0ee27]">
          {kicker}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {children && (
          <div className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
