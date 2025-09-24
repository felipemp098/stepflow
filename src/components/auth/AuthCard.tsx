import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  showLogo?: boolean;
}

export function AuthCard({ 
  title, 
  subtitle, 
  children, 
  className,
  showLogo = true 
}: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
        className={cn(
          "w-full max-w-md bg-card border border-border-hairline rounded-card shadow-lg shadow-black/[0.12] dark:shadow-black/[0.24]",
          className
        )}
      >
        {/* Header */}
        <div className="px-6 pt-8 pb-6 text-center border-b border-border-hairline">
          {showLogo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-semibold text-primary">Stepflow</h1>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
          >
            <h2 className="text-xl font-semibold text-fg-1 mb-2">{title}</h2>
            {subtitle && (
              <p className="text-sm text-fg-3">{subtitle}</p>
            )}
          </motion.div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="p-6"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}