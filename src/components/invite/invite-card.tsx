"use client";

import { Loader2, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { acceptInviteAction } from "@/actions/invitations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function InviteCard({
  groupName,
  memberName,
  token,
  userImage,
}: {
  groupName: string;
  memberName: string;
  token: string;
  userImage?: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    setLoading(true);
    const res = await acceptInviteAction(token);

    if (res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success("Berhasil bergabung!");
      router.push(`/groups/${res.groupId}`);
    }
  };

  return (
    <Card className="w-full max-w-md text-center shadow-lg">
      <CardHeader>
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Ticket className="h-6 w-6" />
        </div>
        <CardTitle>Undangan Personal</CardTitle>
        <CardDescription>
          Tiket VIP ini khusus untuk mengakses data:
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-muted rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Profil Member</p>
          <h2 className="text-primary text-2xl font-bold">{memberName}</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            di Grup &quot;{groupName}&quot;
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm">akan dihubungkan ke akun kamu:</p>
          <Avatar className="h-10 w-10 border-2 border-white shadow">
            <AvatarImage src={userImage} />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleAccept}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? <Loader2 className="mr-2 animate-spin" /> : "Ya, Ini Saya"}
        </Button>
      </CardFooter>
    </Card>
  );
}
