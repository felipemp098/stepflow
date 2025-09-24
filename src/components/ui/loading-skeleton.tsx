import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "default" | "card" | "text" | "avatar" | "button";
  animate?: boolean;
}

export function LoadingSkeleton({ 
  className, 
  variant = "default",
  animate = true 
}: LoadingSkeletonProps) {
  const baseClasses = "bg-surface-1 rounded";
  
  const variantClasses = {
    default: "h-4 w-full",
    card: "h-32 w-full",
    text: "h-4 w-3/4",
    avatar: "h-10 w-10 rounded-full",
    button: "h-9 w-20"
  };

  const skeletonElement = (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
    />
  );

  if (!animate) {
    return skeletonElement;
  }

  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ 
        opacity: [0.6, 1, 0.6],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
    />
  );
}

interface LoadingCardProps {
  className?: string;
  showAvatar?: boolean;
  lines?: number;
}

export function LoadingCard({ 
  className, 
  showAvatar = false,
  lines = 3 
}: LoadingCardProps) {
  return (
    <div className={cn("p-6 space-y-4", className)}>
      {showAvatar && (
        <div className="flex items-center gap-3">
          <LoadingSkeleton variant="avatar" />
          <div className="space-y-2 flex-1">
            <LoadingSkeleton variant="text" className="w-1/3" />
            <LoadingSkeleton variant="text" className="w-1/4" />
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <LoadingSkeleton 
            key={i} 
            variant="text" 
            className={i === lines - 1 ? "w-1/2" : "w-full"} 
          />
        ))}
      </div>
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  className,
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
        className={cn(
          "border-2 border-primary border-t-transparent rounded-full",
          sizeClasses[size]
        )}
      />
      {text && (
        <span className="text-sm text-fg-2 font-medium">
          {text}
        </span>
      )}
    </div>
  );
}

interface LoadingPageProps {
  title?: string;
  description?: string;
  showCards?: boolean;
  cardCount?: number;
}

export function LoadingPage({ 
  title = "Carregando...",
  description = "Aguarde enquanto carregamos seus dados",
  showCards = true,
  cardCount = 4
}: LoadingPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <LoadingSkeleton variant="text" className="h-8 w-48" />
        <LoadingSkeleton variant="text" className="h-4 w-96" />
      </div>

      {/* Cards Grid */}
      {showCards && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: cardCount }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.2, 
                delay: i * 0.1,
                ease: [0.2, 0, 0, 1]
              }}
              className="bg-background border border-hairline rounded-lg shadow-card-md"
            >
              <LoadingCard 
                showAvatar={i % 2 === 0}
                lines={i % 3 === 0 ? 4 : 3}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
