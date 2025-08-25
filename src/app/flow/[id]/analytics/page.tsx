
'use client';

import { useContext, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar as CalendarIcon, Circle, AlertTriangle, CheckCircle2, ListTodo } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FlowsContext } from '@/contexts/FlowsContext';
import { Calendar } from '@/components/ui/calendar';
import type { Task } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


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


export default function AnalyticsPage() {
  const params = useParams();
  const id = params.id as string;
  const { getFlowById, loading } = useContext(FlowsContext);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const flow = useMemo(() => getFlowById(id), [getFlowById, id]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    if (!flow) return map;

    flow.tasks.forEach(task => {
      const dateKey = task.endDate || task.startDate;
      if (dateKey) {
        const dateStr = format(new Date(dateKey), 'yyyy-MM-dd');
        if (!map.has(dateStr)) {
          map.set(dateStr, []);
        }
        map.get(dateStr)!.push(task);
      }
    });
    return map;
  }, [flow]);

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate || !tasksByDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return tasksByDate.get(dateStr) || [];
  }, [selectedDate, tasksByDate]);


  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
        <Skeleton className="h-8 w-36 mb-4" />
        <Skeleton className="h-10 w-64 mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!flow) {
    return <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6">Flow not found.</div>;
  }

  const statusColors: Record<TaskStatus, string> = {
    'completed-on-time': 'bg-green-500',
    'completed-late': 'bg-yellow-500',
    'incomplete-overdue': 'bg-red-500',
    'pending': 'bg-gray-400',
  };

  const statusText: Record<TaskStatus, string> = {
    'completed-on-time': 'Completed On Time',
    'completed-late': 'Completed Late',
    'incomplete-overdue': 'Overtime',
    'pending': 'Pending',
  }
  
  const statusIcons: Record<TaskStatus, React.ReactNode> = {
    'completed-on-time': <CheckCircle2 className="h-4 w-4 text-green-500" />,
    'completed-late': <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    'incomplete-overdue': <AlertTriangle className="h-4 w-4 text-red-500" />,
    'pending': <ListTodo className="h-4 w-4 text-gray-500" />
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link href={`/flow/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Flow
        </Link>
      </Button>
      <h1 className="text-4xl font-bold font-headline mb-2">{flow.title} Analytics</h1>
      <p className="text-muted-foreground mb-8">Click on a date to see task details.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <Card>
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="p-3"
                  components={{
                    DayContent: ({ date }) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const dayTasks = tasksByDate.get(dateStr);
                      return (
                        <div className="relative h-full w-full">
                          <span className="relative z-10">{format(date, 'd')}</span>
                           {dayTasks && dayTasks.length > 0 && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-1">
                              {dayTasks.slice(0, 3).map(task => (
                                 <div key={task.id} className={cn("h-1.5 w-1.5 rounded-full", statusColors[getTaskStatus(task)])} />
                              ))}
                            </div>
                           )}
                        </div>
                      );
                    }
                  }}
                  classNames={{
                      day_cell: "h-12 w-16 text-center text-sm p-0 relative",
                      day: "h-12 w-16",
                  }}
                />
              </CardContent>
            </Card>
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-headline">
                {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateTasks.length > 0 ? (
                <ul className="space-y-4">
                  {selectedDateTasks.map(task => {
                     const status = getTaskStatus(task);
                     return (
                        <li key={task.id} className="flex items-start gap-3 text-sm">
                           <div className="mt-1">{statusIcons[status]}</div>
                           <div>
                            <p className="font-medium">{task.title}</p>
                            <Badge variant="outline" className={cn(
                                status === 'completed-on-time' && 'text-green-600 border-green-600',
                                status === 'completed-late' && 'text-yellow-600 border-yellow-600',
                                status === 'incomplete-overdue' && 'text-red-600 border-red-600',
                            )}>
                                {statusText[status]}
                            </Badge>
                           </div>
                        </li>
                     )
                  })}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No tasks for this date.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
