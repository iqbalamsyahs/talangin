"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
    const pathname = usePathname();

    // Daftar Menu Bawah
    const navItems = [
        {
            label: "Beranda",
            href: "/",
            icon: Home,
            active: pathname === "/",
        },
        {
            label: "Buat Grup",
            href: "/groups/create",
            icon: PlusCircle,
            active: pathname === "/groups/create",
        },
        // Kalau nanti ada halaman profile sendiri, bisa tambah disini
        // { label: "Profil", href: "/profile", icon: User, active: pathname === "/profile" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 md:hidden">
            <div className="flex h-16 items-center justify-around pb-safe">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 min-w-[64px] rounded-md py-1 transition-colors",
                            item.active
                                ? "text-primary font-medium"
                                : "text-muted-foreground hover:text-primary/70"
                        )}
                    >
                        <item.icon className={cn("h-6 w-6", item.active && "fill-current/20")} />
                        <span className="text-[10px]">{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}