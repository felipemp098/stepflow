import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EmailFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function EmailField({
  value,
  onChange,
  error,
  disabled,
  placeholder = "seu@email.com",
  className
}: EmailFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="email" className="text-sm font-medium text-fg-2">
        E-mail
      </Label>
      <Input
        id="email"
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "transition-colors duration-sm",
          error && "border-error focus-visible:ring-error"
        )}
        autoComplete="email"
        autoFocus
      />
      {error && (
        <p className="text-xs text-error font-medium">{error}</p>
      )}
    </div>
  );
}