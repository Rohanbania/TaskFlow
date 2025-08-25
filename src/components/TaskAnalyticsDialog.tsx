'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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

interface TaskAnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

export function TaskAnalyticsDialog({
  open,
  onOpenChange,
  task,
}: TaskAnalyticsDialogProps) {
    const status = getTaskStatus(task);

    const statusInfo: Record<TaskStatus, {text: string, icon: React.ReactNode, className: string}> = {
        'completed-on-time': { 
            text: 'Completed On Time',
            icon: <CheckCircle2 className="h-5 w-5" />,
            className: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700'
        },
        'completed-late': {
            text: 'Completed Late',
            icon: <AlertTriangle className="h-5 w-5" />,
            className: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700'
        },
        'incomplete-overdue': {
            text: 'Overtime',
            icon: <AlertTriangle className="h-5 w-5" />,
            className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700'
        },
        'pending': {
            text: 'Pending',
            icon: <ListTodo className="h-5 w-5" />,
            className: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600'
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Task Analytics</DialogTitle>
          <DialogDescription>
            Status and details for: "{task.title}"
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-6">
            <div className="flex items-center justify-center">
                <Badge variant="outline" className={cn(
                    "text-base font-semibold gap-2 px-4 py-2 border-2",
                    statusInfo[status].className
                )}>
                    {statusInfo[status].icon}
                    <span>{statusInfo[status].text}</span>
                </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm rounded-lg border p-4">
                <div className="font-semibold text-muted-foreground">Start Date:</div>
                <div className="font-medium">{getStartDate()}</div>

                <div className="font-semibold text-muted-foreground">Due Date:</div>
                <div className="font-medium">{getDueDate()}</div>

                <div className="font-semibold text-muted-foreground">Completed Date:</div>
                <div className="font-medium">{task.completionDate ? format(new Date(task.completionDate), "PPP 'at' p") : 'Not completed'}</div>
            </div>

            <div className="bg-background rounded-lg border">
                <TaskCalendar task={task} />
            </div>

             {task.description && 
                <div>
                     <h4 className="font-semibold mb-2 text-sm">Description</h4>
                     <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">{task.description}</p>
                </div>
             }
        </div>
      </DialogContent>
    </Dialog>
  );
}
