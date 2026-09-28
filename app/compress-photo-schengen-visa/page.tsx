import { getPresetBySlug } from "@/config/presets";
import PresetPageShell, { buildMetadata } from "@/components/PresetPageShell";
import type { FaqItem } from "@/components/PresetPageShell";

const preset = getPresetBySlug("compress-photo-schengen-visa")!;

export const metadata = buildMetadata(preset);

const FAQ: FaqItem[] = [
  {
    q: "What are the Schengen visa photo requirements?",
    a: "The Schengen Visa Code requires a biometric photo: 35 mm wide × 45 mm tall, plain light background, face centred and covering 70–80% of the frame. For digital submissions this is approximately 413×531 px at 300 dpi and typically under 250 KB.",
  },
  {
    q: "Which countries use the Schengen photo spec?",
    a: "All 29 Schengen Area member states use the same biometric photo specification — including Germany, France, Italy, Spain, Netherlands, and others. This preset covers them all.",
  },
  {
    q: "How does the portrait crop work?",
    a: "The tool centre-crops your photo to 413×531 px (35×45 mm at 300 dpi) using a cover strategy — the image fills the frame from the centre. For best results, submit a well-centred portrait against a plain background.",
  },
];

export default function SchengenVisaPage() {
  return (
    <PresetPageShell
      preset={preset}
      requirementsNote="Schengen biometric photo: 35×45 mm (413×531 px at 300 dpi), plain background, JPEG under 250 KB. This tool crops and compresses your photo to meet that spec entirely in your browser."
      faq={FAQ}
    />
  );
}
