/**
 * analytics.ts — lightweight event tracking helper
 *
 * Supports two providers, both optional and tree-shaken at build time:
 *   • Plausible Analytics  (set NEXT_PUBLIC_PLAUSIBLE_DOMAIN)
 *   • Google Analytics 4   (set NEXT_PUBLIC_GA_MEASUREMENT_ID)
 *
 * If neither env var is set the calls are no-ops — safe in development.
 *
 * Usage:
 *   import { trackEvent } from "@/lib/analytics";
 *   trackEvent("compress_success", { preset: "nadra-cnic", output_kb: 38 });
 */

type EventProps = Record<string, string | number | boolean | undefined>;

// ── Plausible ────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: EventProps; callback?: () => void }
    ) => void;
    // GA4 gtag
    gtag?: (
      command: "event",
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

function sendPlausible(name: string, props?: EventProps) {
  if (typeof window !== "undefined" && typeof window.plausible === "function") {
    window.plausible(name, props ? { props } : undefined);
  }
}

// ── GA4 ──────────────────────────────────────────────────────────────────────

function sendGA4(name: string, props?: EventProps) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, props as Record<string, unknown>);
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Track a named event with optional properties.
 * Fires on both Plausible and GA4 if either is loaded.
 *
 * Standard events used in this app:
 *
 * | Event name          | Props                                        |
 * |---------------------|----------------------------------------------|
 * | compress_start      | preset (id or "manual"), target_kb           |
 * | compress_success    | preset, target_kb, output_kb, quality_pct    |
 * | compress_already_small | preset, output_kb                         |
 * | compress_impossible | preset, target_kb                            |
 * | compress_error      | preset, reason                               |
 * | download            | preset, output_kb                            |
 */
export function trackEvent(name: string, props?: EventProps): void {
  sendPlausible(name, props);
  sendGA4(name, props);
}

/**
 * Convenience: track a compression result from the engine output status.
 */
export function trackCompressionResult(
  preset: string,
  targetKB: number,
  status: "success" | "already_small" | "impossible" | "error",
  extra?: EventProps
): void {
  const eventName =
    status === "success"
      ? "compress_success"
      : status === "already_small"
      ? "compress_already_small"
      : status === "impossible"
      ? "compress_impossible"
      : "compress_error";

  trackEvent(eventName, { preset, target_kb: targetKB, ...extra });
}
