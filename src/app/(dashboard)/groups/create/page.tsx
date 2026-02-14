import { createGroup } from "@/actions/groups";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Hash, Users } from "lucide-react";
import Link from "next/link";

export default function CreateGroupPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] container max-w-lg mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="text-center mb-8 space-y-2">
                <div className="bg-primary/10 text-primary p-3 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm ring-1 ring-primary/20">
                    <Users className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Buat Grup Baru</h1>
                <p className="text-muted-foreground max-w-xs mx-auto text-balance">
                    Mulai catat pengeluaran bersama teman, keluarga, atau rekan kerja dengan mudah.
                </p>
            </div>

            <Card className="w-full border-muted/60 shadow-xl shadow-primary/5">
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
                            <SubmitButton className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30">
                                Buat Grup Sekarang
                            </SubmitButton>

                            <Link href="/">
                                <Button variant="ghost" type="button" className="w-full text-muted-foreground hover:text-foreground">
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