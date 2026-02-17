"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ThemeSelector() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Hindari error hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Atau return loading skeleton
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Tampilan Aplikasi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {/* Tombol Light */}
          <Button
            variant={theme === "light" ? "default" : "outline"}
            className="flex h-auto flex-col items-center gap-2 py-3"
            onClick={() => setTheme("light")}
          >
            <Sun className="h-5 w-5" />
            <span className="text-xs">Terang</span>
          </Button>

          {/* Tombol Dark */}
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            className="flex h-auto flex-col items-center gap-2 py-3"
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-5 w-5" />
            <span className="text-xs">Gelap</span>
          </Button>

          {/* Tombol System */}
          <Button
            variant={theme === "system" ? "default" : "outline"}
            className="flex h-auto flex-col items-center gap-2 py-3"
            onClick={() => setTheme("system")}
          >
            <Laptop className="h-5 w-5" />
            <span className="text-xs">Sistem</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
