
'use client';

import { useState, useEffect } from 'react';
import { parse, differenceInSeconds } from 'date-fns';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Timer } from 'lucide-react';

interface TaskCountdownProps {
  startTime?: string;
  endTime?: string;
}

export function TaskCountdown({ startTime, endTime }: TaskCountdownProps) {
  const [countdown, setCountdown] = useState('');
  const [status, setStatus] = useState<'pending' | 'live' | 'overdue'>('pending');

  useEffect(() => {
    if (!startTime || !endTime) {
      setCountdown('');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const todayStartTime = parse(startTime, 'HH:mm', new Date());
      const todayEndTime = parse(endTime, 'HH:mm', new Date());

      const isLive = now >= todayStartTime && now <= todayEndTime;
      const isPending = now < todayStartTime;
      const isOverdue = now > todayEndTime;

      if (isPending) {
        setStatus('pending');
        const secondsToStart = differenceInSeconds(todayStartTime, now);
        const hours = Math.floor(secondsToStart / 3600);
        const minutes = Math.floor((secondsToStart % 3600) / 60);
        const seconds = secondsToStart % 60;
        setCountdown(
          `Starts in ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      } else if (isLive) {
        setStatus('live');
        const secondsToEnd = differenceInSeconds(todayEndTime, now);
        const hours = Math.floor(secondsToEnd / 3600);
        const minutes = Math.floor((secondsToEnd % 3600) / 60);
        const seconds = secondsToEnd % 60;
        setCountdown(
          `Ends in ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      } else if (isOverdue) {
        setStatus('overdue');
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

  return (
    <Badge
      variant={status === 'live' ? 'default' : (status === 'overdue' ? 'destructive': 'secondary')}
      className={cn(
        'flex items-center gap-1.5 text-xs',
        status === 'live' && 'animate-pulse'
      )}
    >
      <Timer className="h-3 w-3" />
      <span>{countdown}</span>
    </Badge>
  );
}
