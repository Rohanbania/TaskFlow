'use client';

import Link from 'next/link';
import { useMemo, useContext } from 'react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Flow } from '@/lib/types';
import { FlowsContext } from '@/contexts/FlowsContext';

interface FlowCardProps {
  flow: Flow;
}

export function FlowCard({ flow }: FlowCardProps) {
  const { deleteFlow } = useContext(FlowsContext);
  const progress = useMemo(() => {
    if (flow.tasks.length === 0) return 0;
    const completedTasks = flow.tasks.filter((task) => task.completed).length;
    return (completedTasks / flow.tasks.length) * 100;
  }, [flow.tasks]);

  return (
    <Card className="flex h-full flex-col transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="absolute right-2 top-2">
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Flow
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the "{flow.title}" flow and all its tasks.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteFlow(flow.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Link href={`/flow/${flow.id}`} className="flex h-full flex-col">
        <CardHeader>
          <CardTitle className="pr-8 font-headline tracking-tight">{flow.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-grow flex-col justify-end">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {flow.tasks.filter((t) => t.completed).length} / {flow.tasks.length} tasks completed
            </p>
            <Progress value={progress} aria-label={`${progress.toFixed(0)}% complete`} />
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
