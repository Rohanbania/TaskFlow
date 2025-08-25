
'use client';

import { useContext, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BarChart2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FlowsContext } from '@/contexts/FlowsContext';
import { format } from 'date-fns';

export default function AnalyticsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { getFlowById, loading } = useContext(FlowsContext);

  const flow = useMemo(() => getFlowById(id), [getFlowById, id]);

  const analyticsData = useMemo(() => {
    if (!flow) return [];

    const dataByDate: { [date: string]: { completed: number; incomplete: number } } = {};

    flow.tasks.forEach(task => {
      const date = task.completionDate ? format(new Date(task.completionDate), 'yyyy-MM-dd') : 'Incomplete';
       if (!dataByDate[date]) {
        dataByDate[date] = { completed: 0, incomplete: 0 };
      }
      if (task.completed) {
        dataByDate[date].completed++;
      }
    });

    // Add incomplete tasks
    const incompleteTasks = flow.tasks.filter(t => !t.completed).length;
    if (incompleteTasks > 0) {
      if(!dataByDate['Incomplete']) dataByDate['Incomplete'] = { completed: 0, incomplete: 0 };
      dataByDate['Incomplete'].incomplete = incompleteTasks;
    }


    return Object.entries(dataByDate)
      .map(([date, counts]) => ({
        date,
        ...counts,
      }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [flow]);

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
    // router.replace('/'); // This can cause issues with server rendering
    return <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6">Flow not found.</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link href={`/flow/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Flow
        </Link>
      </Button>
      <h1 className="text-4xl font-bold font-headline mb-8">{flow.title} Analytics</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-6 w-6" />
            Task Completion Status
          </CardTitle>
          <CardDescription>
            Tasks completed per day vs. pending tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))'
                  }}
                />
                <Legend />
                <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" />
                <Bar dataKey="incomplete" fill="hsl(var(--destructive))" name="Incomplete" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex flex-col items-center justify-center h-96">
                <p className="text-muted-foreground">No task data available to display analytics.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
