"use client";

/**
 * PrivacyBanner — visible on every page.
 * Gradient background + pulsing lock icon.
 */
export default function PrivacyBanner() {
  return (
    <div
      className="w-full py-2 px-4"
      style={{
        background: "linear-gradient(90deg, #064e3b 0%, #065f46 50%, #064e3b 100%)",
      }}
    >
      <p className="flex items-center justify-center gap-1.5 text-center text-xs font-medium text-emerald-100">
        <span className="inline-block animate-lock-pulse" aria-hidden="true">🔒</span>
        <span>
          100% private — compressed entirely in your browser.{" "}
          <strong className="text-white">No file ever leaves your device.</strong>
        </span>
      </p>
    </div>
  );
}
