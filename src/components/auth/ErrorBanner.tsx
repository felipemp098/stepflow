import React from "react";
import { AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorBannerProps {
  message: string;
  onClose?: () => void;
  className?: string;
}

export function ErrorBanner({ message, onClose, className }: ErrorBannerProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
        className={cn(
          "mb-4 p-3 rounded-input bg-error/10 border border-error/20 flex items-start gap-3",
          className
        )}
      >
        <AlertCircle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-error font-medium leading-relaxed">
            {message}
          </p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-6 h-6 -mt-1 -mr-1 hover:bg-error/10 text-error hover:text-error"
          >
            <X className="w-3 h-3" />
            <span className="sr-only">Fechar</span>
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}