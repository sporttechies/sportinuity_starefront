"use client";
import { FormEvent, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Globe,
  Lock,
  MapPin,
  Mail,
  Trophy,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  getTeamToken,
  loginTeam,
  registerTeam,
  saveTeamSession,
} from "../lib/api";
import { SPORTS, countryOptions } from "../lib/constants";
import { syncLocalDraftToServer } from "../lib/draft";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3 text-base text-[#102331] outline-none transition placeholder:text-slate-400 focus:border-[#007cc2] focus:ring-4 focus:ring-[#007cc2]/15 disabled:opacity-70";

function Field({
  id,
  label,
  icon: Icon,
  children,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold">
        {label}
      </label>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        {children}
      </div>
    </div>
  );
}

/** Only same-site paths may be used as a post-login destination. */
function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("\\")) return null;
  return value;
}

const countries = countryOptions();

function TeamLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const checkout = params.get("reason") === "checkout";
  const [registering, setRegistering] = useState(
    params.get("mode") === "register",
  );
  const redirected = useRef(false);

  // Already signed in: go straight on (once).
  useEffect(() => {
    if (redirected.current) return;
    if (getTeamToken()) {
      redirected.current = true;
      router.replace(next || "/manage-request");
    }
  }, [next, router]);

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
            sport: String(form.get("sport")),
            country: String(form.get("country")),
            city: String(form.get("city") || "").trim() || undefined,
          })
        : await loginTeam({
            email: String(form.get("email")),
            password: String(form.get("password")),
          });
      saveTeamSession(result.token, result.user);
      // Move a request started while signed out into the team's account.
      try {
        await syncLocalDraftToServer();
      } catch {
        // The draft stays in this browser; the request page retries.
      }
      redirected.current = true;
      router.push(next || "/manage-request");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-h-screen bg-[#f4f7f8] text-[#102331]">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-[#102331]">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/sportinuity-hero.png')" }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#081924]/95 via-[#081924]/80 to-[#081924]/50 lg:hidden"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 hidden w-[68%] bg-[#081924]/90 [clip-path:polygon(0_0,100%_0,80%_100%,0_100%)] lg:block"
          />

          <div className="relative mx-auto grid max-w-[1850px] gap-10 px-4 py-14 sm:px-9 sm:py-20 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:gap-16 lg:py-24">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#d0ee27]">
                Team account
              </p>
              <h1 className="mt-4 max-w-xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your team&apos;s travel desk.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
                Sign in to manage logistics requests, review progress, and keep
                every trip detail in one place.
              </p>
            </div>

            <form
              onSubmit={submit}
              className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            >
              <h2 className="text-2xl font-black">
                {registering ? "Create team account" : "Team login"}
              </h2>
              {checkout && (
                <p className="mt-3 rounded-xl bg-[#e8f4fb] px-3.5 py-3 text-sm font-medium text-[#0b4f78]">
                  Your traveller details are saved. Sign in or create a team
                  account to review and submit your request.
                </p>
              )}

              <div className="mt-5 grid gap-4">
                {registering && (
                  <>
                    <Field id="teamName" label="Team name" icon={Users}>
                      <input
                        required
                        id="teamName"
                        name="teamName"
                        autoComplete="organization"
                        disabled={busy}
                        className={inputClass}
                        placeholder="Harbour Sharks FC"
                      />
                    </Field>
                    <Field id="name" label="Your name" icon={UserRound}>
                      <input
                        required
                        id="name"
                        name="name"
                        autoComplete="name"
                        disabled={busy}
                        className={inputClass}
                      />
                    </Field>
                    <Field id="sport" label="Sport" icon={Trophy}>
                      <select
                        required
                        id="sport"
                        name="sport"
                        defaultValue=""
                        disabled={busy}
                        className={inputClass}
                      >
                        <option value="" disabled>
                          Select a sport
                        </option>
                        {SPORTS.map((sport) => (
                          <option key={sport} value={sport}>
                            {sport}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="country" label="Country" icon={Globe}>
                        <select
                          required
                          id="country"
                          name="country"
                          defaultValue=""
                          disabled={busy}
                          className={inputClass}
                        >
                          <option value="" disabled>
                            Select a country
                          </option>
                          {countries.map(({ code, name }) => (
                            <option key={code} value={code}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field id="city" label="City (optional)" icon={MapPin}>
                        <input
                          id="city"
                          name="city"
                          autoComplete="address-level2"
                          maxLength={80}
                          disabled={busy}
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </>
                )}
                <Field id="email" label="Email" icon={Mail}>
                  <input
                    required
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    disabled={busy}
                    className={inputClass}
                    placeholder="team@example.com"
                  />
                </Field>
                <Field id="password" label="Password" icon={Lock}>
                  <input
                    required
                    id="password"
                    minLength={8}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete={
                      registering ? "new-password" : "current-password"
                    }
                    disabled={busy}
                    className={`${inputClass} pr-12`}
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007cc2]"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </Field>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#007cc2] font-bold text-white shadow-md shadow-[#007cc2]/25 transition hover:bg-[#006ba8] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#007cc2]/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy && (
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                )}
                {busy
                  ? "Please wait…"
                  : registering
                    ? "Create account"
                    : "Sign in"}
              </button>
              <button
                type="button"
                onClick={() => setRegistering(!registering)}
                className="mt-5 w-full text-sm font-bold text-[#17633e] hover:underline"
              >
                {registering
                  ? "Already have an account? Sign in"
                  : "New team? Create an account"}
              </button>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function TeamLoginPage() {
  return (
    <Suspense
      fallback={<main className="min-h-screen bg-[#f4f7f8]" aria-busy="true" />}
    >
      <TeamLoginForm />
    </Suspense>
  );
}
