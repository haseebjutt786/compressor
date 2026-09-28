import { getPresetBySlug } from "@/config/presets";
import PresetPageShell, { buildMetadata } from "@/components/PresetPageShell";
import type { FaqItem } from "@/components/PresetPageShell";

const preset = getPresetBySlug("compress-photo-uk-visa")!;

export const metadata = buildMetadata(preset);

const FAQ: FaqItem[] = [
  {
    q: "What are the UK visa photo requirements?",
    a: "UK Visas and Immigration (UKVI) requires a colour photograph measuring 45×35 mm with a plain light grey or cream background. For digital uploads, the photo is typically cropped to approximately 480×640 px and must be under 250 KB in JPEG format.",
  },
  {
    q: "Why is this preset portrait orientation (480×640)?",
    a: "The standard UKVI biometric photo is taller than it is wide — 35 mm wide by 45 mm tall. At 300 dpi that maps to roughly 413×531 px; this tool uses 480×640 px which is widely accepted by UK visa application portals.",
  },
  {
    q: "Does this work for UK settlement and ILR applications?",
    a: "Yes. The same digital photo specification applies to most UKVI applications including visitor visas, student visas, skilled worker visas, and settlement/ILR applications.",
  },
];

export default function UkVisaPage() {
  return (
    <PresetPageShell
      preset={preset}
      requirementsNote="UKVI requires a 45×35 mm colour photo (portrait), uploaded digitally as a JPEG under 250 KB. This tool crops to 480×640 px and compresses to under 250 KB — no server, no upload."
      faq={FAQ}
    />
  );
}
