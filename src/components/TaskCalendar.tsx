
'use client';

import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isPast, isToday, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';
import { Check, X } from 'lucide-react';


interface TaskCalendarProps {
  task: Task;
  month?: Date;
}

type DayStatus = 'completed' | 'missed' | 'pending' | 'today' | 'none';

export function TaskCalendar({ task, month }: TaskCalendarProps) {
  const today = startOfDay(new Date());
  const calendarMonth = month || today;
  
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(calendarMonth);
    const end = endOfMonth(calendarMonth);
    return eachDayOfInterval({ start, end });
  }, [calendarMonth]);

  const startingDayOfMonth = getDay(startOfMonth(calendarMonth));

  const getDayStatus = (day: Date): DayStatus => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const isCompleted = task.completedDates?.includes(dayStr);

    if (isCompleted) {
        return 'completed';
    }

    if (isPast(day) && !isToday(day)) {
        return 'missed'
    }

    if(isToday(day)) {
        return 'today'
    }

    return 'pending';
  };

  const statusStyles: Record<DayStatus, string> = {
    'none': 'text-gray-400',
    'today': 'bg-primary text-primary-foreground',
    'pending': 'bg-gray-100 text-gray-800',
    'completed': 'bg-green-500 text-white',
    'missed': 'bg-red-500 text-white',
  };
  
  const statusLegend: {label: string, icon: React.ReactNode, className: string}[] = [
    { label: 'Completed', icon: <Check className="h-4 w-4" />, className: 'bg-green-500 text-white' },
    { label: 'Missed', icon: <X className="h-4 w-4" />, className: 'bg-red-500 text-white' },
    { label: 'Today', icon: <div className="w-3 h-3 rounded-full bg-primary" />, className: '' },
    { label: 'Pending', icon: <div className="w-3 h-3 rounded-full bg-gray-300" />, className: '' },
  ]

  return (
    <div className="p-6 rounded-2xl bg-white text-black shadow-2xl border border-gray-100 font-sans">
        <div className="mb-4 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-bold font-headline text-gray-800">{task.title}</h3>
            {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
        </div>

        <div>
            <div className="flex items-center justify-center mb-4">
            <h4 className="font-headline font-semibold text-xl text-gray-700">{format(calendarMonth, 'MMMM yyyy')}</h4>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-400 font-bold uppercase mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day}>{day}</div>
            ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startingDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
            ))}
            {daysInMonth.map(day => {
                const status = getDayStatus(day);
                return (
                <div
                    key={day.toString()}
                    className={cn(
                    'h-10 w-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ease-in-out',
                    statusStyles[status],
                    isToday(day) && 'border-2 border-primary shadow-lg',
                    status !== 'none' && 'shadow-md'
                    )}
                >
                    {format(day, 'd')}
                </div>
                );
            })}
            </div>
        </div>
      
        <div className="mt-6 pt-4 border-t border-gray-200">
            <h5 className="font-headline text-sm font-semibold text-gray-600 mb-3">Legend</h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
            {statusLegend.map(({label, icon, className}) => (
                <div key={label} className="flex items-center gap-2">
                    <div className={cn("w-5 h-5 rounded-md flex items-center justify-center", className)}>
                        {icon}
                    </div>
                    <span className="text-gray-600">{label}</span>
                </div>
            ))}
            </div>
        </div>
    </div>
  );
}
