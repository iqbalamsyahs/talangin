import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";

import { ThemeProvider } from "@/components/themes/theme-provider";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: "400",
});

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
      <html lang="id" suppressHydrationWarning>
        <body className={`${poppins.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
