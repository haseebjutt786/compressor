import { getPresetBySlug } from "@/config/presets";
import PresetPageShell, { buildMetadata } from "@/components/PresetPageShell";
import type { FaqItem } from "@/components/PresetPageShell";

const preset = getPresetBySlug("compress-photo-rozee-pk")!;

export const metadata = buildMetadata(preset);

const FAQ: FaqItem[] = [
  {
    q: "What size photo does Rozee.pk require?",
    a: "Rozee.pk profile photos are displayed as small circular thumbnails. A 400×400 px square JPEG under 200 KB uploads reliably and displays crisply across all device sizes.",
  },
  {
    q: "Why does profile photo size matter on Rozee.pk?",
    a: "Profiles with a professional photo receive significantly more recruiter views. Keeping the file under 200 KB ensures fast load times and avoids upload errors on slower connections.",
  },
  {
    q: "Can I use this photo on other Pakistani job portals?",
    a: "Yes — the same 400×400 px / 200 KB spec works on Mustakbil.com, Indeed Pakistan, and LinkedIn Pakistan as well.",
  },
];

export default function RozeePkPhotoPage() {
  return (
    <PresetPageShell
      preset={preset}
      requirementsNote="Rozee.pk recommends a square profile photo under 200 KB for fast uploads and clean display. This tool crops to 400×400 px and compresses to under 200 KB — entirely client-side."
      faq={FAQ}
    />
  );
}
