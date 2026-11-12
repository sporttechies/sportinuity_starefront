"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";

const DEFAULT_IMAGES = ["/sportinuity-hero.png"];

/**
 * Shared banner for inner pages (services, travel info, manage request…).
 * Photos crossfade behind a fixed dark diagonal panel and lime kicker.
 */
export default function PageHero({
  kicker,
  title,
  children,
  images = DEFAULT_IMAGES,
  interval = 6000,
}: {
  kicker: string;
  title: string;
  children?: ReactNode;
  /** Image paths to rotate through. One image = no dots, no rotation. */
  images?: string[];
  /** Milliseconds between slides. */
  interval?: number;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const multiple = images.length > 1;

  // Respect "reduce motion" system setting
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (!multiple || paused || reduceMotion) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % images.length),
      interval,
    );
    return () => clearInterval(id);
  }, [multiple, paused, reduceMotion, images.length, interval]);

  return (
    <section
      className="relative overflow-hidden bg-[#102331]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Slides */}
      <div aria-hidden="true" className="absolute inset-0">
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            sizes="100vw"
            priority={i === 0}
            className={`object-cover object-center transition-opacity duration-1000 ease-in-out ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

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

      {/* Dots */}
      {multiple && (
        <div
          className="absolute bottom-5 right-4 z-10 flex items-center sm:bottom-6 sm:right-9"
          role="group"
          aria-label="Hero slides"
        >
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show slide ${i + 1} of ${images.length}`}
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
    </section>
  );
}
