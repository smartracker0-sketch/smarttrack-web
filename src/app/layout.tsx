import type { Metadata } from "next";
import localFont from "next/font/local";
import FloatingChatSupport from "./FloatingChatSupport";
import "./globals.css";

const inter = localFont({
  src: "../../public/fonts/InterVariable.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Tracker",
  description:
    "Smart Tracker Telematics — the all-in-one platform to track, monitor, and manage your vehicles, assets, fuel, and drivers.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
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
      className={`${inter.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="h-full flex flex-col">
        {children}
        <FloatingChatSupport />
      </body>
    </html>
  );
}
