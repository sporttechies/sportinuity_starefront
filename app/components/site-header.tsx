"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ClipboardList,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { clearTeamSession } from "../lib/api";
import { useTeamSession } from "../lib/use-team-session";
import TeamAvatar from "./team-avatar";

/**
 * Shared site header.
 *
 * Usage: render <SiteHeader /> as a direct child of the page's root element
 * (the element that wraps the whole page) so the main bar can stay stuck to
 * the top while the page scrolls.
 */

const navLinks = [
  { label: "Plan travel", href: "/#book", color: "text-[#007cc2]" },
  { label: "Sports services", href: "/services", color: "text-[#17633e]" },
  { label: "Travel info", href: "/travel-info", color: "text-slate-600" },
];

const requestsLink = {
  label: "My requests",
  href: "/manage-request",
  icon: ClipboardList,
};

function isActive(pathname: string, href: string) {
  const path = href.split("#")[0] || "/";
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { user } = useTeamSession();
  const accountRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  function signOut() {
    clearTeamSession();
    setAccountOpen(false);
    setMenuOpen(false);
    router.push("/");
  }

  // Close the account dropdown on outside click.
  useEffect(() => {
    if (!accountOpen) return;
    const onDown = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node))
        setAccountOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [accountOpen]);

  // Compact the logo and add a stronger shadow once the page is scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu after navigating.
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  // Escape closes the mobile menu.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      {/* Utility bar — scrolls away with the page */}
      <div className="hidden bg-slate-100 md:block">
        <div className="mx-auto flex h-11 max-w-[1850px] items-center justify-end gap-7 px-4 sm:px-9">
          {user ? (
            <>
              <Link
                href={requestsLink.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#007cc2] transition hover:text-[#006ba8]"
              >
                <requestsLink.icon className="size-[18px]" />
                {requestsLink.label}
              </Link>
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  className="inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-sm font-semibold text-[#102331] transition hover:bg-white"
                >
                  <TeamAvatar
                    name={user.teamName}
                    logoPath={user.logoPath}
                    className="size-7"
                  />
                  <span className="max-w-[180px] truncate">{user.teamName}</span>
                  <ChevronDown className="size-4 text-slate-500" />
                </button>
                {accountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
                  >
                    <Link
                      role="menuitem"
                      href="/manage-request"
                      className="block px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                    >
                      My requests
                    </Link>
                    <Link
                      role="menuitem"
                      href="/team-profile"
                      className="block px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                    >
                      Team profile
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={signOut}
                      className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/team-login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#007cc2] transition hover:text-[#006ba8]"
            >
              <UserRound className="size-[18px]" />
              Team login
            </Link>
          )}
        </div>
      </div>

      {/* Main bar — sticky */}
      <header
        className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${
          scrolled || menuOpen ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-[1850px] items-center justify-between px-4 sm:px-9">
          <Link href="/" aria-label="Sportinuity home" className="shrink-0">
            <Image
              src="/logo.png"
              alt="Sportinuity"
              width={170}
              height={72}
              className={`w-auto object-contain object-left transition-[height] duration-200 ${
                scrolled ? "h-10" : "h-14"
              }`}
              priority
            />
          </Link>

          <nav
            className="hidden h-full items-stretch gap-10 md:flex"
            aria-label="Main navigation"
          >
            {navLinks.map(({ label, href, color }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={label}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center border-b-4 px-0.5 text-[15px] font-extrabold uppercase tracking-wide transition lg:text-base ${color} ${
                    active
                      ? "border-current"
                      : "border-transparent hover:border-slate-200"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="rounded-lg p-2 text-[#102331] transition hover:bg-slate-100 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu — overlays the page below the header */}
        {menuOpen && (
          <nav
            id="mobile-menu"
            aria-label="Mobile navigation"
            className="absolute inset-x-0 top-full border-t border-slate-100 bg-white px-4 pb-5 pt-2 shadow-xl sm:px-9 md:hidden"
          >
            {navLinks.map(({ label, href, color }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`block border-b border-slate-100 py-4 text-lg font-extrabold uppercase tracking-wide ${color}`}
              >
                {label}
              </Link>
            ))}
            <div className="mt-3 grid gap-1">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-1 py-3">
                    <TeamAvatar
                      name={user.teamName}
                      logoPath={user.logoPath}
                      className="size-9"
                    />
                    <span className="truncate font-bold">{user.teamName}</span>
                  </div>
                  <Link
                    href="/manage-request"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-1 py-3 text-base font-semibold hover:bg-slate-50"
                  >
                    <ClipboardList className="size-5 text-[#007cc2]" />
                    My requests
                  </Link>
                  <Link
                    href="/team-profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-1 py-3 text-base font-semibold hover:bg-slate-50"
                  >
                    <UserRound className="size-5 text-[#007cc2]" />
                    Team profile
                  </Link>
                  <button
                    type="button"
                    onClick={signOut}
                    className="flex items-center gap-3 rounded-lg px-1 py-3 text-left text-base font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="size-5" />
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/team-login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-1 py-3 text-base font-semibold text-[#102331] hover:bg-slate-50"
                >
                  <UserRound className="size-5 text-[#007cc2]" />
                  Team login
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
