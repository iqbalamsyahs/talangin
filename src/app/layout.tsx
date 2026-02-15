import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Cengli - Bagi Tagihan Tanpa Ribet",
  description: "Aplikasi split bill paling adil dan transparan.",
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
