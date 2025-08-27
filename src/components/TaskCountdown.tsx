
'use client';

import { useState, useEffect } from 'react';
import { parse, differenceInSeconds, differenceInMilliseconds } from 'date-fns';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Timer } from 'lucide-react';

interface TaskCountdownProps {
  startTime?: string;
  endTime?: string;
}

// Helper to parse HSL strings and get the values
const parseHsl = (hslStr: string): [number, number, number] | null => {
    if (!hslStr) return null;
    const match = hslStr.match(/hsl\(([\d.]+) ([\d.]+)% ([\d.]+)%\)/);
    if (match) {
        return [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])];
    }
    const shorterMatch = hslStr.match(/([\d.]+) ([\d.]+)% ([\d.]+)%/);
     if (shorterMatch) {
        return [parseFloat(shorterMatch[1]), parseFloat(shorterMatch[2]), parseFloat(shorterMatch[3])];
    }
    return null;
}


export function TaskCountdown({ startTime, endTime }: TaskCountdownProps) {
  const [countdown, setCountdown] = useState('');
  const [status, setStatus] = useState<'pending' | 'live' | 'overdue'>('pending');
  const [dynamicStyle, setDynamicStyle] = useState<React.CSSProperties>({});
  
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColorStr = computedStyle.getPropertyValue('--primary').trim();
    const destructiveColorStr = computedStyle.getPropertyValue('--destructive').trim();
    
    const primaryHsl = parseHsl(primaryColorStr);
    const destructiveHsl = parseHsl(destructiveColorStr) || [0, 84.2, 60.2]; // Fallback to default red

    const interval = setInterval(() => {
      if (!startTime || !endTime || !primaryHsl) {
        setCountdown('');
        return;
      }

      const now = new Date();
      const todayStartTime = parse(startTime, 'HH:mm', new Date());
      const todayEndTime = parse(endTime, 'HH:mm', new Date());

      const isLive = now >= todayStartTime && now <= todayEndTime;
      const isPending = now < todayStartTime;
      const isOverdue = now > todayEndTime;

      if (isPending) {
        setStatus('pending');
        setDynamicStyle({});
        const secondsToStart = differenceInSeconds(todayStartTime, now);
        const hours = Math.floor(secondsToStart / 3600);
        const minutes = Math.floor((secondsToStart % 3600) / 60);
        const seconds = secondsToStart % 60;
        setCountdown(
          `Starts in ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      } else if (isLive) {
        setStatus('live');
        const totalDuration = differenceInMilliseconds(todayEndTime, todayStartTime);
        const remainingTime = differenceInMilliseconds(todayEndTime, now);
        const timeFraction = Math.max(0, remainingTime) / totalDuration;
        
        // Interpolate Hue and Lightness
        // We go from primary hue to destructive hue (e.g., blue -> red)
        const h = primaryHsl[0] + (destructiveHsl[0] - primaryHsl[0]) * (1 - timeFraction);
        const s = primaryHsl[1]; // Keep saturation constant
        const l = primaryHsl[2] + (destructiveHsl[2] - primaryHsl[2]) * (1 - timeFraction);

        setDynamicStyle({ 
            backgroundColor: `hsl(${h}, ${s}%, ${l}%)`,
            transition: 'background-color 1s linear',
        });
        
        const secondsToEnd = differenceInSeconds(todayEndTime, now);
        const hours = Math.floor(secondsToEnd / 3600);
        const minutes = Math.floor((secondsToEnd % 3600) / 60);
        const seconds = secondsToEnd % 60;
        setCountdown(
          `Ends in ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      } else if (isOverdue) {
        setStatus('overdue');
        setDynamicStyle({});
        const secondsOverdue = differenceInSeconds(now, todayEndTime);
        const hours = Math.floor(secondsOverdue / 3600);
        const minutes = Math.floor((secondsOverdue % 3600) / 60);
        const seconds = secondsOverdue % 60;
        setCountdown(
          `Overdue by ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  if (!countdown) {
    return null;
  }
  
  const getVariant = () => {
    if (status === 'live') return 'default';
    if (status === 'overdue') return 'destructive';
    return 'secondary';
  }

  return (
    <Badge
      variant={getVariant()}
      className={cn(
        'flex items-center gap-1.5 text-xs',
        status === 'live' && 'animate-pulse text-primary-foreground'
      )}
      style={status === 'live' ? dynamicStyle : {}}
    >
      <Timer className="h-3 w-3" />
      <span>{countdown}</span>
    </Badge>
  );
}
