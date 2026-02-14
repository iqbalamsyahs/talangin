import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    return (
        <div className="flex min-h-screen flex-col">
            {/* Mobile Nav will go here */}
            <main className="flex-1">{children}</main>
            {/* Bottom Nav will go here */}
        </div>
    );
}
