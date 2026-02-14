import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";

interface GroupCardProps {
    id: string;
    name: string;
    memberCount: number;
    role: "admin" | "member";
}

export function GroupCard({ id, name, memberCount, role }: GroupCardProps) {
    return (
        <Link href={`/groups/${id}`}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg font-bold">{name}</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                                <Users className="w-3 h-3" /> {memberCount} Anggota
                            </CardDescription>
                        </div>
                        {role === "admin" && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                Admin
                            </span>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                        Lihat Detail <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}