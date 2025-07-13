
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedStatsProps {
  value: number;
  label: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function AnimatedStats({ 
  value, 
  label, 
  icon, 
  trend, 
  trendValue, 
  className 
}: AnimatedStatsProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <div>
            <div className="text-2xl font-bold tabular-nums">
              {displayValue.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        </div>
        {trend && trendValue && (
          <div className={cn("text-sm font-medium", getTrendColor())}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
          </div>
        )}
      </div>
    </div>
  );
}
