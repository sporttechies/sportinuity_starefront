"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Layout = "left" | "right" | "full";

export type HeroSlide = {
  image: string;
  /**
   * "left"  → diagonal panel + text on the left (default)
   * "right" → diagonal panel + text on the right
   * "full"  → full image, no diagonal panel, centred text
   */
  layout?: Layout;
  kicker?: string;
  /** First line of the headline (white) */
  headline?: string;
  /** Second line of the headline (lime) */
  highlight?: string;
  description?: string;
  /** Describe the image if the slide has no text (e.g. a banner with text baked in) */
  alt?: string;
};

const TEXT_ALIGN: Record<Layout, string> = {
  left: "items-start text-left",
  // On small screens the text stays left; it moves right once the panel does
  right: "items-start text-left lg:items-end lg:text-right",
  full: "items-center text-center",
};

function Overlay({ layout }: { layout: Layout }) {
  if (layout === "full") {
    return (
      <div aria-hidden="true" className="absolute inset-0 bg-[#081924]/45" />
    );
  }

  return (
    <>
      {/* Small screens: full-width tint */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#081924]/90 via-[#081924]/60 to-[#081924]/20 lg:hidden"
      />
      {/* Large screens: diagonal panel */}
      {layout === "left" ? (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 hidden w-[64%] bg-[#081924]/85 [clip-path:polygon(0_0,100%_0,74%_100%,0_100%)] lg:block"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 hidden w-[64%] bg-[#081924]/85 [clip-path:polygon(0_0,100%_0,100%_100%,26%_100%)] lg:block"
        />
      )}
    </>
  );
}

export default function HeroSlider({
  slides,
  interval = 6000,
}: {
  slides: HeroSlide[];
  interval?: number;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const multiple = slides.length > 1;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!multiple || paused || reduceMotion) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % slides.length),
      interval,
    );
    return () => clearInterval(id);
  }, [multiple, paused, reduceMotion, slides.length, interval]);

  return (
    <div
      className="relative h-[380px] bg-[#102331] sm:h-[420px] lg:h-[clamp(440px,31.5vw,600px)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Each slide is one layer: image + overlay + text fade together */}
      {slides.map((slide, i) => {
        const layout = slide.layout ?? "left";
        const isActive = i === active;
        const Heading = i === 0 ? "h1" : "h2";

        return (
          <div
            key={i}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.alt ?? ""}
              fill
              sizes="100vw"
              priority={i === 0}
              className="object-cover object-center"
            />

            <Overlay layout={layout} />

            <div
              className={`relative mx-auto flex h-full max-w-[1850px] flex-col justify-center px-4 pb-16 sm:px-9 sm:pb-20 lg:pb-24 ${TEXT_ALIGN[layout]}`}
            >
              {slide.kicker && (
                <p className="text-sm font-bold uppercase tracking-[.2em] text-[#d0ee27]">
                  {slide.kicker}
                </p>
              )}
              {slide.headline && (
                <Heading className="mt-4 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {slide.headline}
                  {slide.highlight && (
                    <>
                      <br />
                      <span className="text-[#d0ee27]">{slide.highlight}</span>
                    </>
                  )}
                </Heading>
              )}
              {slide.description && (
                <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
                  {slide.description}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Dots: bottom-right, sitting above the tabs row like the reference */}
      {multiple && (
        <div
          role="group"
          aria-label="Hero slides"
          className="absolute bottom-[4.5rem] right-4 z-20 flex items-center sm:bottom-24 sm:right-9 lg:bottom-[22%] lg:right-[7%]"
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show slide ${i + 1} of ${slides.length}`}
              aria-current={i === active}
              className="group flex h-6 w-6 items-center justify-center"
            >
              <span
                className={`block h-2.5 w-2.5 rounded-full transition-colors duration-300 group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[#081924] ${
                  i === active
                    ? "bg-[#d0ee27]"
                    : "bg-white/90 group-hover:bg-white"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
