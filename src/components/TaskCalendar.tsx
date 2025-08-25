'use client';

import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths, isWithinInterval, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';
import { Badge } from './ui/badge';

interface TaskCalendarProps {
  task: Task;
}

type DayStatus = 'scheduled' | 'completed-on-time' | 'completed-late' | 'missed' | 'today' | 'none';

export function TaskCalendar({ task }: TaskCalendarProps) {
  const today = new Date();
  const calendarMonth = task.completionDate ? new Date(task.completionDate) : today;
  
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(calendarMonth);
    const end = endOfMonth(calendarMonth);
    return eachDayOfInterval({ start, end });
  }, [calendarMonth]);

  const startingDayOfMonth = getDay(startOfMonth(calendarMonth));

  const getDayStatus = (day: Date): DayStatus => {
    // If the day is today, its primary status is 'today'.
    if (isToday(day)) return 'today';

    const dayOfWeek = getDay(day);

    const isRecurringToday = task.recurringDays && task.recurringDays.length > 0 && task.recurringDays.includes(dayOfWeek);

    const isWithinDateRange = task.startDate && task.endDate ? isWithinInterval(day, {
        start: new Date(task.startDate),
        end: new Date(task.endDate)
    }) : true;
    
    let isScheduled = false;
    if (task.startDate && !task.recurringDays?.length) {
        const start = new Date(task.startDate);
        start.setHours(0,0,0,0);
        const end = task.endDate ? new Date(task.endDate) : start;
        end.setHours(23,59,59,999);
        isScheduled = isWithinInterval(day, { start, end });
    } else if (task.recurringDays?.length) {
        isScheduled = isWithinDateRange && isRecurringToday;
    }


    const completionDate = task.completionDate ? new Date(task.completionDate) : null;

    if (completionDate && isSameDay(day, completionDate)) {
        let dueDate = new Date(day);
        if(task.endTime) {
            const [hours, minutes] = task.endTime.split(':');
            dueDate.setHours(parseInt(hours), parseInt(minutes));
        } else {
            dueDate.setHours(23, 59, 59);
        }
        return completionDate <= dueDate ? 'completed-on-time' : 'completed-late';
    }

    if(isScheduled && isPast(day)) {
        return 'missed'
    }

    if (isScheduled) return 'scheduled';

    return 'none';
  };

  const statusStyles: Record<DayStatus, string> = {
    'none': 'bg-white text-black',
    'today': 'bg-blue-100 text-blue-800 border-2 border-blue-500',
    'scheduled': 'bg-gray-200 text-gray-700',
    'completed-on-time': 'bg-green-200 text-green-800 font-bold',
    'completed-late': 'bg-yellow-200 text-yellow-800 font-bold',
    'missed': 'bg-red-200 text-red-800 font-bold line-through',
  };
  
  const statusLegend: Record<string, string> = {
    'Scheduled': 'bg-gray-200',
    'Completed On Time': 'bg-green-200',
    'Completed Late': 'bg-yellow-200',
    'Missed': 'bg-red-200',
    'Today': 'bg-blue-100 border-2 border-blue-500',
  }

  return (
    <div className="p-4 border rounded-lg bg-white text-black">
      <h3 className="text-lg font-bold mb-2">{task.title}</h3>
      {task.description && <p className="text-sm text-gray-600 mb-4">{task.description}</p>}

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-lg">{format(calendarMonth, 'MMMM yyyy')}</h4>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mt-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 mt-1">
          {Array.from({ length: startingDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {daysInMonth.map(day => {
            const status = getDayStatus(day);
            return (
              <div
                key={day.toString()}
                className={cn(
                  'h-10 w-10 flex items-center justify-center rounded-full text-sm',
                  statusStyles[status]
                )}
              >
                {format(day, 'd')}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs mt-4">
          {Object.entries(statusLegend).map(([label, colorClass]) => (
            <div key={label} className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-full", colorClass)} />
                <span>{label}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
