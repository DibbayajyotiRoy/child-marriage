
import React from 'react';
import { cn } from '@/lib/utils';

interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  glow?: boolean;
}

export function InteractiveCard({ 
  children, 
  className, 
  hover = true, 
  glow = false, 
  ...props 
}: InteractiveCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border bg-card/60 backdrop-blur-sm text-card-foreground shadow-lg transition-all duration-300",
        hover && "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20",
        glow && "ring-1 ring-primary/10 hover:ring-primary/20",
        "group cursor-pointer",
        className
      )}
      {...props}
    >
      {glow && (
        <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-sm" />
      )}
      <div className="relative rounded-xl bg-card/80 backdrop-blur-sm p-6 h-full">
        {children}
      </div>
    </div>
  );
}
