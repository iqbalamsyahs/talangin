import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Wallet } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container max-w-md mx-auto flex h-14 items-center justify-between px-4">
                {/* LOGO AREA */}
                <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary hover:opacity-80 transition-opacity">
                    <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                        <Wallet className="w-4 h-4" />
                    </div>
                    <span>Talangin</span>
                </Link>

                {/* USER PROFILE (CLERK) */}
                <div className="flex items-center gap-2">
                    {/* UserButton dari Clerk sudah otomatis handle logout/manage account */}
                    <UserButton
                        afterSignOutUrl="/sign-in"
                        appearance={{
                            elements: {
                                avatarBox: "h-8 w-8"
                            }
                        }}
                    />
                </div>
            </div>
        </header>
    );
}