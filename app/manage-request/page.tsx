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
export default function ManageRequestPage() {
  const [id, setId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const user = getTeamUser();
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
    <main className="min-h-screen bg-[#f4f7f8] text-[#102331]">
      <header className="flex items-center justify-between bg-white px-5 py-4 shadow-sm sm:px-12">
        <Link href="/" className="text-xl font-black text-[#007cc2]">
          Sportinuity
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden text-sm font-semibold sm:inline">
              {user.teamName}
            </span>
          )}
          <Link href="/" className="text-sm font-bold text-[#007cc2]">
            Back home
          </Link>
        </div>
      </header>
      <section className="mx-auto max-w-xl px-5 py-20">
        <p className="font-bold uppercase tracking-widest text-[#17633e]">
          Team travel desk
        </p>
        <h1 className="mt-3 text-4xl font-black">Manage your request</h1>
        {!ready ? (
          <div className="mt-8 rounded-2xl bg-white p-7 shadow-sm">
            <p className="font-semibold">
              {error || "Checking your team account…"}
            </p>
            <Link
              href="/team-login"
              className="mt-5 inline-block font-bold text-[#007cc2]"
            >
              Go to team login →
            </Link>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="mt-8 rounded-2xl bg-white p-6 shadow-sm"
          >
            <label className="text-sm font-bold">
              Request reference
              <input
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="SL-1049"
                className="mt-2 h-12 w-full rounded-xl border px-3 outline-none focus:ring-2 focus:ring-[#007cc2]"
              />
            </label>
            <button className="mt-5 w-full rounded-xl bg-[#007cc2] py-3 font-bold text-white">
              Find request
            </button>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            {result && (
              <div className="mt-5 rounded-xl bg-[#e8f4fb] p-4 text-sm">
                <p className="font-bold">{result.data.team}</p>
                <p>
                  {result.data.location} · {result.data.people} travellers
                </p>
                <p className="mt-2 font-semibold text-[#007cc2]">
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
              className="mt-5 text-sm font-bold text-slate-500"
            >
              Sign out
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
