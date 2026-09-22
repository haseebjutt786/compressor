import Link from "next/link";
import { PRESETS } from "@/config/presets";

/**
 * Shared top navigation — static, server component.
 */
export default function SiteNav() {
  return (
    <header className="w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-zinc-900 hover:text-emerald-600 transition-colors"
        >
          KB Precision Compressor
        </Link>

        {/* Desktop preset links */}
        <nav className="hidden md:flex items-center gap-1 flex-wrap justify-end">
          {PRESETS.map((p) => (
            <Link
              key={p.id}
              href={`/${p.slug}`}
              className="rounded px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              {p.label}
            </Link>
          ))}
        </nav>

        {/* Mobile: just show "Tools ↓" label — full list is on homepage */}
        <Link
          href="/"
          className="md:hidden text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          All tools
        </Link>
      </div>
    </header>
  );
}
