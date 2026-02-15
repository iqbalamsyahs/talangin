"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button, ButtonProps } from "@/components/ui/button";

interface SubmitButtonProps extends ButtonProps {
  isLoading?: boolean;
}

export function SubmitButton({
  children,
  className,
  isLoading,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isPending = pending || isLoading;
  const { disabled } = props;

  return (
    <Button disabled={isPending || disabled} className={className} {...props}>
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
