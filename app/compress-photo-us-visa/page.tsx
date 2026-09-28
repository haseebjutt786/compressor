import { getPresetBySlug } from "@/config/presets";
import PresetPageShell, { buildMetadata } from "@/components/PresetPageShell";
import type { FaqItem } from "@/components/PresetPageShell";

const preset = getPresetBySlug("compress-photo-us-visa")!;

export const metadata = buildMetadata(preset);

const FAQ: FaqItem[] = [
  {
    q: "What are the US visa (DS-160) photo requirements?",
    a: "The U.S. Department of State requires a 2×2 inch (51×51 mm) colour photo, which is 600×600 px at 300 dpi. The file must be under 240 KB in JPEG format, with a plain white or off-white background and the face centred and covering 50–69% of the frame.",
  },
  {
    q: "How does this compressor produce a DS-160 compliant photo?",
    a: "This tool centre-crops your photo to 600×600 px and compresses it to under 240 KB — the two digital requirements for DS-160. Background colour and face proportion must be correct in your source photo; the tool does not add or remove backgrounds.",
  },
  {
    q: "Does the output meet the DS-160 upload requirements?",
    a: "The tool produces a 600×600 px JPEG under 240 KB, which satisfies the DS-160 file size and dimension requirements. Always verify your photo meets all CEAC guidelines before submitting.",
  },
];

export default function UsVisaPage() {
  return (
    <PresetPageShell
      preset={preset}
      requirementsNote="DS-160 requires a 2×2 in (600×600 px at 300 dpi) JPEG under 240 KB with a plain white background. This tool crops to 600×600 px and compresses to under 240 KB — entirely in your browser."
      faq={FAQ}
    />
  );
}
