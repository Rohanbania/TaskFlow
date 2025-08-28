
'use client';

import type { Task } from '@/lib/types';
import { TaskCalendar } from './TaskCalendar';


interface TaskReportCardProps {
  task: Task;
}

export function TaskReportCard({
  task,
}: TaskReportCardProps) {
  return (
        <div className="p-6 rounded-2xl bg-background text-foreground shadow-2xl border border-border/50 font-sans">
            <div className="bg-background rounded-lg border border-border">
                <TaskCalendar task={task} />
            </div>

            {task.description && 
                <div className='mt-6'>
                    <h4 className="font-headline font-semibold mb-2 text-foreground/80">Description</h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border border-border">{task.description}</p>
                </div>
            }
        </div>
  );
}
