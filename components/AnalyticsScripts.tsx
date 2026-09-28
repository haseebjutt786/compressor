"use client";

import Script from "next/script";

/**
 * Loads analytics provider scripts.
 *
 * • Plausible: set NEXT_PUBLIC_PLAUSIBLE_DOMAIN (e.g. "kbprecision.com")
 * • GA4:       set NEXT_PUBLIC_GA_MEASUREMENT_ID (e.g. "G-XXXXXXXXXX")
 *
 * Both are optional — if neither env var is set, nothing is injected.
 * Place this component inside the root <body> in app/layout.tsx.
 */
export default function AnalyticsScripts() {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <>
      {/* Plausible — privacy-first, no cookies */}
      {plausibleDomain && (
        <Script
          src="https://plausible.io/js/script.tagged-events.js"
          data-domain={plausibleDomain}
          strategy="afterInteractive"
        />
      )}

      {/* Google Analytics 4 */}
      {gaMeasurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}', { send_page_view: true });
            `}
          </Script>
        </>
      )}
    </>
  );
}
