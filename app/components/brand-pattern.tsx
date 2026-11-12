export default function BrandPattern({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={`block h-8 w-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="brand-pattern"
          width="64"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          {/* Base */}
          <rect width="64" height="32" fill="#007cc2" />

          {/* Green diamonds */}
          <path d="M16 5 L27 16 L16 27 L5 16 Z" fill="#17633e" />
          <path d="M48 5 L59 16 L48 27 L37 16 Z" fill="#17633e" />

          {/* Lime diamond centres */}
          <path d="M16 10.5 L21.5 16 L16 21.5 L10.5 16 Z" fill="#d0ee27" />
          <path d="M48 10.5 L53.5 16 L48 21.5 L42.5 16 Z" fill="#d0ee27" />

          {/* Lime dots between diamonds (duplicated at both edges for a seamless tile) */}
          <circle cx="32" cy="16" r="3.5" fill="#d0ee27" />
          <circle cx="0" cy="16" r="3.5" fill="#d0ee27" />
          <circle cx="64" cy="16" r="3.5" fill="#d0ee27" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#brand-pattern)" />
    </svg>
  );
}
