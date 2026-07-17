import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import FloatingChatSupport from "./FloatingChatSupport";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Tracker Telematics | Fleet Intelligence Platform",
  description:
    "Smart Tracker Telematics — the all-in-one platform to track, monitor, and manage your vehicles, assets, fuel, and drivers.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col">
        {children}
        <FloatingChatSupport />
      </body>
    </html>
  );
}
