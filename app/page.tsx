import type { Metadata } from "next";
import Link from "next/link";
import {
  CreditCardIcon, BookOpenIcon, PlaneIcon, GlobeIcon, MapPinIcon,
  LinkedinIcon, BriefcaseIcon, PenLineIcon, ImageIcon,
  ShieldCheckIcon, TargetIcon, ZapIcon,
} from "@/components/icons";
import { PRESETS } from "@/config/presets";
import ImageCompressor from "@/components/ImageCompressor";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "KB Precision Compressor — Compress Any Image to Exact KB Size",
  description:
    "Free browser-based image compressor. Set an exact KB target and get a guaranteed result — works for NADRA CNIC, passport, visa, LinkedIn, and more. Nothing uploaded.",
};

// ── Lucide icon + tint per preset ────────────────────────────────────────────
const PRESET_META: Record<string, { icon: React.ElementType; tint: string; iconColor: string }> = {
  "nadra-cnic":         { icon: CreditCardIcon,  tint: "#fef3c7", iconColor: "#d97706" },
  "pakistan-passport":  { icon: BookOpenIcon,    tint: "#dbeafe", iconColor: "#2563eb" },
  "us-visa":            { icon: PlaneIcon,       tint: "#fee2e2", iconColor: "#dc2626" },
  "uk-visa":            { icon: GlobeIcon,       tint: "#e0e7ff", iconColor: "#4f46e5" },
  "schengen-visa":      { icon: MapPinIcon,      tint: "#fce7f3", iconColor: "#be185d" },
  "linkedin-resume":    { icon: LinkedinIcon,    tint: "#dbeafe", iconColor: "#0a66c2" },
  "rozee-profile":      { icon: BriefcaseIcon,   tint: "#dcfce7", iconColor: "#16a34a" },
  signature:            { icon: PenLineIcon,     tint: "#fdf2f8", iconColor: "#9333ea" },
};

const TRUST_ITEMS = [
  {
    icon: ShieldCheckIcon,
    tint: "#d1fae5",
    iconColor: "#059669",
    title: "Zero uploads",
    body: "Images never leave your browser. Compression runs entirely via the HTML5 Canvas API.",
  },
  {
    icon: TargetIcon,
    tint: "#dbeafe",
    iconColor: "#2563eb",
    title: "Guaranteed size",
    body: "Binary-search compression ensures output is always at or below your target — never over.",
  },
  {
    icon: ZapIcon,
    tint: "#fef3c7",
    iconColor: "#d97706",
    title: "Instant results",
    body: "No queue, no wait, no account needed. Upload and download in seconds.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-14">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative text-center overflow-hidden rounded-3xl px-6 py-14 sm:py-20 mb-12"
        style={{ background: "linear-gradient(135deg,#f0fdf4 0%,#f5f5f0 50%,#eff6ff 100%)" }}>

        {/* Background blobs — CSS only */}
        <div className="hero-blob"
          style={{ width: 380, height: 380, top: -80, left: "15%",
            background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)" }} />
        <div className="hero-blob"
          style={{ width: 280, height: 280, bottom: -60, right: "10%",
            background: "radial-gradient(circle, #bfdbfe 0%, transparent 70%)" }} />

        <div className="relative z-10">
          <h1
            className="animate-fade-up text-4xl font-extrabold tracking-tight sm:text-5xl"
            style={{ color: "#18181b", lineHeight: 1.15, letterSpacing: "-0.03em" }}
          >
            Compress images to{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #059669, #0891b2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              an exact KB size
            </span>
          </h1>

          <p
            className="animate-fade-up-delay-1 mx-auto mt-5 max-w-xl text-lg"
            style={{ color: "#52525b" }}
          >
            Upload a photo, set your target KB, and download a guaranteed
            result — no server, no account, no storage. Everything runs in
            your browser.
          </p>
        </div>
      </div>

      {/* ── Quick manual compressor ──────────────────────────────────────── */}
      <section className="animate-fade-up-delay-2">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest"
          style={{ color: "#a1a1aa" }}>
          Quick compress — set any KB target
        </p>
        <ImageCompressor defaultManualKB={100} />
      </section>

      {/* ── Preset grid ─────────────────────────────────────────────────── */}
      <section className="mt-20">
        <h2 className="mb-2 text-2xl font-bold" style={{ color: "#18181b", letterSpacing: "-0.02em" }}>
          Common portal presets
        </h2>
        <p className="mb-7 text-sm" style={{ color: "#71717a" }}>
          One click to load the exact dimensions and size limits for each portal.
        </p>

        <ScrollReveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {PRESETS.map((preset) => {
              const meta = PRESET_META[preset.id] ?? { icon: ImageIcon, tint: "#f4f4f5", iconColor: "#52525b" };
              const Icon = meta.icon;
              return (
                <Link
                  key={preset.id}
                  href={`/${preset.slug}`}
                  className="preset-card reveal-item group flex flex-col gap-3 rounded-2xl border p-5"
                  style={{
                    background: "#ffffff",
                    borderColor: "#e4e4df",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Icon badge */}
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: meta.tint }}
                  >
                    <Icon size={20} color={meta.iconColor} strokeWidth={1.8} aria-hidden="true" />
                  </div>

                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#18181b" }}>
                      {preset.label}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "#71717a" }}>
                      {preset.width && preset.height
                        ? `${preset.width}×${preset.height} px · `
                        : ""}
                      max {preset.maxSizeKB} KB
                    </p>
                  </div>

                  <span
                    className="mt-auto text-xs font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1"
                    style={{ color: "#059669" }}
                  >
                    Open tool →
                  </span>
                </Link>
              );
            })}
          </div>
        </ScrollReveal>
      </section>

      {/* ── Trust section ───────────────────────────────────────────────── */}
      <section className="mt-20">
        <h2 className="mb-8 text-center text-xl font-bold" style={{ color: "#18181b" }}>
          Why KB Precision?
        </h2>
        <ScrollReveal>
          <div className="grid gap-5 sm:grid-cols-3">
            {TRUST_ITEMS.map(({ icon: Icon, tint, iconColor, title, body }) => (
              <div
                key={title}
                className="trust-card reveal-item rounded-2xl border p-6 text-center"
                style={{ background: "#ffffff", borderColor: "#e4e4df" }}
              >
                <div
                  className="animate-bounce-in mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: tint }}
                >
                  <Icon size={24} color={iconColor} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <p className="font-semibold text-sm mb-2" style={{ color: "#18181b" }}>{title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#52525b" }}>{body}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
