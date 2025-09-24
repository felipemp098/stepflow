import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function LoadingButton({
  loading,
  children,
  loadingText,
  disabled,
  onClick,
  type = "button",
  variant = "default",
  size = "default",
  className
}: LoadingButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "relative transition-all duration-sm",
        loading && "text-transparent",
        className
      )}
    >
      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.16 }}
          className="absolute inset-0 flex items-center justify-center gap-2"
        >
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {loadingText && (
            <span className="text-sm font-medium">
              {loadingText}
            </span>
          )}
        </motion.div>
      )}
      
      {/* Button Content */}
      <motion.span
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.16 }}
      >
        {children}
      </motion.span>
    </Button>
  );
}