import type { Metadata } from "next";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResQFlow | Emergency Resource Allocation Mission Control",
  description: "Intelligent coordination, algorithmic allocation, and transparent tracking of emergency relief supplies.",
  icons: {
    icon: "/resqflow-icon.svg",
    shortcut: "/resqflow-icon.svg",
    apple: "/resqflow-icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-[#F7F8FA] text-[#172033] font-['Inter',sans-serif] antialiased selection:bg-[#F04452] selection:text-white">
        {children}
      </body>
    </html>
  );
}
