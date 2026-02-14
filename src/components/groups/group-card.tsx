import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface GroupCardProps {
  id: string;
  name: string;
  memberCount: number;
  role: "admin" | "member";
}

export function GroupCard({ id, name, memberCount, role }: GroupCardProps) {
  return (
    <Link href={`/groups/${id}`}>
      <Card className="hover:bg-accent/50 border-l-primary cursor-pointer border-l-4 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-bold">{name}</CardTitle>
              <CardDescription className="mt-1 flex items-center gap-1">
                <Users className="h-3 w-3" /> {memberCount} Anggota
              </CardDescription>
            </div>
            {role === "admin" && (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-medium">
                Admin
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground mt-2 flex items-center text-sm">
            Lihat Detail <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
