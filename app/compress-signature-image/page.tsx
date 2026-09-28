import { getPresetBySlug } from "@/config/presets";
import PresetPageShell, { buildMetadata } from "@/components/PresetPageShell";
import type { FaqItem } from "@/components/PresetPageShell";

const preset = getPresetBySlug("compress-signature-image")!;

export const metadata = buildMetadata(preset);

const FAQ: FaqItem[] = [
  {
    q: "What size signature image do portals require?",
    a: "Most government and university portals (including NADRA, HEC, NTS, and various exam boards) require a signature image under 10–20 KB in JPEG or PNG format. This tool targets 15 KB with a hard ceiling of 20 KB.",
  },
  {
    q: "What dimensions should a signature image be?",
    a: "A 300×100 px landscape crop is the most common accepted size. This tool resizes your signature to 300×100 px using a contain strategy — your signature is scaled to fit without cropping, with white padding added if needed.",
  },
  {
    q: "Why is 'contain' used instead of 'cover' for signatures?",
    a: "Unlike face photos, signatures must not be cropped — cutting off part of a signature makes it invalid. The contain mode scales the image down to fit within 300×100 px and fills remaining space with white background.",
  },
  {
    q: "How should I prepare my signature for scanning?",
    a: "Sign on plain white paper, scan or photograph it against a well-lit white background, and crop close to the signature. Then upload here — the tool handles the resize and file size reduction automatically.",
  },
];

export default function SignatureCompressorPage() {
  return (
    <PresetPageShell
      preset={preset}
      requirementsNote="Portal signature uploads typically require a JPEG under 10–20 KB at 300×100 px. This tool fits your signature into that frame (no cropping — white padding added if needed) and compresses to under 20 KB."
      faq={FAQ}
    />
  );
}
