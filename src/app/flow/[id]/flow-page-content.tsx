'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Plus, ClipboardList } from 'lucide-react';
import { FlowsContext } from '@/contexts/FlowsContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskList } from '@/components/TaskList';
import { AddTaskDialog } from '@/components/AddTaskDialog';

export function FlowPageContent({ id }: { id: string }) {
  const { getFlowById, loading } = useContext(FlowsContext);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  const flow = useMemo(() => getFlowById(id), [getFlowById, id]);

  useEffect(() => {
    setIsClient(true);
    if (!loading && !flow) {
      router.replace('/');
    }
  }, [flow, loading, router]);

  const handleExport = () => {
    if (!flow) return;
    const content = `${flow.title}\n\n${flow.tasks.map(t => `- [${t.completed ? 'x' : ' '}] ${t.title}${t.description ? `\n  ${t.description}` : ''}`).join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flow.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  if (!isClient || loading) {
    return <PageSkeleton />;
  }

  if (!flow) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
      <header className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Flows
          </Link>
        </Button>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-4xl font-bold font-headline">{flow.title}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <AddTaskDialog flowId={flow.id}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </AddTaskDialog>
          </div>
        </div>
      </header>

      <main>
        <div>
           <div className="mb-6 flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-muted-foreground" />
              <h2 className="text-2xl font-semibold font-headline">Tasks</h2>
            </div>
            <TaskList flowId={flow.id} tasks={flow.tasks} />
        </div>
      </main>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
      <Skeleton className="mb-4 h-8 w-36" />
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
