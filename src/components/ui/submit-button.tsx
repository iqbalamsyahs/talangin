"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button, ButtonProps } from "@/components/ui/button";

export function SubmitButton({ children, className, ...props }: ButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} className={className} {...props}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
