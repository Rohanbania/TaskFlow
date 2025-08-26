
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
        <div className="p-6 rounded-2xl bg-white text-black shadow-2xl border border-gray-100 font-sans">
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
