
'use client';

import { useContext, useState, useEffect, useMemo } from 'react';
import { MoreVertical, Trash2, Wand2, BarChart2, Pencil, Clock } from 'lucide-react';
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
import { TaskAnalyticsDialog } from './TaskAnalyticsDialog';
import { EditTaskDialog } from './EditTaskDialog';
import { format, startOfDay, parse } from 'date-fns';
import { TaskCountdown } from './TaskCountdown';

interface TaskItemProps {
  flowId: string;
  task: Task;
}

export function TaskItem({ flowId, task }: TaskItemProps) {
  const { deleteTask, toggleTaskCompletion } = useContext(FlowsContext);
  const [isResourcesDialogOpen, setIsResourcesDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);

  const isCompletedToday = useMemo(() => {
    const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
    return task.completedDates?.includes(todayStr);
  }, [task.completedDates]);

  const handleCheckedChange = () => {
    toggleTaskCompletion(flowId, task.id);
  };
  
  const formatTime = (timeStr: string) => {
      try {
        return format(parse(timeStr, 'HH:mm', new Date()), 'h:mm a');
      } catch (e) {
        return 'Invalid Time'
      }
  }

  return (
    <div className="flex w-full items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <Checkbox
          id={`task-${task.id}`}
          checked={isCompletedToday}
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
              isCompletedToday ? 'text-muted-foreground line-through' : 'text-card-foreground'
            )}
          >
            {task.title}
          </label>
          {task.description && (
            <p className={cn(
              'text-sm text-muted-foreground',
              isCompletedToday && 'line-through'
            )}>
              {task.description}
            </p>
          )}
           <div className='flex items-center gap-4'>
             {task.startTime && task.endTime && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatTime(task.startTime)} - {formatTime(task.endTime)}</span>
              </div>
            )}
            <TaskCountdown startTime={task.startTime} endTime={task.endTime} />
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
