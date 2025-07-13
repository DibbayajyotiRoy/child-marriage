
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingDisplayProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingDisplay({ 
  message = 'Loading...', 
  className,
  size = 'md' 
}: LoadingDisplayProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn('flex items-center justify-center gap-2 p-4', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      <span className="text-muted-foreground">{message}</span>
    </div>
  );
}
