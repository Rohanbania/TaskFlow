
'use client';

import { useEffect, useRef } from 'react';
import { differenceInMinutes, parse } from 'date-fns';
import type { Flow } from '@/lib/types';

const NOTIFICATION_WINDOW_MINUTES = 10;

export function useTaskNotifications(flows: Flow[]) {
  const notifiedTasksRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const checkTasksAndNotify = () => {
      const now = new Date();

      flows.forEach(flow => {
        flow.tasks.forEach(task => {
          if (task.startTime) {
            const startTime = parse(task.startTime, 'HH:mm', now);
            const minutesToStart = differenceInMinutes(startTime, now);
            const startNotificationId = `${task.id}-start`;

            if (minutesToStart === NOTIFICATION_WINDOW_MINUTES && !notifiedTasksRef.current.has(startNotificationId)) {
              new Notification(`'${task.title}' is starting soon!`, {
                body: `This task is scheduled to begin in ${NOTIFICATION_WINDOW_MINUTES} minutes.`,
                icon: '/download.png'
              });
              notifiedTasksRef.current.add(startNotificationId);
            }
          }

          if (task.endTime) {
            const endTime = parse(task.endTime, 'HH:mm', now);
            const minutesToEnd = differenceInMinutes(endTime, now);
            const endNotificationId = `${task.id}-end`;

            if (minutesToEnd === NOTIFICATION_WINDOW_MINUTES && !notifiedTasksRef.current.has(endNotificationId)) {
                new Notification(`'${task.title}' is ending soon!`, {
                  body: `This task is scheduled to end in ${NOTIFICATION_WINDOW_MINUTES} minutes.`,
                  icon: '/download.png'
                });
                notifiedTasksRef.current.add(endNotificationId);
            }
          }
        });
      });
    };

    // Check every 30 seconds
    const intervalId = setInterval(checkTasksAndNotify, 30 * 1000);

    return () => clearInterval(intervalId);
  }, [flows]);
}
