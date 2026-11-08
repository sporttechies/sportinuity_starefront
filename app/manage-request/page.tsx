"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  clearTeamSession,
  getManagedRequest,
  getTeamSession,
  getTeamToken,
  getTeamUser,
} from "../lib/api";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import PageHero from "../components/page-hero";

export default function ManageRequestPage() {
  const [id, setId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  // Read the stored user after mount so server and client markup match.
  const [user, setUser] = useState<ReturnType<typeof getTeamUser> | null>(null);
  useEffect(() => {
    setUser(getTeamUser());
  }, []);
  useEffect(() => {
    if (!getTeamToken())
      setError("Sign in to your team account to manage requests.");
    else
      getTeamSession()
        .then(() => setReady(true))
        .catch(() => {
          clearTeamSession();
          setError("Your session expired. Please sign in again.");
        });
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      setResult(await getManagedRequest(id));
    } catch {
      setError(
        "We could not find that request or it does not belong to your team.",
      );
    }
  }
  return (
    <div className="min-h-screen bg-[#f4f7f8] text-[#102331]">
      <SiteHeader />

      <main>
        <PageHero kicker="Team travel desk" title="Manage your request">
          {user && (
            <p>
              Signed in as{" "}
              <strong className="font-bold text-[#d0ee27]">
                {user.teamName}
              </strong>
            </p>
          )}
        </PageHero>

        <section className="relative z-10 mx-auto -mt-12 max-w-2xl px-4 sm:-mt-16 sm:px-9">
          {!ready ? (
            <div className="rounded-2xl bg-white p-7 shadow-xl">
              <p className="text-lg font-semibold">
                {error || "Checking your team account…"}
              </p>
              <Link
                href="/team-login"
                className="mt-5 inline-block font-bold text-[#007cc2] hover:underline"
              >
                Go to team login →
              </Link>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="rounded-2xl bg-[#007cc2] p-5 shadow-2xl sm:p-7"
            >
              <label className="block text-sm font-bold text-white">
                Request reference
                <input
                  required
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="SL-1049"
                  className="mt-2 h-14 w-full rounded-xl bg-white px-4 text-base font-semibold text-[#102331] outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:ring-4 focus:ring-[#d0ee27]/60"
                />
              </label>
              <button
                type="submit"
                className="mt-4 h-14 w-full rounded-xl bg-[#d0ee27] text-lg font-black uppercase tracking-wide text-[#25370d] transition hover:bg-[#c1df1b] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 active:scale-[0.99]"
              >
                Find request
              </button>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-red-700"
                >
                  {error}
                </p>
              )}

              {result && (
                <div className="mt-5 rounded-xl bg-white p-5 text-[#102331]">
                  <p className="text-lg font-black">{result.data.team}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {result.data.location} · {result.data.people} travellers
                  </p>
                  <p className="mt-3 inline-flex rounded-full bg-[#e8f4fb] px-3 py-1 text-sm font-semibold text-[#007cc2]">
                    {result.data.status}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  clearTeamSession();
                  location.reload();
                }}
                className="mt-5 text-sm font-bold text-white/80 underline-offset-4 transition hover:text-white hover:underline"
              >
                Sign out
              </button>
            </form>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
