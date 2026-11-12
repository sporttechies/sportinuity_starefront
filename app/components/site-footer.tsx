"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronUp } from "lucide-react";
import BrandPattern from "./brand-pattern";

/**
 * Shared site footer.
 *
 * Add or rename links by editing the `columns` array below.
 * TODO: replace the "#" hrefs in `socials` with the real profile URLs.
 */

const columns = [
  {
    title: "Plan travel",
    links: [
      { label: "Request logistics", href: "/#book" },
      { label: "Manage a request", href: "/manage-request" },
    ],
  },
  {
    title: "Sports services",
    links: [
      { label: "Sports services", href: "/services" },
      { label: "Travel for teams", href: "/services" },
      { label: "Complete logistics", href: "/services" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Travel info", href: "/travel-info" },
      { label: "Team login", href: "/team-login" },
    ],
  },
];

const socials = [
  { name: "Facebook", href: "#" },
  { name: "Instagram", href: "#" },
  { name: "X", href: "#" },
  { name: "LinkedIn", href: "#" },
] as const;

function SocialIcon({ name }: { name: (typeof socials)[number]["name"] }) {
  const common = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "size-6",
    "aria-hidden": true,
  };
  switch (name) {
    case "Facebook":
      return (
        <svg {...common}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg {...common}>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <path d="M17.5 6.5h.01" />
        </svg>
      );
    case "X":
      return (
        <svg {...common}>
          <path d="M4 4l16 16M20 4 4 20" />
        </svg>
      );
    case "LinkedIn":
      return (
        <svg {...common}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
  }
}

export default function SiteFooter() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <footer className="mt-20 border-t border-slate-200 bg-white text-[#102331]">
        <div className="mx-auto grid max-w-[1850px] gap-12 px-4 py-14 sm:px-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-20">
          {/* Brand + socials */}
          <div>
            <Link
              href="/"
              aria-label="Sportinuity home"
              className="inline-block"
            >
              <Image
                src="/logo.png"
                alt="Sportinuity"
                width={170}
                height={72}
                className="h-16 w-auto object-contain object-left"
              />
            </Link>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-500">
              Flights, accommodation, transport and on-the-ground support for
              teams and delegations travelling to compete.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {socials.map(({ name, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex size-12 items-center justify-center bg-[#d0ee27] text-[#007cc2] transition hover:bg-[#c1df1b] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#007cc2]/30"
                >
                  <SocialIcon name={name} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <nav
            aria-label="Footer"
            className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className="text-xl font-black uppercase tracking-tight text-[#007cc2] sm:text-2xl">
                  {column.title}
                </h2>
                <ul className="mt-4 grid gap-1">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-block py-1 text-base text-slate-700 transition hover:text-[#007cc2] hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-100 px-4 py-6 sm:px-9 text-slate-500 flex flex-col items-center gap-4 text-center lg:flex-row lg:justify-between lg:text-left">
          <p className="text-sm leading-relaxed text-slate-500">
            Copyright &copy; {new Date().getFullYear()} Sportinuity. All rights
            reserved. Usage of this website states your compliance of our{" "}
            <Link
              href="/terms-of-use"
              className="font-medium text-[#007cc2] underline-offset-2 hover:underline focus-visible:underline"
            >
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              className="font-medium text-[#007cc2] underline-offset-2 hover:underline focus-visible:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>

          <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 lg:justify-end">
            <p className="text-sm">Powered by</p>
            <Link
              href="https://www.sporttechies.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Powered by Sporttechies (opens in a new tab)"
              className="inline-block"
            >
              <Image
                src="/sporttechies_logo.png"
                alt="Sporttechies"
                width={170}
                height={72}
                className="h-8 w-auto object-contain sm:h-10"
              />
            </Link>
          </div>
        </div>

        {/* Brand pattern strip */}
        <BrandPattern />
      </footer>

      {/* Back to top */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-40 flex size-10 items-center justify-center rounded-full bg-[#007cc2] text-white shadow-xl transition hover:bg-[#006ba8] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#007cc2]/30 ${
          showTop ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ChevronUp className="size-7" />
      </button>
    </>
  );
}
