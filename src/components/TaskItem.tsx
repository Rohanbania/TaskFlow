'use client';

import { useContext, useState, useEffect } from 'react';
import { MoreVertical, Trash2, Wand2, Clock, AlertTriangle, Calendar, Timer, BarChart2, Radio, Pencil, CheckCircle, Repeat } from 'lucide-react';
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
import { format, formatDistanceToNow, isWithinInterval } from 'date-fns';
import { TaskAnalyticsDialog } from './TaskAnalyticsDialog';
import { EditTaskDialog } from './EditTaskDialog';

interface TaskItemProps {
  flowId: string;
  task: Task;
}

const WEEKDAY_MAP = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function TaskItem({ flowId, task }: TaskItemProps) {
  const { updateTask, deleteTask } = useContext(FlowsContext);
  const [isResourcesDialogOpen, setIsResourcesDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [isOverdue, setIsOverdue] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const today = now.getDay(); // Sunday - 0, Monday - 1, etc.
  
      // Task is not recurring, or today is not a recurring day, so no status.
      if (!task.recurringDays || task.recurringDays.length === 0 || !task.recurringDays.includes(today)) {
        setIsLive(false);
        setIsOverdue(false);
        setHasEnded(false);
        setCountdown('');
        return;
      }
      
      const startDate = task.startDate ? new Date(task.startDate) : null;
      const endDate = task.endDate ? new Date(task.endDate) : null;

      // Check if current date is within the overall start/end date range of the task
      if (startDate && endDate) {
          const dateRange = { start: new Date(startDate.setHours(0,0,0,0)), end: new Date(endDate.setHours(23,59,59,999)) };
          if (!isWithinInterval(now, dateRange)) {
            setIsLive(false);
            setHasEnded(now > dateRange.end); // Task period has ended
            return;
          }
      } else if (startDate) {
          if (now < new Date(startDate.setHours(0,0,0,0))) {
             setIsLive(false);
             return;
          }
      } else if (endDate) {
          if (now > new Date(endDate.setHours(23,59,59,999))) {
              setIsLive(false);
              setHasEnded(true);
              return;
          }
      }
  
      // Construct today's start and end time
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      if (task.startTime) {
        const [hours, minutes] = task.startTime.split(':');
        todayStart.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      }
  
      const todayEnd = new Date();
      if (task.endTime) {
        const [hours, minutes] = task.endTime.split(':');
        todayEnd.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      } else {
        todayEnd.setHours(23, 59, 59, 999);
      }
      
      const live = !task.completed && isWithinInterval(now, { start: todayStart, end: todayEnd });
      setIsLive(live);
  
      const overdue = !task.completed && now > todayEnd;
      setIsOverdue(overdue);
      
      const ended = !!(task.completed);
      setHasEnded(ended);
  
      // Countdown status for today
      if (now < todayStart) {
        setCountdown(formatDistanceToNow(todayStart, { addSuffix: true }));
      } else {
        setCountdown('');
      }
    };
  
    checkStatus();
    const interval = setInterval(checkStatus, 1000); // Check every second for countdown
  
    return () => clearInterval(interval);
  }, [task.startDate, task.endDate, task.startTime, task.endTime, task.completed, task.recurringDays]);


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

  const formatRecurringDays = () => {
    if (!task.recurringDays || task.recurringDays.length === 0) return null;
    if (task.recurringDays.length === 7) return 'Everyday';
    
    const sortedDays = [...task.recurringDays].sort();
    if (JSON.stringify(sortedDays) === JSON.stringify([1,2,3,4,5])) return 'Weekdays';
    if (JSON.stringify(sortedDays) === JSON.stringify([0,6])) return 'Weekends';

    return sortedDays.map(day => WEEKDAY_MAP[day]).join(', ');
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
            {formatRecurringDays() && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Repeat className="h-3 w-3" />
                    <span>{formatRecurringDays()}</span>
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
