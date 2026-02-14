import { SignOutButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { LogOut, Mail, User as UserIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  if (!user) return null;

  return (
    <div className="container mx-auto max-w-md space-y-6 p-4 pb-24">
      <h1 className="text-2xl font-bold">Akun Saya</h1>

      {/* Info User */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar className="border-primary/10 h-16 w-16 border-2">
            <AvatarImage src={user.imageUrl} />
            <AvatarFallback>USER</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{user.fullName}</CardTitle>
            <p className="text-muted-foreground text-sm">Member Aplikasi</p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 border-t pt-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="text-muted-foreground h-4 w-4" />
            <span>{user.emailAddresses[0]?.emailAddress}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <UserIcon className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground font-mono text-xs">
              ID: {userId.slice(0, 12)}...
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Area Statistik (Placeholder Masa Depan) */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="text-muted-foreground p-6 text-center text-sm">
          <p>Fitur Statistik & Tema Gelap (Dark Mode)</p>
          <p>Segera Hadir...</p>
        </CardContent>
      </Card>

      {/* Tombol Logout Besar */}
      <div className="pt-4">
        <SignOutButton>
          <Button
            variant="destructive"
            className="h-12 w-full justify-center gap-2 text-base font-medium shadow-md"
          >
            <LogOut className="h-5 w-5" />
            Keluar Aplikasi
          </Button>
        </SignOutButton>

        <p className="text-muted-foreground mt-6 text-center text-[10px]">
          Talangin App v1.0.0
        </p>
      </div>
    </div>
  );
}
