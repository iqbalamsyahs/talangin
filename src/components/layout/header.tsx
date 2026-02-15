import { UserButton } from "@clerk/nextjs";
import { Wallet } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-14 max-w-md items-center justify-between px-4">
        {/* LOGO AREA */}
        <Link
          href="/"
          className="text-primary flex items-center gap-2 text-lg font-bold transition-opacity hover:opacity-80"
        >
          <div className="bg-primary text-primary-foreground rounded-lg p-1.5">
            <Wallet className="h-4 w-4" />
          </div>
          <span>Cengli</span>
        </Link>

        {/* USER PROFILE (CLERK) */}
        <div className="flex items-center gap-2">
          {/* UserButton dari Clerk sudah otomatis handle logout/manage account */}
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
