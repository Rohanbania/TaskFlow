
'use client';

import { useState, useEffect } from 'react';
import { parse, differenceInSeconds } from 'date-fns';
import { Badge } from './ui/badge';

interface TaskCountdownProps {
  startTime?: string;
  endTime?: string;
}

export function TaskCountdown({ startTime, endTime }: TaskCountdownProps) {
  const [countdown, setCountdown] = useState('');
  const [status, setStatus] = useState<'pending' | 'live' | 'ended'>('pending');

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
      const isEnded = now > todayEndTime;

      if (isPending) {
        setStatus('pending');
        const secondsToStart = differenceInSeconds(todayStartTime, now);
        const hours = Math.floor(secondsToStart / 3600);
        const minutes = Math.floor((secondsToStart % 3600) / 60);
        const seconds = secondsToStart % 60;
        setCountdown(
          `Starts in: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      } else if (isLive) {
        setStatus('live');
        const secondsToEnd = differenceInSeconds(todayEndTime, now);
        const hours = Math.floor(secondsToEnd / 3600);
        const minutes = Math.floor((secondsToEnd % 3600) / 60);
        const seconds = secondsToEnd % 60;
        setCountdown(
          `Time left: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      } else if (isEnded) {
        setStatus('ended');
        setCountdown('Ended');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  if (!countdown || status === 'ended') {
    return null;
  }

  return (
    <Badge variant={status === 'live' ? 'destructive' : 'secondary'} className="text-xs">
      {countdown}
    </Badge>
  );
}
