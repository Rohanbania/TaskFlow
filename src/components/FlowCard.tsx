
'use client';

import Link from 'next/link';
import { useMemo, useContext } from 'react';
import { MoreHorizontal, Trash2, Pencil } from 'lucide-react';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Flow } from '@/lib/types';
import { FlowsContext } from '@/contexts/FlowsContext';
import { CreateFlowDialog } from './CreateFlowDialog';
import { cn } from '@/lib/utils';
import { format, startOfDay } from 'date-fns';


interface FlowCardProps {
  flow: Flow;
}

export function FlowCard({ flow }: FlowCardProps) {
  const { deleteFlow } = useContext(FlowsContext);
  
  const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
  
  const progress = useMemo(() => {
    if (flow.tasks.length === 0) return 0;
    const completedToday = flow.tasks.filter((task) => task.completedDates?.includes(todayStr)).length;
    return (completedToday / flow.tasks.length) * 100;
  }, [flow.tasks, todayStr]);

  const completedTodayCount = useMemo(() => {
     return flow.tasks.filter((task) => task.completedDates?.includes(todayStr)).length;
  }, [flow.tasks, todayStr]);

  return (
    <Card className="card-glow flex h-full flex-col">
      <div className="absolute right-2 top-2 z-10">
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <CreateFlowDialog flowToEdit={flow}>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Flow
                </DropdownMenuItem>
              </CreateFlowDialog>
              <DropdownMenuSeparator />
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
              {completedTodayCount} / {flow.tasks.length} tasks completed today
            </p>
            <Progress value={progress} aria-label={`${progress.toFixed(0)}% complete`} />
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
