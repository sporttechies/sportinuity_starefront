"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginTeam, registerTeam, saveTeamSession } from "../lib/api";
export default function TeamLoginPage() {
  const router = useRouter();
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const result = registering
        ? await registerTeam({
            teamName: String(form.get("teamName")),
            name: String(form.get("name")),
            email: String(form.get("email")),
            password: String(form.get("password")),
          })
        : await loginTeam({
            email: String(form.get("email")),
            password: String(form.get("password")),
          });
      saveTeamSession(result.token, result.user);
      router.push("/manage-request");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="min-h-screen bg-[#f4f7f8] text-[#102331]">
      <header className="flex items-center justify-between bg-white px-5 py-4 shadow-sm sm:px-12">
        <Link href="/" className="text-2xl font-black text-[#007cc2]">
          Sportinuity
        </Link>
        <Link href="/" className="text-sm font-bold text-[#007cc2]">
          Back home
        </Link>
      </header>
      <section className="mx-auto grid max-w-5xl gap-10 px-5 py-14 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <p className="font-bold uppercase tracking-[.2em] text-[#17633e]">
            Team account
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Your team&apos;s travel desk.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
            Sign in to manage logistics requests, review progress, and keep
            every trip detail in one place.
          </p>
        </div>
        <form onSubmit={submit} className="rounded-3xl bg-white p-7 shadow-xl">
          <h2 className="text-2xl font-black">
            {registering ? "Create team account" : "Team login"}
          </h2>
          {registering && (
            <>
              <label className="mt-5 block text-sm font-bold">
                Team name
                <input
                  required
                  name="teamName"
                  className="mt-2 h-12 w-full rounded-xl border px-3"
                  placeholder="Harbour Sharks FC"
                />
              </label>
              <label className="mt-4 block text-sm font-bold">
                Your name
                <input
                  required
                  name="name"
                  className="mt-2 h-12 w-full rounded-xl border px-3"
                />
              </label>
            </>
          )}
          <label className="mt-4 block text-sm font-bold">
            Email
            <input
              required
              type="email"
              name="email"
              className="mt-2 h-12 w-full rounded-xl border px-3"
              placeholder="team@example.com"
            />
          </label>
          <label className="mt-4 block text-sm font-bold">
            Password
            <input
              required
              minLength={8}
              type="password"
              name="password"
              className="mt-2 h-12 w-full rounded-xl border px-3"
              placeholder="At least 8 characters"
            />
          </label>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <button
            disabled={busy}
            className="mt-6 w-full rounded-xl bg-[#007cc2] py-3 font-bold text-white disabled:opacity-60"
          >
            {busy ? "Please wait…" : registering ? "Create account" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => setRegistering(!registering)}
            className="mt-5 w-full text-sm font-bold text-[#17633e]"
          >
            {registering
              ? "Already have an account? Sign in"
              : "New team? Create an account"}
          </button>
        </form>
      </section>
    </main>
  );
}
