import Link from "next/link";
import { PRESETS } from "@/config/presets";

/**
 * SiteNav — sticky glass-style header with animated link underlines.
 */
export default function SiteNav() {
  return (
    <header
      className="w-full sticky top-0 z-40 border-b"
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)",
        borderColor: "#e4e4df",
      }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="nav-link text-base font-bold tracking-tight"
          style={{ color: "#18181b", letterSpacing: "-0.02em" }}
        >
          <span style={{ color: "#059669" }}>KB</span>
          {" "}Precision
        </Link>

        {/* Desktop preset links */}
        <nav className="hidden md:flex items-center gap-0.5 flex-wrap justify-end">
          {PRESETS.map((p) => (
            <Link
              key={p.id}
              href={`/${p.slug}`}
              className="nav-link rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
              style={{ color: "#52525b" }}
            >
              {p.label}
            </Link>
          ))}
        </nav>

        {/* Mobile */}
        <Link
          href="/"
          className="md:hidden text-sm font-semibold"
          style={{ color: "#059669" }}
        >
          All tools ↓
        </Link>
      </div>
    </header>
  );
}
