import { createGroup } from "@/actions/groups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateGroupPage() {
    return (
        <div className="container max-w-md mx-auto p-4 pt-10">
            {/* Tombol Balik */}
            <Link href="/" className="flex items-center text-sm text-muted-foreground mb-4 hover:text-primary">
                <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Dashboard
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>Buat Grup Baru</CardTitle>
                    <CardDescription>
                        Bikin wadah baru buat catat pengeluaran bareng teman.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* FORM: Action mengarah ke fungsi di backend tadi */}
                    <form action={createGroup} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Nama Grup
                            </label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Contoh: Makan Siang Kantor, Trip Jogja"
                                required
                                autoFocus
                            />
                        </div>

                        <Button type="submit" className="w-full">
                            🚀 Buat Grup
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}