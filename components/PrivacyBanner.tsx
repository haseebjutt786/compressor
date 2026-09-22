"use client";

/**
 * PrivacyBanner — appears on every page.
 * Reinforces client-side-only processing for user trust.
 */
export default function PrivacyBanner() {
  return (
    <div className="w-full bg-emerald-50 border-b border-emerald-200 py-2 px-4">
      <p className="text-center text-xs text-emerald-800 font-medium">
        🔒 100% private — your images are compressed entirely in your browser.{" "}
        <strong>No file is ever uploaded to any server.</strong>
      </p>
    </div>
  );
}
