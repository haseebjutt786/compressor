import { getPresetBySlug } from "@/config/presets";
import PresetPageShell, { buildMetadata } from "@/components/PresetPageShell";
import type { FaqItem } from "@/components/PresetPageShell";

const preset = getPresetBySlug("compress-photo-pakistan-passport")!;

export const metadata = buildMetadata(preset);

const FAQ: FaqItem[] = [
  {
    q: "What are the digital photo requirements for a Pakistani passport?",
    a: "The Directorate General of Immigration & Passports (DGIP) requires a recent colour photograph with a plain white background, typically submitted as a 600×600 px JPEG under 200 KB for online applications. Physical passport photos are 35×45 mm.",
  },
  {
    q: "How does this compressor work?",
    a: "Your photo is cropped to a 600×600 px square in your browser using the Canvas API, then compressed to under 200 KB using a binary quality search — the highest quality that still meets the file-size limit. Nothing is sent to any server.",
  },
  {
    q: "Can I use this for NADRA's online passport portal?",
    a: "Yes. This tool produces a 600×600 px JPEG under 200 KB which meets the typical upload requirements for the NADRA/DGIP online passport application portal.",
  },
];

export default function PakistanPassportPage() {
  return (
    <PresetPageShell
      preset={preset}
      requirementsNote="Pakistani passport online applications typically require a 600×600 px JPEG under 200 KB with a plain background. This tool resizes and compresses your photo to meet that spec — all in your browser."
      faq={FAQ}
    />
  );
}
