/**
 * AnalyticsScripts — loads GA4 globally on every page.
 *
 * GA4 Measurement ID G-N52P6EZ121 is hardcoded and always active.
 * Plausible is still supported as an optional addition via env var.
 *
 * This is a SERVER component — no "use client" needed because
 * next/script with strategy="afterInteractive" works from server components
 * in the App Router.
 */

import Script from "next/script";

const GA_ID = "G-N52P6EZ121";

export default function AnalyticsScripts() {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <>
      {/* ── Google Analytics 4 — always loaded ─────────────────────────── */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>

      {/* ── Plausible — optional, privacy-first ────────────────────────── */}
      {plausibleDomain && (
        <Script
          src="https://plausible.io/js/script.tagged-events.js"
          data-domain={plausibleDomain}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
