import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BottomBar } from "@/components/BottomBar";
import { HelpButton } from "@/components/HelpButton";
import { SavedTheme } from "@/components/SavedTheme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Bills",
  description:
    "A simple bill tracker, calculator and unit converter, made easy to read and use.",
  // This is the name shown under the icon on an iPhone home screen
  appleWebApp: {
    title: "My Bills",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Room at the bottom so the bottom bar never covers the end of a page */}
      <body className="min-h-full flex flex-col bg-[var(--bg-page)] pb-[calc(6rem+env(safe-area-inset-bottom))] print:pb-0">
        <SavedTheme />
        <HelpButton />
        {children}
        <BottomBar />
      </body>
    </html>
  );
}
