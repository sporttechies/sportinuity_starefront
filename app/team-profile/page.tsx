"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getTeamProfile,
  updateTeamProfile,
  type TeamProfile,
} from "../lib/api";
import { SPORTS, countryOptions } from "../lib/constants";
import { useTeamSession } from "../lib/use-team-session";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import TeamAvatar from "../components/team-avatar";

const countries = countryOptions();
const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-normal outline-none transition focus:border-[#007cc2] focus:ring-4 focus:ring-[#007cc2]/15 disabled:bg-slate-50 disabled:text-slate-500";

/** Resizes a picked image to fit 256x256 (no cropping) and returns a JPEG data URL. */
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const size = 256;
      const scale = Math.min(size / img.width, size / img.height, 1);
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Your browser can't process images."));
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file isn't a supported image."));
    };
    img.src = url;
  });
}

export default function TeamProfilePage() {
  const { ready, user } = useTeamSession();
  const [profile, setProfile] = useState<TeamProfile | null>(null);
  const [form, setForm] = useState({
    name: "",
    sport: "",
    country: "",
    city: "",
    adminName: "",
  });
  // undefined = keep current logo, null = remove, string = new image
  const [logo, setLogo] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  function fill(p: TeamProfile) {
    setProfile(p);
    setForm({
      name: p.name,
      sport: p.sport,
      country: p.country,
      city: p.city || "",
      adminName: p.admin.name,
    });
  }

  useEffect(() => {
    if (!ready || !user) return;
    getTeamProfile()
      .then(fill)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load profile."),
      )
      .finally(() => setLoading(false));
  }, [ready, user]);

  async function pickLogo(file?: File) {
    if (!file) return;
    setError("");
    try {
      setLogo(await resizeImage(file));
      setSaved(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read image.");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const updated = await updateTeamProfile({
        name: form.name.trim(),
        sport: form.sport,
        country: form.country,
        city: form.city.trim() || null,
        adminName: form.adminName.trim(),
        ...(logo !== undefined ? { logo } : {}),
      });
      fill({ ...(profile as TeamProfile), ...updated });
      setLogo(undefined);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setBusy(false);
    }
  }

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm({ ...form, [key]: e.target.value });
      setSaved(false);
    };

  const previewSrc = logo === null ? null : logo || undefined;
  const hasLogo = logo === null ? false : !!(logo || profile?.logoPath);

  return (
    <div className="min-h-screen bg-[#f4f7f8] text-[#102331]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-9">
        <Link
          href="/manage-request"
          className="text-sm font-bold text-[#007cc2] hover:underline"
        >
          ← My requests
        </Link>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Team profile
        </h1>

        {!ready || (user && loading) ? (
          <p className="mt-8 text-slate-500" aria-busy="true">
            Loading…
          </p>
        ) : !user ? (
          <div className="mt-6 rounded-2xl bg-white p-7 shadow-sm">
            <p className="font-semibold">Sign in to edit your team profile.</p>
            <Link
              href="/team-login?next=/team-profile"
              className="mt-4 inline-block rounded-xl bg-[#007cc2] px-6 py-3 font-bold text-white hover:bg-[#006ba8]"
            >
              Go to team login
            </Link>
          </div>
        ) : (
          <form onSubmit={save} className="mt-6 space-y-6">
            <section className="flex flex-wrap items-center gap-5 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
              <TeamAvatar
                name={form.name || user.teamName}
                logoPath={logo === null ? null : profile?.logoPath}
                logoSrc={previewSrc}
                className="size-24"
              />
              <div>
                <p className="font-black">Team picture</p>
                <p className="text-sm text-slate-500">
                  PNG, JPG or WebP. It&apos;s resized automatically.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold hover:bg-slate-50"
                  >
                    {hasLogo ? "Change picture" : "Upload picture"}
                  </button>
                  {hasLogo && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogo(null);
                        setSaved(false);
                      }}
                      className="px-2 text-sm font-bold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => pickLogo(e.target.files?.[0])}
                />
              </div>
            </section>

            <section className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6">
              <label className="text-sm font-bold sm:col-span-2">
                Team name
                <input
                  required
                  value={form.name}
                  onChange={set("name")}
                  maxLength={120}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-bold">
                Sport
                <select
                  required
                  value={form.sport}
                  onChange={set("sport")}
                  className={inputClass}
                >
                  {!SPORTS.some((s) => s === form.sport) && (
                    <option value={form.sport}>{form.sport || "Select"}</option>
                  )}
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold">
                Country
                <select
                  required
                  value={form.country}
                  onChange={set("country")}
                  className={inputClass}
                >
                  {countries.map(({ code, name }) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold">
                City (optional)
                <input
                  value={form.city}
                  onChange={set("city")}
                  maxLength={80}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-bold">
                Your name
                <input
                  required
                  value={form.adminName}
                  onChange={set("adminName")}
                  maxLength={120}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-bold sm:col-span-2">
                Email
                <input
                  disabled
                  value={profile?.admin.email || user.email}
                  className={inputClass}
                />
              </label>
            </section>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </p>
            )}
            {saved && (
              <p
                role="status"
                className="rounded-xl bg-[#eaf5ee] px-4 py-3 text-sm font-bold text-[#1c673e]"
              >
                Profile saved.
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-[#007cc2] px-8 py-3.5 font-bold text-white shadow-md transition hover:bg-[#006ba8] disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save changes"}
            </button>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
