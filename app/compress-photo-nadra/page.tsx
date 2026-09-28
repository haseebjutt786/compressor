import { getPresetBySlug } from "@/config/presets";
import PresetPageShell, { buildMetadata } from "@/components/PresetPageShell";
import type { FaqItem } from "@/components/PresetPageShell";

const preset = getPresetBySlug("compress-photo-nadra")!;

export const metadata = buildMetadata(preset);

const FAQ: FaqItem[] = [
  {
    q: "How does this work?",
    a: "Your photo is decoded in your browser using the HTML5 Canvas API. The tool crops it to a 200×200 px square, then runs a binary search over JPEG quality settings to find the highest quality that keeps the file at or below 50 KB. Nothing leaves your device.",
  },
  {
    q: "What size does NADRA require for CNIC photos?",
    a: "NADRA typically requires a digital photo between 20 KB and 50 KB at 200×200 pixels in JPEG format. This tool guarantees the output never exceeds 50 KB.",
  },
  {
    q: "Will the crop cut off my face?",
    a: "The tool performs a centre-crop, so it keeps the middle of your image. For best results, upload a photo where your face is already centred. You can always re-upload if the crop is not to your liking.",
  },
];

export default function NadraCnicPage() {
  return (
    <PresetPageShell
      preset={preset}
      requirementsNote="NADRA requires a 200×200 px JPEG between 20–50 KB. This tool resizes and compresses your photo to meet that spec — everything runs in your browser, no server involved."
      faq={FAQ}
    />
  );
}
