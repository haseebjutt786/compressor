/**
 * Presets config — add new presets here without touching compression logic.
 *
 * Fields:
 *   id           — URL slug and unique key
 *   label        — human-readable name shown in UI
 *   slug         — Next.js page route (no leading slash)
 *   maxSizeKB    — guaranteed output ceiling in KB
 *   targetSizeKB — ideal target; if undefined, defaults to maxSizeKB
 *   width        — exact output width in px  (if undefined → no forced resize)
 *   height       — exact output height in px (if undefined → no forced resize)
 *   cropMode     — "cover" (default) | "contain" | "free" (only when both w+h set)
 *   description  — used in <meta description> and page subtitle
 *   h1           — the unique H1 for that preset's page
 *   title        — <title> tag for SEO
 *   filename     — base filename for downloaded result (without extension)
 */

export type CropMode = "cover" | "contain" | "free";

export interface Preset {
  id: string;
  label: string;
  slug: string;
  maxSizeKB: number;
  targetSizeKB?: number;
  width?: number;
  height?: number;
  cropMode?: CropMode;
  description: string;
  h1: string;
  title: string;
  filename: string;
}

export const PRESETS: Preset[] = [
  {
    id: "nadra-cnic",
    label: "NADRA CNIC Photo",
    slug: "compress-photo-nadra",
    maxSizeKB: 50,
    targetSizeKB: 40,
    width: 200,
    height: 200,
    cropMode: "cover",
    description:
      "Compress your CNIC / identity card photo to meet NADRA's requirement of 20–50 KB at 200×200 px — instantly in your browser.",
    h1: "NADRA CNIC Photo Compressor (200×200 px, max 50 KB)",
    title: "NADRA CNIC Photo Compressor — Resize & Compress to 50 KB | KB Precision",
    filename: "compressed-nadra-cnic-photo",
  },
  {
    id: "pakistan-passport",
    label: "Pakistani Passport Photo",
    slug: "compress-photo-pakistan-passport",
    maxSizeKB: 200,
    targetSizeKB: 180,
    width: 600,
    height: 600,
    cropMode: "cover",
    description:
      "Compress your Pakistani passport photo to the required size and dimensions instantly in your browser — no uploads, no data stored.",
    h1: "Pakistani Passport Photo Compressor — Resize & Compress Online",
    title: "Pakistani Passport Photo Compressor | KB Precision",
    filename: "compressed-pakistan-passport-photo",
  },
  {
    id: "us-visa",
    label: "US Visa Photo",
    slug: "compress-photo-us-visa",
    maxSizeKB: 240,
    targetSizeKB: 220,
    // 2×2 in at 300 dpi = 600×600 px; DS-160 accepts 600×600
    width: 600,
    height: 600,
    cropMode: "cover",
    description:
      "Compress your US visa / DS-160 photo to under 240 KB at 600×600 px (2×2 in) — fully client-side, nothing leaves your device.",
    h1: "US Visa Photo Compressor — Under 240 KB, 600×600 px",
    title: "US Visa Photo Compressor — DS-160 Compliant, Max 240 KB | KB Precision",
    filename: "compressed-us-visa-photo",
  },
  {
    id: "uk-visa",
    label: "UK Visa Photo",
    slug: "compress-photo-uk-visa",
    maxSizeKB: 250,
    targetSizeKB: 230,
    // UKVI spec: 45×35 mm face, digital upload typically 480×640 px crop
    width: 480,
    height: 640,
    cropMode: "cover",
    description:
      "Compress your UK visa application photo to the required dimensions and under 250 KB — processed entirely in your browser.",
    h1: "UK Visa Photo Compressor — Resize & Compress Online",
    title: "UK Visa Photo Compressor — Under 250 KB | KB Precision",
    filename: "compressed-uk-visa-photo",
  },
  {
    id: "schengen-visa",
    label: "Schengen Visa Photo",
    slug: "compress-photo-schengen-visa",
    maxSizeKB: 250,
    targetSizeKB: 230,
    // Schengen: 35×45 mm biometric; digital ~413×531 px at 300 dpi
    width: 413,
    height: 531,
    cropMode: "cover",
    description:
      "Compress your Schengen visa photo to the correct size and dimensions for European visa applications — 100% client-side.",
    h1: "Schengen Visa Photo Compressor — Resize & Compress Online",
    title: "Schengen Visa Photo Compressor — Biometric Size | KB Precision",
    filename: "compressed-schengen-visa-photo",
  },
  {
    id: "linkedin-resume",
    label: "LinkedIn / Resume Photo",
    slug: "resume-photo-size-linkedin",
    maxSizeKB: 500,
    targetSizeKB: 400,
    width: 400,
    height: 400,
    cropMode: "cover",
    description:
      "Resize and compress your LinkedIn profile or CV/resume photo to 400×400 px and under 500 KB — free, instant, and private.",
    h1: "LinkedIn & Resume Photo Compressor — 400×400 px, Under 500 KB",
    title: "LinkedIn / Resume Photo Compressor — Optimize Profile Picture | KB Precision",
    filename: "compressed-linkedin-resume-photo",
  },
  {
    id: "rozee-profile",
    label: "Rozee.pk Profile Photo",
    slug: "compress-photo-rozee-pk",
    maxSizeKB: 200,
    targetSizeKB: 180,
    width: 400,
    height: 400,
    cropMode: "cover",
    description:
      "Compress your Rozee.pk profile photo to meet upload requirements — instantly in your browser, nothing stored or sent.",
    h1: "Rozee.pk Profile Photo Compressor — Under 200 KB",
    title: "Rozee.pk Profile Photo Compressor | KB Precision",
    filename: "compressed-rozee-pk-profile-photo",
  },
  {
    id: "signature",
    label: "Signature Upload",
    slug: "compress-signature-image",
    maxSizeKB: 20,
    targetSizeKB: 15,
    // Many portals accept a wide crop; we don't force square
    width: 300,
    height: 100,
    cropMode: "contain",
    description:
      "Compress your signature image to under 20 KB for online portal uploads — NADRA, university, or government forms. Fully client-side.",
    h1: "Signature Image Compressor — Under 20 KB for Portal Uploads",
    title: "Compress Signature Image to Under 20 KB — Online & Free | KB Precision",
    filename: "compressed-signature",
  },
];

/** Look up a preset by its id. Returns undefined if not found. */
export function getPresetById(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}

/** Look up a preset by its slug. Returns undefined if not found. */
export function getPresetBySlug(slug: string): Preset | undefined {
  return PRESETS.find((p) => p.slug === slug);
}
