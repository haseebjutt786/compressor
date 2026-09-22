import type { Metadata } from "next";
import { getPresetBySlug } from "@/config/presets";
import ImageCompressor from "@/components/ImageCompressor";

const preset = getPresetBySlug("compress-photo-nadra")!;

export const metadata: Metadata = {
  title: preset.title,
  description: preset.description,
  openGraph: {
    title: preset.title,
    description: preset.description,
    type: "website",
  },
};

export default function NadraCnicPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      {/* Unique H1 for SEO */}
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
        {preset.h1}
      </h1>

      {/* Requirements callout */}
      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <strong>NADRA requirements:</strong> 200×200 px · max 50 KB · JPG format.
        This tool crops your photo to a square, compresses it to ≤ 50 KB, and
        lets you download it immediately — nothing is sent to any server.
      </div>

      {/* Compressor tool */}
      <div className="mt-8">
        <ImageCompressor preset={preset} />
      </div>

      {/* FAQ / trust content for SEO */}
      <section className="mt-12 space-y-6 text-sm text-zinc-600">
        <h2 className="text-base font-semibold text-zinc-800">
          How does this work?
        </h2>
        <p>
          When you upload your photo, it is decoded in your browser using the
          HTML5 Canvas API. The tool crops it to a 200×200 px square (covering
          the centre of your image), then runs a binary search over JPEG quality
          settings to find the highest quality that keeps the file at or below
          50 KB. No data ever leaves your device.
        </p>

        <h2 className="text-base font-semibold text-zinc-800">
          What size does NADRA require for CNIC photos?
        </h2>
        <p>
          NADRA typically requires a digital photo between 20 KB and 50 KB at
          200×200 pixels in JPEG format. This tool guarantees the output never
          exceeds 50 KB.
        </p>

        <h2 className="text-base font-semibold text-zinc-800">
          Is my photo stored anywhere?
        </h2>
        <p>
          No. Compression happens entirely inside your browser using JavaScript.
          The image is never uploaded to any server, never stored, and never
          transmitted anywhere. Once you close the tab, the image is gone.
        </p>
      </section>
    </main>
  );
}
