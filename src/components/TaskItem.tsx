'use client';

import { useContext, useState, useEffect } from 'react';
import { MoreVertical, Trash2, Wand2, Clock, AlertTriangle } from 'lucide-react';
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

interface TaskItemProps {
  flowId: string;
  task: Task;
}

export function TaskItem({ flowId, task }: TaskItemProps) {
  const { updateTask, deleteTask } = useContext(FlowsContext);
  const [isResourcesDialogOpen, setIsResourcesDialogOpen] = useState(false);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const checkOverdue = () => {
      if (task.endTime && !task.completed) {
        const now = new Date();
        const endTimeParts = task.endTime.split(':');
        const endTimeDate = new Date();
        endTimeDate.setHours(parseInt(endTimeParts[0], 10));
        endTimeDate.setMinutes(parseInt(endTimeParts[1], 10));
        endTimeDate.setSeconds(0, 0);

        if (now > endTimeDate) {
          setIsOverdue(true);
        } else {
          setIsOverdue(false);
        }
      } else {
        setIsOverdue(false);
      }
    };

    checkOverdue();
    const interval = setInterval(checkOverdue, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [task.endTime, task.completed]);


  const handleCheckedChange = (checked: boolean) => {
    updateTask(flowId, task.id, { completed: checked });
  };

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
                Overdue
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

      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Task options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
