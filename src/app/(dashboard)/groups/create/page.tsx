import { Hash, Users } from "lucide-react";
import Link from "next/link";

import { createGroup } from "@/actions/groups";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

export default function CreateGroupPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 container mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center p-4 duration-500">
      {/* Header Section */}
      <div className="mb-8 space-y-2 text-center">
        <div className="bg-primary/10 text-primary ring-primary/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl p-3 shadow-sm ring-1">
          <Users className="h-8 w-8" />
        </div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          Buat Grup Baru
        </h1>
        <p className="text-muted-foreground mx-auto max-w-xs text-balance">
          Mulai catat pengeluaran bersama teman, keluarga, atau rekan kerja
          dengan mudah.
        </p>
      </div>

      <Card className="border-muted/60 shadow-primary/5 w-full shadow-xl">
        <CardContent className="pt-6">
          <form action={createGroup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Grup</Label>
              <InputGroup>
                <InputGroupAddon>
                  <Hash className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="name"
                  name="name"
                  placeholder="Contoh: Liburan Bali, Makan Siang"
                  required
                  autoFocus
                  className="h-11 border-none focus-visible:ring-0"
                />
              </InputGroup>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <SubmitButton className="shadow-primary/20 hover:shadow-primary/30 h-11 w-full text-base font-medium shadow-lg transition-all">
                Buat Grup Sekarang
              </SubmitButton>

              <Link href="/">
                <Button
                  variant="ghost"
                  type="button"
                  className="text-muted-foreground hover:text-foreground w-full"
                >
                  Batal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
