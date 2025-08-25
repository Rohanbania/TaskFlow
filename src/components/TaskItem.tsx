'use client';

import { useContext, useState, useEffect } from 'react';
import { MoreVertical, Trash2, Wand2, Clock, AlertTriangle, Calendar, Timer, BarChart2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { FlowsContext } from '@/contexts/FlowsContext';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SuggestResourcesDialog } from './SuggestResourcesDialog';
import { Badge } from './ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { TaskAnalyticsDialog } from './TaskAnalyticsDialog';

interface TaskItemProps {
  flowId: string;
  task: Task;
}

export function TaskItem({ flowId, task }: TaskItemProps) {
  const { updateTask, deleteTask } = useContext(FlowsContext);
  const [isResourcesDialogOpen, setIsResourcesDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [isOverdue, setIsOverdue] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const getTaskDateTime = (date: string | undefined, time: string | undefined): Date | null => {
      if (!date) return null;
      const dateTime = new Date(date);
      if (time) {
        const [hours, minutes] = time.split(':');
        dateTime.setHours(parseInt(hours, 10));
        dateTime.setMinutes(parseInt(minutes, 10));
        dateTime.setSeconds(0, 0);
      } else {
        // If no time, for startDate it is start of day, for endDate it is end of day
        if (date === task.startDate) {
          dateTime.setHours(0,0,0,0);
        } else {
          dateTime.setHours(23,59,59,999);
        }
      }
      return dateTime;
    }

    const startDateTime = getTaskDateTime(task.startDate, task.startTime);
    const endDateTime = getTaskDateTime(task.endDate || task.startDate, task.endTime);

    const checkStatus = () => {
      const now = new Date();
      if (endDateTime && !task.completed && now > endDateTime) {
        setIsOverdue(true);
      } else {
        setIsOverdue(false);
      }

      if (startDateTime && now < startDateTime) {
        setCountdown(formatDistanceToNow(startDateTime, { addSuffix: true }));
      } else {
        setCountdown('');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1000); // Check every second for countdown

    return () => clearInterval(interval);
  }, [task.startDate, task.endDate, task.startTime, task.endTime, task.completed]);


  const handleCheckedChange = (checked: boolean) => {
    updateTask(flowId, task.id, { completed: checked });
  };

  const formatDateRange = () => {
    if (task.startDate && task.endDate) {
      if (task.startDate === task.endDate) {
        return format(new Date(task.startDate), "PPP");
      }
      return `${format(new Date(task.startDate), "PPP")} - ${format(new Date(task.endDate), "PPP")}`;
    }
    if (task.startDate) {
      return format(new Date(task.startDate), "PPP");
    }
    return null;
  }

  return (
    <div className="flex w-full items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={handleCheckedChange}
          className="mt-1 h-5 w-5 flex-shrink-0"
          aria-labelledby={`task-title-${task.id}`}
        />
        <div className="grid gap-1.5">
          <label
            id={`task-title-${task.id}`}
            htmlFor={`task-${task.id}`}
            className={cn(
              'font-medium transition-colors',
              task.completed ? 'text-muted-foreground line-through' : 'text-card-foreground'
            )}
          >
            {task.title}
          </label>
          {task.description && (
            <p className={cn(
              'text-sm text-muted-foreground',
              task.completed && 'line-through'
            )}>
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {(task.startDate || task.endDate) && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDateRange()}</span>
                </div>
            )}
            {(task.startTime || task.endTime) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {task.startTime || '...'} - {task.endTime || '...'}
                </span>
              </div>
            )}
            {isOverdue && (
               <Badge variant="destructive" className="gap-1 text-xs">
                <AlertTriangle className="h-3 w-3" />
                Overtime
              </Badge>
            )}
            {countdown && !task.completed && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Timer className="h-3 w-3" />
                Starts {countdown}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <SuggestResourcesDialog
        open={isResourcesDialogOpen}
        onOpenChange={setIsResourcesDialogOpen}
        taskDescription={task.title}
      />
      
       <TaskAnalyticsDialog
        open={isAnalyticsDialogOpen}
        onOpenChange={setIsAnalyticsDialogOpen}
        task={task}
      />

      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Task options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsAnalyticsDialogOpen(true)}>
              <BarChart2 className="mr-2 h-4 w-4" />
              Analytics
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsResourcesDialogOpen(true)}>
              <Wand2 className="mr-2 h-4 w-4" />
              Suggest Resources
            </DropdownMenuItem>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{task.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTask(flowId, task.id)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
