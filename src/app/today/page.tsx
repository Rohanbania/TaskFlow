
'use client';

import { useContext, useMemo, useState, type TouchEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarClock, Info } from 'lucide-react';
import { FlowsContext } from '@/contexts/FlowsContext';
import { TaskItem } from '@/components/TaskItem';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { parse } from 'date-fns';
import type { Task, Flow } from '@/lib/types';
import { PageTransition } from '@/components/PageTransition';

const MIN_SWIPE_DISTANCE = 50;

interface TaskWithFlowInfo extends Task {
    flowId: string;
    flowTitle: string;
}

export default function TodayPage() {
  const { flows, loading } = useContext(FlowsContext);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const router = useRouter();


  const timedTasks = useMemo(() => {
    const allTasks: TaskWithFlowInfo[] = [];

    flows.forEach((flow: Flow) => {
      flow.tasks.forEach((task: Task) => {
        if (task.startTime) {
          allTasks.push({ ...task, flowId: flow.id, flowTitle: flow.title });
        }
      });
    });

    return allTasks.sort((a, b) => {
      const timeA = parse(a.startTime!, 'HH:mm', new Date()).getTime();
      const timeB = parse(b.startTime!, 'HH:mm', new Date()).getTime();
      return timeA - timeB;
    });
  }, [flows]);
  
  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

    if (isRightSwipe) {
      router.push('/');
    }

    setTouchStart(null);
    setTouchEnd(null);
  };


  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <PageTransition>
       <header className="mb-8">
        <Button variant="ghost" asChild className="mb-4 -ml-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Flows
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <CalendarClock className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold font-headline">Today's Schedule</h1>
        </div>
        <p className="mt-2 text-muted-foreground">A chronological view of all your scheduled tasks for today.</p>
      </header>

      <main>
        {timedTasks.length > 0 ? (
           <div className="space-y-4">
            {timedTasks.map((task) => (
                <div key={`${task.flowId}-${task.id}`} className="card-glow rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                    <p className="mb-3 text-sm font-semibold text-muted-foreground">
                        From Flow: <Link href={`/flow/${task.flowId}`} className="text-primary hover:underline">{task.flowTitle}</Link>
                    </p>
                    <TaskItem flowId={task.flowId} task={task} />
                </div>
            ))}
           </div>
        ) : (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Scheduled Tasks</AlertTitle>
                <AlertDescription>
                    You don't have any tasks with a start time scheduled for today. Add times to your tasks to see them here.
                </AlertDescription>
            </Alert>
        )}
      </main>
      </PageTransition>
    </div>
  );
}


function PageSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
      <Skeleton className="mb-4 h-8 w-36" />
      <div className="mb-8 flex items-center gap-3">
         <Skeleton className="h-10 w-10 rounded-full" />
         <Skeleton className="h-10 w-64" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
