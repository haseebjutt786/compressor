import { getPresetBySlug } from "@/config/presets";
import PresetPageShell, { buildMetadata } from "@/components/PresetPageShell";
import type { FaqItem } from "@/components/PresetPageShell";

const preset = getPresetBySlug("resume-photo-size-linkedin")!;

export const metadata = buildMetadata(preset);

const FAQ: FaqItem[] = [
  {
    q: "What size should a LinkedIn profile photo be?",
    a: "LinkedIn recommends a profile photo between 400×400 px and 7680×4320 px, under 8 MB. However, for fast loading and crisp display, 400×400 px at under 500 KB is the sweet spot. This preset outputs exactly that.",
  },
  {
    q: "Can I use this for a CV or resume photo?",
    a: "Yes. A 400×400 px JPEG under 500 KB is a universally accepted size for CV and resume headshots across email, PDF, and ATS systems. Most recruiters and HR portals accept photos in this range.",
  },
  {
    q: "Should I use a square crop for LinkedIn?",
    a: "LinkedIn displays profile photos in a circle but stores them as squares. A square 400×400 px crop ensures nothing important is cut off when the circle mask is applied.",
  },
];

export default function LinkedInResumePhotoPage() {
  return (
    <PresetPageShell
      preset={preset}
      requirementsNote="LinkedIn and most CV portals work best with a 400×400 px square headshot under 500 KB. This tool crops your photo to a square and compresses it to that size — instantly in your browser."
      faq={FAQ}
    />
  );
}
