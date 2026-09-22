import type { Metadata } from "next";
import Link from "next/link";
import { PRESETS } from "@/config/presets";
import ImageCompressor from "@/components/ImageCompressor";

export const metadata: Metadata = {
  title: "KB Precision Compressor — Compress Any Image to Exact KB Size",
  description:
    "Free browser-based image compressor. Set an exact KB target and get a guaranteed result — works for NADRA CNIC, passport, visa, LinkedIn, and more. Nothing uploaded.",
};

// Icon helpers mapped to preset id
const PRESET_ICONS: Record<string, string> = {
  "nadra-cnic": "🪪",
  "pakistan-passport": "📘",
  "us-visa": "🇺🇸",
  "uk-visa": "🇬🇧",
  "schengen-visa": "🇪🇺",
  "linkedin-resume": "💼",
  "rozee-profile": "📋",
  signature: "✍️",
};

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          Compress images to{" "}
          <span className="text-emerald-600">an exact KB size</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-zinc-500">
          Upload a photo, set your target KB, and download a guaranteed
          result — no server, no account, no storage. Everything runs in your
          browser.
        </p>
      </div>

      {/* Quick manual compressor */}
      <section className="mt-10">
        <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Quick compress — set any KB target
        </h2>
        <ImageCompressor defaultManualKB={100} />
      </section>

      {/* Preset grid */}
      <section className="mt-16">
        <h2 className="mb-6 text-xl font-bold text-zinc-800">
          Common portal presets
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PRESETS.map((preset) => (
            <Link
              key={preset.id}
              href={`/${preset.slug}`}
              className="group flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
            >
              <span className="text-2xl" aria-hidden="true">
                {PRESET_ICONS[preset.id] ?? "🖼️"}
              </span>
              <p className="font-semibold text-zinc-900 group-hover:text-emerald-700 transition-colors">
                {preset.label}
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {preset.width && preset.height
                  ? `${preset.width}×${preset.height} px · `
                  : ""}
                max {preset.maxSizeKB} KB
              </p>
              <span className="mt-auto text-xs font-medium text-emerald-600 group-hover:underline">
                Open tool →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust section */}
      <section className="mt-16 rounded-2xl border border-zinc-200 bg-white px-6 py-8 text-center">
        <h2 className="text-lg font-bold text-zinc-800">
          Why KB Precision?
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3 text-sm text-zinc-600">
          <div>
            <p className="text-2xl mb-2">🔒</p>
            <p className="font-semibold text-zinc-800">Zero uploads</p>
            <p>
              Images never leave your browser. Compression runs entirely via
              the HTML5 Canvas API.
            </p>
          </div>
          <div>
            <p className="text-2xl mb-2">🎯</p>
            <p className="font-semibold text-zinc-800">Guaranteed size</p>
            <p>
              Binary-search compression ensures output is always at or below
              your target — never over.
            </p>
          </div>
          <div>
            <p className="text-2xl mb-2">⚡</p>
            <p className="font-semibold text-zinc-800">Instant results</p>
            <p>
              No queue, no wait, no account needed. Upload and download in
              seconds.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
