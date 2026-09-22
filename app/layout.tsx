import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import PrivacyBanner from "@/components/PrivacyBanner";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KB Precision Compressor — Compress Images to Exact KB Online",
  description:
    "Compress NADRA CNIC photos, passport photos, visa photos, and more to an exact KB target — instantly in your browser. No uploads. No storage. 100% private.",
  metadataBase: new URL("https://kbprecision.vercel.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-zinc-50 font-sans text-zinc-900">
        {/* Privacy notice — visible on every page */}
        <PrivacyBanner />

        {/* Site-wide navigation */}
        <SiteNav />

        {/* Page content */}
        <div className="flex flex-1 flex-col">{children}</div>

        {/* Footer */}
        <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-400">
          <p>
            KB Precision Compressor — all processing happens in your browser.
            Zero uploads. Zero storage.
          </p>
          <p className="mt-1">
            &copy; {new Date().getFullYear()} KB Precision · Free forever
          </p>
        </footer>
      </body>
    </html>
  );
}
