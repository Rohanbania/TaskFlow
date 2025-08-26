
'use client';

import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isWithinInterval, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';
import { Calendar, Check, Clock, AlertTriangle, X } from 'lucide-react';


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
    const dayOfWeek = getDay(day);

    const isRecurringToday = task.recurringDays && task.recurringDays.length > 0 && task.recurringDays.includes(dayOfWeek);

    const isWithinDateRange = task.startDate ? isWithinInterval(day, {
        start: new Date(new Date(task.startDate).setHours(0,0,0,0)),
        end: new Date(task.endDate ? new Date(task.endDate).setHours(23,59,59,999) : new Date(task.startDate).setHours(23,59,59,999))
    }) : true;
    
    let isScheduled = false;
    if (task.recurringDays?.length) {
        isScheduled = isWithinDateRange && isRecurringToday;
    } else if (task.startDate) {
        isScheduled = isWithinDateRange;
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

    if(isScheduled && isPast(day) && !isToday(day)) {
        return 'missed'
    }

    if (isScheduled) return 'scheduled';
    
    if (isToday(day)) return 'today';

    return 'none';
  };

  const statusStyles: Record<DayStatus, string> = {
    'none': 'text-gray-400',
    'today': 'bg-primary text-primary-foreground',
    'scheduled': 'bg-gray-100 text-gray-800',
    'completed-on-time': 'bg-green-500 text-white',
    'completed-late': 'bg-yellow-500 text-white',
    'missed': 'bg-red-500 text-white',
  };
  
  const statusLegend: {label: string, icon: React.ReactNode, className: string}[] = [
    { label: 'Completed On Time', icon: <Check className="h-4 w-4" />, className: 'bg-green-500 text-white' },
    { label: 'Completed Late', icon: <AlertTriangle className="h-4 w-4" />, className: 'bg-yellow-500 text-white' },
    { label: 'Missed', icon: <X className="h-4 w-4" />, className: 'bg-red-500 text-white' },
    { label: 'Scheduled', icon: <div className="w-3 h-3 rounded-full bg-gray-300" />, className: '' },
    { label: 'Today', icon: <div className="w-3 h-3 rounded-full bg-primary" />, className: '' },
  ]

  return (
    <div className="p-6 rounded-2xl bg-white text-black shadow-2xl border border-gray-100 font-sans">
        <div className="mb-4 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-bold font-headline text-gray-800">{task.title}</h3>
            {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
        </div>

        <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-4 text-sm text-gray-600">
                {(task.startDate || task.endDate) && (
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                            {task.startDate ? format(new Date(task.startDate), 'MMM d, y') : '...'} - {task.endDate ? format(new Date(task.endDate), 'MMM d, y') : '...'}
                        </span>
                    </div>
                )}
                {(task.startTime || task.endTime) && (
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{task.startTime} - {task.endTime}</span>
                    </div>
                )}
             </div>
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
