import type { Metadata } from "next";
import ImageCompressor from "@/components/ImageCompressor";
import type { Preset } from "@/config/presets";

export interface FaqItem {
  q: string;
  a: string;
}

interface Props {
  preset: Preset;
  requirementsNote: string;
  faq: FaqItem[];
}

export default function PresetPageShell({ preset, requirementsNote, faq }: Props) {
  const sizeLabel =
    preset.width && preset.height
      ? `${preset.width}×${preset.height} px · max ${preset.maxSizeKB} KB`
      : `max ${preset.maxSizeKB} KB`;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-14">

      {/* H1 */}
      <h1
        className="animate-fade-up text-2xl font-extrabold tracking-tight sm:text-3xl"
        style={{ color: "#18181b", letterSpacing: "-0.025em" }}
      >
        {preset.h1}
      </h1>

      {/* Dimension badge */}
      <p
        className="animate-fade-up-delay-1 mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
        style={{ background: "#d1fae5", color: "#065f46" }}
      >
        {sizeLabel}
      </p>

      {/* Requirements callout */}
      <div
        className="animate-fade-up-delay-1 mt-5 rounded-2xl border px-5 py-4 text-sm leading-relaxed"
        style={{ background: "#eff6ff", borderColor: "#bfdbfe", color: "#1e40af" }}
      >
        {requirementsNote}
      </div>

      {/* Compressor */}
      <div className="animate-fade-up-delay-2 mt-8">
        <ImageCompressor preset={preset} />
      </div>

      {/* FAQ */}
      <section className="mt-14 space-y-6 text-sm" style={{ color: "#52525b" }}>
        {[...faq, {
          q: "Is my photo stored anywhere?",
          a: "No. Compression runs entirely in your browser via the HTML5 Canvas API. Your image is never uploaded to any server, never stored, and never transmitted anywhere. Once you close the tab it is gone.",
        }].map(({ q, a }) => (
          <div key={q} className="rounded-2xl border p-5"
            style={{ background: "#ffffff", borderColor: "#e4e4df" }}>
            <h2 className="font-semibold text-sm mb-1.5" style={{ color: "#18181b" }}>{q}</h2>
            <p className="leading-relaxed">{a}</p>
          </div>
        ))}
      </section>

      {/* Back link */}
      <div className="mt-10 pt-6 border-t" style={{ borderColor: "#e4e4df" }}>
        <a
          href="/"
          className="nav-link inline-flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: "#059669" }}
        >
          ← All compression tools
        </a>
      </div>
    </main>
  );
}

export function buildMetadata(preset: Preset): Metadata {
  return {
    title: preset.title,
    description: preset.description,
    openGraph: {
      title: preset.title,
      description: preset.description,
      type: "website",
    },
  };
}
