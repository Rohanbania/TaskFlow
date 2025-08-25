'use client';

import { useContext, useState, useEffect } from 'react';
import { MoreVertical, Trash2, Wand2, Clock, AlertTriangle, Calendar, Timer, BarChart2, Radio, Pencil, CheckCircle } from 'lucide-react';
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
import { EditTaskDialog } from './EditTaskDialog';

interface TaskItemProps {
  flowId: string;
  task: Task;
}

export function TaskItem({ flowId, task }: TaskItemProps) {
  const { updateTask, deleteTask } = useContext(FlowsContext);
  const [isResourcesDialogOpen, setIsResourcesDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [isOverdue, setIsOverdue] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const getTaskDateTime = (dateString: string | undefined, timeString: string | undefined): Date | null => {
        if (!dateString) return null;
        
        const date = new Date(dateString);
        // Date from string might be UTC, adjust to local timezone for correct day
        const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

        if (timeString) {
            const [hours, minutes] = timeString.split(':');
            localDate.setHours(parseInt(hours, 10));
            localDate.setMinutes(parseInt(minutes, 10));
            localDate.setSeconds(0, 0);
        } else {
            // This case needs to be handled by the caller, e.g., set to start/end of day
        }
        return localDate;
    }

    const checkStatus = () => {
      const now = new Date();

      let startDateTime: Date | null = getTaskDateTime(task.startDate, task.startTime);
      if(startDateTime && !task.startTime) {
          startDateTime.setHours(0, 0, 0, 0);
      }

      // If there is no end date, the end date is the start date
      let endDateTime: Date | null = getTaskDateTime(task.endDate || task.startDate, task.endTime);
      if(endDateTime && !task.endTime) {
          endDateTime.setHours(23, 59, 59, 999);
      }
      
      const overdue = endDateTime ? !task.completed && now > endDateTime : false;
      setIsOverdue(overdue);
      
      const live = startDateTime && endDateTime ? !task.completed && now >= startDateTime && now <= endDateTime : false;
      setIsLive(live);
      
      const ended = !!(endDateTime && task.completed && now > endDateTime);
      setHasEnded(ended);

      // Countdown status
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
    const startDate = task.startDate ? new Date(task.startDate) : null;
    const endDate = task.endDate ? new Date(task.endDate) : null;

    if (startDate && endDate) {
      // Adjust for timezone offset to show correct local date
      const adjustedStartDate = new Date(startDate.getTime() + startDate.getTimezoneOffset() * 60000);
      const adjustedEndDate = new Date(endDate.getTime() + endDate.getTimezoneOffset() * 60000);

      if (adjustedStartDate.toDateString() === adjustedEndDate.toDateString()) {
         return format(adjustedStartDate, "PPP");
      }
      return `${format(adjustedStartDate, "PPP")} - ${format(adjustedEndDate, "PPP")}`;
    }
    if (startDate) {
      const adjustedStartDate = new Date(startDate.getTime() + startDate.getTimezoneOffset() * 60000);
      return format(adjustedStartDate, "PPP");
    }
     if (endDate) {
      const adjustedEndDate = new Date(endDate.getTime() + endDate.getTimezoneOffset() * 60000);
      return format(adjustedEndDate, "PPP");
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
            {isLive && !isOverdue && (
              <Badge variant="default" className="gap-1 text-xs animate-pulse bg-green-600">
                <Radio className="h-3 w-3" />
                Live
              </Badge>
            )}
            {isOverdue && (
               <Badge variant="destructive" className="gap-1 text-xs">
                <AlertTriangle className="h-3 w-3" />
                Overtime
              </Badge>
            )}
            {hasEnded && (
              <Badge variant="outline" className="gap-1 text-xs">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Ended
              </Badge>
            )}
            {countdown && !isLive && !task.completed && (
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
            <EditTaskDialog flowId={flowId} task={task}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Task
                </DropdownMenuItem>
            </EditTaskDialog>
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
