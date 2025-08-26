'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Task } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { TaskReportCard } from './TaskReportCard';


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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Task Analytics</DialogTitle>
          <DialogDescription>
            Status and details for: "{task.title}"
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] -mx-6 px-6">
            <TaskReportCard task={task} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
