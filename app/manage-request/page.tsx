"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, Search, Settings } from "lucide-react";
import {
  listTeamRequests,
  type TeamRequest,
} from "../lib/api";
import { STATUS_LABELS } from "../lib/constants";
import { formatDate, formatDateRange } from "../lib/format";
import { useTeamSession } from "../lib/use-team-session";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import PageHero from "../components/page-hero";
import StatusBadge from "../components/status-badge";
import TeamAvatar from "../components/team-avatar";

const PAGE_SIZE = 10;
const FILTERS = [
  "all",
  "new",
  "in_review",
  "quoted",
  "confirmed",
  "completed",
  "rejected",
  "cancelled",
] as const;

export default function ManageRequestPage() {
  const { ready, user } = useTeamSession();
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<TeamRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  // Debounce the search box.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(
    async (offset: number) => {
      const id = ++requestId.current;
      setLoading(true);
      setError("");
      try {
        const result = await listTeamRequests({
          status: status === "all" ? "" : status,
          q: query,
          limit: PAGE_SIZE,
          offset,
        });
        if (id !== requestId.current) return; // a newer load superseded this one
        setItems((current) =>
          offset === 0 ? result.data : [...current, ...result.data],
        );
        setTotal(result.total);
        setCounts(result.counts || {});
      } catch (err) {
        if (id !== requestId.current) return;
        setError(
          err instanceof Error ? err.message : "Could not load your requests.",
        );
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [status, query],
  );

  useEffect(() => {
    if (ready && user) load(0);
  }, [ready, user, load]);

  const countFor = (key: string) =>
    key === "all"
      ? Object.values(counts).reduce((a, b) => a + b, 0)
      : (counts[key] ?? 0);

  return (
    <div className="min-h-screen bg-[#f4f7f8] text-[#102331]">
      <SiteHeader />

      <main>
        <PageHero kicker="Team travel desk" title="Your requests">
          {user && (
            <p>
              Signed in as{" "}
              <strong className="font-bold text-[#d0ee27]">
                {user.teamName}
              </strong>
            </p>
          )}
        </PageHero>

        <section className="relative z-10 mx-auto -mt-12 max-w-5xl px-4 pb-12 sm:-mt-16 sm:px-9">
          {!ready ? (
            <div className="rounded-2xl bg-white p-7 shadow-xl">
              Checking your team account…
            </div>
          ) : !user ? (
            <div className="rounded-2xl bg-white p-7 shadow-xl">
              <p className="text-lg font-semibold">
                Sign in to your team account to see your requests.
              </p>
              <Link
                href="/team-login?next=/manage-request"
                className="mt-5 inline-block rounded-xl bg-[#007cc2] px-6 py-3 font-bold text-white hover:bg-[#006ba8]"
              >
                Go to team login
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-5 shadow-xl sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <TeamAvatar
                    name={user.teamName}
                    logoPath={user.logoPath}
                    className="size-12"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black">
                      {user.teamName}
                    </p>
                    <Link
                      href="/team-profile"
                      className="inline-flex items-center gap-1 text-sm font-bold text-[#007cc2] hover:underline"
                    >
                      <Settings className="size-3.5" /> Team profile
                    </Link>
                  </div>
                </div>
                <Link
                  href="/#book"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#d0ee27] px-5 py-3 font-black uppercase tracking-wide text-[#102331] hover:bg-[#c1df1b]"
                >
                  <Plus className="size-4" /> New request
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2" role="tablist">
                {FILTERS.map((key) => {
                  const n = countFor(key);
                  if (key !== "all" && key !== status && n === 0) return null;
                  const active = status === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setStatus(key)}
                      className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                        active
                          ? "bg-[#007cc2] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {key === "all" ? "All" : STATUS_LABELS[key]} ({n})
                    </button>
                  );
                })}
              </div>

              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by reference, event or destination"
                  aria-label="Search requests"
                  className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-3 outline-none focus:border-[#007cc2] focus:ring-4 focus:ring-[#007cc2]/15"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {error}
                </p>
              )}

              <ul className="mt-5 divide-y divide-slate-100">
                {items.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/manage-request/${encodeURIComponent(r.reference)}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-2 py-4 transition hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="font-black">
                          {r.reference}{" "}
                          <span className="font-semibold text-slate-500">
                            · {r.event}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {r.from ? `${r.from} → ` : ""}
                          {r.location} ·{" "}
                          {formatDateRange(r.departure, r.returnDate)} ·{" "}
                          {r.people} traveller{r.people === 1 ? "" : "s"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          Submitted {formatDate(r.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={r.status} />
                    </Link>
                  </li>
                ))}
              </ul>

              {!loading && !error && items.length === 0 && (
                <p className="py-10 text-center text-slate-500">
                  {total === 0 && status === "all" && !query
                    ? "No requests yet. Start one with “New request”."
                    : "No requests match your filters."}
                </p>
              )}
              {loading && (
                <p className="py-6 text-center text-slate-500" aria-busy="true">
                  Loading…
                </p>
              )}
              {!loading && items.length < total && (
                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => load(items.length)}
                    className="rounded-xl border border-slate-300 px-6 py-2.5 font-bold hover:bg-slate-50"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
