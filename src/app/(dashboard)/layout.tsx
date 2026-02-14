import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="bg-muted/10 flex min-h-screen flex-col">
      {/* 1. Header di Atas (Sticky) */}
      <Header />

      {/* 2. Konten Utama */}
      {/* pb-20 agar konten paling bawah tidak tertutup Mobile Nav */}
      <main className="flex-1 pb-16">{children}</main>

      {/* 3. Navigasi Bawah (Hanya muncul di Mobile lewat CSS md:hidden) */}
      <MobileNav />
    </div>
  );
}
