"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ApiError,
  cancelTeamRequest,
  getTeamRequest,
  type TeamRequest,
} from "../../lib/api";
import { CANCELLABLE_STATUSES, STATUS_LABELS } from "../../lib/constants";
import { formatDateRange, formatDateTime } from "../../lib/format";
import { useTeamSession } from "../../lib/use-team-session";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import StatusBadge from "../../components/status-badge";

const EVENT_LABELS: Record<string, string> = {
  created: "Request submitted",
  edited: "Details updated by our team",
};

function eventLabel(e: { action: string; toStatus: string | null }) {
  if (e.action === "status_changed" && e.toStatus)
    return `Status: ${STATUS_LABELS[e.toStatus] ?? e.toStatus}`;
  return EVENT_LABELS[e.action] ?? "Update";
}

export default function RequestDetailPage() {
  const params = useParams<{ reference: string }>();
  const reference = decodeURIComponent(String(params.reference || ""));
  const { ready, user } = useTeamSession();
  const [data, setData] = useState<TeamRequest | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    setLoading(true);
    getTeamRequest(reference)
      .then((r) => !cancelled && setData(r))
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError && err.status === 404
            ? "We couldn't find that request in your team account."
            : err instanceof Error
              ? err.message
              : "Could not load this request.",
        );
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [ready, user, reference]);

  async function cancel() {
    setBusy(true);
    setError("");
    try {
      await cancelTeamRequest(reference, reason.trim() || undefined);
      setData(await getTeamRequest(reference)); // refresh status + history
      setConfirming(false);
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel.");
    } finally {
      setBusy(false);
    }
  }

  const canCancel = data && CANCELLABLE_STATUSES.includes(data.status);

  return (
    <div className="min-h-screen bg-[#f4f7f8] text-[#102331]">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-9">
        <Link
          href="/manage-request"
          className="text-sm font-bold text-[#007cc2] hover:underline"
        >
          ← All requests
        </Link>

        {!ready || loading ? (
          <p className="mt-8 text-slate-500" aria-busy="true">
            Loading…
          </p>
        ) : !user ? (
          <div className="mt-6 rounded-2xl bg-white p-7 shadow-sm">
            <p className="font-semibold">Sign in to view this request.</p>
            <Link
              href={`/team-login?next=${encodeURIComponent(`/manage-request/${reference}`)}`}
              className="mt-4 inline-block rounded-xl bg-[#007cc2] px-6 py-3 font-bold text-white hover:bg-[#006ba8]"
            >
              Go to team login
            </Link>
          </div>
        ) : !data ? (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error || "Request not found."}
          </p>
        ) : (
          <div className="mt-4 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-[#17633e]">
                  {data.team}
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight">
                  {data.reference}
                </h1>
                <p className="mt-1 text-slate-600">{data.event}</p>
              </div>
              <StatusBadge status={data.status} />
            </div>

            {data.status === "rejected" && data.rejectionReason && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="font-black text-red-800">Why it wasn&apos;t approved</p>
                <p className="mt-1 text-sm text-red-700">
                  {data.rejectionReason}
                </p>
              </div>
            )}

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                {[
                  ["From", data.from || "—"],
                  ["Destination", data.location],
                  ["Dates", formatDateRange(data.departure, data.returnDate)],
                  ["Travellers", String(data.people)],
                  [
                    "Contact",
                    [data.contact.name, data.contact.email, data.contact.phone]
                      .filter(Boolean)
                      .join(" · "),
                  ],
                  ["Submitted", formatDateTime(data.createdAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="font-bold text-slate-500">{label}</dt>
                    <dd className="mt-0.5 font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {data.travellers && data.travellers.length > 0 && (
              <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-black">Travellers</h2>
                <ul className="mt-3 divide-y divide-slate-100 text-sm">
                  {data.travellers.map((t) => (
                    <li
                      key={t.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                    >
                      <span className="font-semibold">
                        {t.index + 1}. {t.firstName} {t.lastName}
                      </span>
                      <span className="text-slate-500">
                        {t.category} · {t.type}
                        {t.documentNumber ? ` · ${t.documentNumber}` : ""}
                        {t.dietary ? ` · ${t.dietary}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {data.events && data.events.length > 0 && (
              <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-black">History</h2>
                <ol className="mt-4 space-y-4 border-l-2 border-slate-100 pl-5">
                  {data.events.map((e) => (
                    <li key={e.id} className="relative text-sm">
                      <span
                        aria-hidden="true"
                        className="absolute -left-[27px] top-1.5 size-2.5 rounded-full bg-[#007cc2]"
                      />
                      <p className="font-bold">
                        {eventLabel(e)}
                      </p>
                      {e.note && <p className="text-slate-600">{e.note}</p>}
                      <p className="text-xs text-slate-400">
                        {formatDateTime(e.createdAt)}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </p>
            )}

            {canCancel && (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                {!confirming ? (
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="font-bold text-red-600 hover:underline"
                  >
                    Cancel this request
                  </button>
                ) : (
                  <div>
                    <p className="font-bold">
                      Cancel {data.reference}? This can&apos;t be undone.
                    </p>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      maxLength={500}
                      rows={2}
                      placeholder="Reason (optional)"
                      className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#007cc2] focus:ring-4 focus:ring-[#007cc2]/15"
                    />
                    <div className="mt-3 flex gap-3">
                      <button
                        type="button"
                        onClick={cancel}
                        disabled={busy}
                        className="rounded-xl bg-red-600 px-5 py-2.5 font-bold text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        {busy ? "Cancelling…" : "Yes, cancel request"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirming(false)}
                        disabled={busy}
                        className="rounded-xl border border-slate-300 px-5 py-2.5 font-bold hover:bg-slate-50"
                      >
                        Keep it
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
