import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PasswordFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showStrengthIndicator?: boolean;
}

export function PasswordField({
  label = "Senha",
  value,
  onChange,
  error,
  disabled,
  placeholder = "••••••••",
  className,
  showStrengthIndicator = false
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6) return { strength: 1, label: "Fraca", color: "bg-error" };
    if (password.length < 10) return { strength: 2, label: "Média", color: "bg-amber-500" };
    return { strength: 3, label: "Forte", color: "bg-success" };
  };

  const passwordStrength = showStrengthIndicator ? getPasswordStrength(value) : null;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="password" className="text-sm font-medium text-fg-2">
        {label}
      </Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pr-10 transition-colors duration-sm",
            error && "border-error focus-visible:ring-error"
          )}
          autoComplete="current-password"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full w-10 px-3 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-fg-3" />
          ) : (
            <Eye className="h-4 w-4 text-fg-3" />
          )}
          <span className="sr-only">
            {showPassword ? "Ocultar senha" : "Mostrar senha"}
          </span>
        </Button>
      </div>

      {/* Password Strength Indicator */}
      {showStrengthIndicator && passwordStrength && passwordStrength.strength > 0 && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-sm",
                  level <= passwordStrength.strength
                    ? passwordStrength.color
                    : "bg-surface-2"
                )}
              />
            ))}
          </div>
          <p className="text-xs text-fg-3">{passwordStrength.label}</p>
        </div>
      )}

      {error && (
        <p className="text-xs text-error font-medium">{error}</p>
      )}
    </div>
  );
}