import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Sans } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";

import "./globals.css";

const headlineFont = Cormorant_Garamond({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AdaptLearn - Master Tech Interviews with Adaptive Learning",
  description:
    "AdaptLearn is an adaptive learning platform for DSA, SQL, and JavaScript. Track your progress, compete on leaderboards, and master interview prep with AI-powered personalized learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${headlineFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteNavbar />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
