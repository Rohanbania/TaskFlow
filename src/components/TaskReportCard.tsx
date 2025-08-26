'use client';

import { Badge } from './ui/badge';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, ListTodo } from 'lucide-react';
import { format } from 'date-fns';
import { TaskCalendar } from './TaskCalendar';

type TaskStatus = 'completed-on-time' | 'completed-late' | 'incomplete-overdue' | 'pending';

function getTaskStatus(task: Task): TaskStatus {
  const now = new Date();
  
  let dueDate: Date | null = null;
  if (task.endDate || task.startDate) {
    dueDate = new Date(task.endDate || task.startDate!);
    if (task.endTime) {
       const [hours, minutes] = task.endTime.split(':');
       dueDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 59, 999);
    } else {
      dueDate.setHours(23, 59, 59, 999);
    }
  }

  if (task.completed && task.completionDate) {
    // For recurring tasks, the due date is based on the completion date's day, not a fixed end date.
    if (task.recurringDays && task.recurringDays.length > 0) {
        const completionDate = new Date(task.completionDate);
        dueDate = new Date(completionDate);
         if (task.endTime) {
            const [hours, minutes] = task.endTime.split(':');
            dueDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 59, 999);
        } else {
            dueDate.setHours(23, 59, 59, 999);
        }
        return completionDate <= dueDate ? 'completed-on-time' : 'completed-late';
    }
    
    if (!dueDate) {
        return 'completed-on-time';
    }
    const completionDate = new Date(task.completionDate);
    return completionDate <= dueDate ? 'completed-on-time' : 'completed-late';
  }

  if (dueDate && now > dueDate) {
    return 'incomplete-overdue';
  }

  return 'pending';
}

interface TaskReportCardProps {
  task: Task;
}

export function TaskReportCard({
  task,
}: TaskReportCardProps) {
    const status = getTaskStatus(task);

    const statusInfo: Record<TaskStatus, {text: string, icon: React.ReactNode, className: string}> = {
        'completed-on-time': { 
            text: 'Completed On Time',
            icon: <CheckCircle2 className="h-5 w-5" />,
            className: 'bg-green-100 text-green-800 border-green-300'
        },
        'completed-late': {
            text: 'Completed Late',
            icon: <AlertTriangle className="h-5 w-5" />,
            className: 'bg-yellow-100 text-yellow-800 border-yellow-300'
        },
        'incomplete-overdue': {
            text: 'Overtime',
            icon: <AlertTriangle className="h-5 w-5" />,
            className: 'bg-red-100 text-red-800 border-red-300'
        },
        'pending': {
            text: 'Pending',
            icon: <ListTodo className="h-5 w-5" />,
            className: 'bg-gray-100 text-gray-800 border-gray-300'
        }
    }
    
    const getDueDate = () => {
        if (!task.endDate && !task.startDate) return 'Not set';
        const date = new Date(task.endDate || task.startDate!);
        if (task.endTime) {
            const [hours, minutes] = task.endTime.split(':');
            date.setHours(parseInt(hours), parseInt(minutes));
            return format(date, "PPP 'at' p");
        }
        return format(date, 'PPP');
    }

    const getStartDate = () => {
        if (!task.startDate) return 'Not set';
        const date = new Date(task.startDate);
        if (task.startTime) {
            const [hours, minutes] = task.startTime.split(':');
            date.setHours(parseInt(hours), parseInt(minutes));
            return format(date, "PPP 'at' p");
        }
        return format(date, 'PPP');
    }

  return (
        <div className="p-6 rounded-2xl bg-white text-black shadow-2xl border border-gray-100 font-sans">
            <div className="flex items-center justify-center mb-6">
                <Badge variant="outline" className={cn(
                    "text-base font-semibold gap-2 px-4 py-2 border-2",
                    statusInfo[status].className
                )}>
                    {statusInfo[status].icon}
                    <span>{statusInfo[status].text}</span>
                </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm rounded-lg border p-4 mb-6 bg-gray-50/50">
                <div className="font-semibold text-gray-500">Start Date:</div>
                <div className="font-medium text-gray-800">{getStartDate()}</div>

                <div className="font-semibold text-gray-500">Due Date:</div>
                <div className="font-medium text-gray-800">{getDueDate()}</div>

                <div className="font-semibold text-gray-500">Completed Date:</div>
                <div className="font-medium text-gray-800">{task.completionDate ? format(new Date(task.completionDate), "PPP 'at' p") : 'Not completed'}</div>
            </div>

            <div className="bg-white rounded-lg border">
                <TaskCalendar task={task} />
            </div>

            {task.description && 
                <div className='mt-6'>
                    <h4 className="font-headline font-semibold mb-2 text-gray-700">Description</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border">{task.description}</p>
                </div>
            }
        </div>
  );
}
