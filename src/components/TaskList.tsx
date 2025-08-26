'use client';

import { useState, useContext, type DragEvent } from 'react';
import { GripVertical } from 'lucide-react';
import { TaskItem } from './TaskItem';
import type { Task } from '@/lib/types';
import { FlowsContext } from '@/contexts/FlowsContext';
import { cn } from '@/lib/utils';

interface TaskListProps {
  flowId: string;
  tasks: Task[];
}

export function TaskList({ flowId, tasks }: TaskListProps) {
  const { reorderTasks } = useContext(FlowsContext);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedItemId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropTaskId: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === dropTaskId) return;

    const sourceIndex = tasks.findIndex((task) => task.id === draggedItemId);
    const destinationIndex = tasks.findIndex((task) => task.id === dropTaskId);

    if (sourceIndex > -1 && destinationIndex > -1) {
      reorderTasks(flowId, sourceIndex, destinationIndex);
    }
    setDraggedItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card p-12 text-center">
        <h3 className="text-lg font-semibold font-headline">No tasks yet!</h3>
        <p className="text-muted-foreground">Add a new task to get your flow started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          draggable
          onDragStart={(e) => handleDragStart(e, task.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, task.id)}
          onDragEnd={handleDragEnd}
          className={cn(
            'group relative flex cursor-grab items-start gap-2 rounded-lg bg-card p-4 shadow-sm transition-all duration-300',
            'hover:shadow-primary/20 hover:shadow-lg',
            'active:cursor-grabbing',
            draggedItemId === task.id ? 'opacity-50' : 'opacity-100'
          )}
        >
          <GripVertical className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          <TaskItem flowId={flowId} task={task} />
        </div>
      ))}
    </div>
  );
}
