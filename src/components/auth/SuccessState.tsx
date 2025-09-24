import React from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SuccessStateProps {
  title: string;
  message: string;
  email?: string;
  actionLabel?: string;
  onAction?: () => void;
  showEmailIcon?: boolean;
  className?: string;
}

export function SuccessState({
  title,
  message,
  email,
  actionLabel,
  onAction,
  showEmailIcon = false,
  className
}: SuccessStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      className={cn("text-center space-y-4", className)}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1, ease: [0.2, 0, 0, 1] }}
        className="flex justify-center"
      >
        {showEmailIcon ? (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
        ) : (
          <CheckCircle2 className="w-12 h-12 text-success" />
        )}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
        className="space-y-2"
      >
        <h3 className="text-lg font-semibold text-fg-1">{title}</h3>
        <div className="text-sm text-fg-2 leading-relaxed">
          {message}
          {email && (
            <span className="font-medium text-fg-1 block mt-1">{email}</span>
          )}
        </div>
      </motion.div>

      {/* Action Button */}
      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
        >
          <Button
            onClick={onAction}
            className="w-full"
            size="lg"
          >
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}