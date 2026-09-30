/**
 * AnalyticsScripts — loads GA4 globally on every page.
 *
 * The gtag loader uses strategy="beforeInteractive" so Next.js injects it
 * into <head> in the initial HTML. This satisfies Google Search Console's
 * ownership verification requirement ("tracking code must be in <head>").
 *
 * The init script uses strategy="afterInteractive" because it references
 * window.dataLayer which only exists in the browser after HTML is parsed.
 *
 * Both scripts are placed in the root layout (app/layout.tsx) so they fire
 * on every page — no per-page additions needed or used.
 */

import Script from "next/script";

const GA_ID = "G-N52P6EZ121";

export default function AnalyticsScripts() {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <>
      {/* ── GA4 loader — injected into <head> by Next.js ───────────────── */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="beforeInteractive"
      />

      {/* ── GA4 init — runs after hydration, accesses window.dataLayer ─── */}
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>

      {/* ── Plausible — optional, set NEXT_PUBLIC_PLAUSIBLE_DOMAIN ─────── */}
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
