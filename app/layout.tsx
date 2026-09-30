import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import PrivacyBanner from "@/components/PrivacyBanner";
import AnalyticsScripts from "@/components/AnalyticsScripts";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KB Precision Compressor — Compress Images to Exact KB Online",
  description:
    "Compress NADRA CNIC photos, passport photos, visa photos, and more to an exact KB target — instantly in your browser. No uploads. No storage. 100% private.",
  metadataBase: new URL("https://www.kbcompress.online"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.className}>
      <body className="flex min-h-screen flex-col text-zinc-900 antialiased" style={{ background: "#f5f5f0" }}>
        {/* Privacy notice — visible on every page */}
        <PrivacyBanner />

        {/* Site-wide navigation */}
        <SiteNav />

        {/* Page content */}
        <div className="flex flex-1 flex-col">{children}</div>

        {/* Footer */}
        <footer className="border-t py-6 text-center text-xs" style={{ borderColor: "#e4e4df", background: "#ffffff", color: "#a1a1aa" }}>
          <p>
            KB Precision Compressor — all processing happens in your browser.
            Zero uploads. Zero storage.
          </p>
          <p className="mt-1">
            &copy; {new Date().getFullYear()} KB Precision · Free forever
          </p>
        </footer>

        {/* Analytics — loads only when env vars are set */}
        <AnalyticsScripts />
      </body>
    </html>
  );
}
