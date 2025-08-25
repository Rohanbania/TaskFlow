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

type TaskStatus = 'completed-on-time' | 'completed-late' | 'incomplete-overdue' | 'pending';

function getTaskStatus(task: Task): TaskStatus {
  const now = new Date();
  const dueDate = task.endDate ? new Date(task.endDate) : (task.startDate ? new Date(task.startDate) : null);
  if (dueDate && task.endTime) {
     const [hours, minutes] = task.endTime.split(':');
     dueDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 59, 999);
  } else if (dueDate) {
    dueDate.setHours(23, 59, 59, 999);
  }

  if (task.completed && task.completionDate) {
    const completionDate = new Date(task.completionDate);
    return completionDate <= dueDate! ? 'completed-on-time' : 'completed-late';
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

    const statusText: Record<TaskStatus, string> = {
        'completed-on-time': 'Completed On Time',
        'completed-late': 'Completed Late',
        'incomplete-overdue': 'Overtime',
        'pending': 'Pending',
    }

    const statusIcons: Record<TaskStatus, React.ReactNode> = {
        'completed-on-time': <CheckCircle2 className="h-5 w-5 text-green-500" />,
        'completed-late': <AlertTriangle className="h-5 w-5 text-yellow-500" />,
        'incomplete-overdue': <AlertTriangle className="h-5 w-5 text-red-500" />,
        'pending': <ListTodo className="h-5 w-5 text-gray-500" />
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
            <div className="flex items-center gap-4">
                {statusIcons[status]}
                <Badge variant="outline" className={cn(
                    "text-lg",
                    status === 'completed-on-time' && 'text-green-600 border-green-600',
                    status === 'completed-late' && 'text-yellow-600 border-yellow-600',
                    status === 'incomplete-overdue' && 'text-red-600 border-red-600',
                )}>
                    {statusText[status]}
                </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="font-semibold">Due Date:</div>
                <div>{getDueDate()}</div>

                <div className="font-semibold">Completed Date:</div>
                <div>{task.completionDate ? format(new Date(task.completionDate), "PPP 'at' p") : 'Not completed'}</div>
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
