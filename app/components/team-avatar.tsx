/* eslint-disable @next/next/no-img-element */
import { apiUrl } from "../lib/api";

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "T"
  );
}

/** Team logo, or the team's initials when it has none. */
export default function TeamAvatar({
  name,
  logoPath,
  logoSrc,
  className = "size-10",
}: {
  name: string;
  logoPath?: string | null;
  /** an already-resolved src (e.g. a freshly picked image) - wins over logoPath */
  logoSrc?: string | null;
  className?: string;
}) {
  const src = logoSrc || apiUrl(logoPath);
  return src ? (
    <img
      src={src}
      alt=""
      className={`${className} shrink-0 rounded-full border border-slate-200 bg-white object-contain`}
    />
  ) : (
    <span
      aria-hidden="true"
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-[#e8f4fb] text-xs font-black text-[#007cc2]`}
    >
      {initials(name)}
    </span>
  );
}
