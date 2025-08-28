
'use client';

import { useContext, useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Plus, ClipboardList, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import { FlowsContext } from '@/contexts/FlowsContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskList } from '@/components/TaskList';
import { EditTaskDialog } from '@/components/EditTaskDialog';
import { TaskReportCard } from '@/components/TaskReportCard';
import { useToast } from '@/hooks/use-toast';


export function FlowPageContent({ id }: { id: string }) {
  const { getFlowById, loading } = useContext(FlowsContext);
  const [isClient, setIsClient] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  const flow = useMemo(() => getFlowById(id), [getFlowById, id]);
  const reportCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setIsClient(true);
    if (!loading && !flow) {
      router.replace('/');
    }
  }, [flow, loading, router]);
  
  useEffect(() => {
    if (flow?.tasks) {
      reportCardRefs.current = reportCardRefs.current.slice(0, flow.tasks.length);
    }
  }, [flow?.tasks]);

  const handleExport = async () => {
     if (!flow) return;
    setIsExporting(true);

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    const titleLines = doc.splitTextToSize(flow.title, contentWidth);
    doc.text(titleLines, margin, margin + 5);
    let yPosition = margin + 5 + (titleLines.length * 10);


    for (let i = 0; i < flow.tasks.length; i++) {
        const reportCardElement = reportCardRefs.current[i];

        if (reportCardElement) {
            const canvas = await html2canvas(reportCardElement, { 
              scale: 2,
              useCORS: true,
              width: reportCardElement.offsetWidth,
              windowWidth: reportCardElement.offsetWidth,
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            if (yPosition + imgHeight > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
                doc.setFontSize(22);
                doc.setTextColor(40, 40, 40);
                doc.text(titleLines, margin, margin + 5);
                yPosition = margin + 5 + (titleLines.length * 10);
            }
            
            doc.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 10;
        }
    }

    doc.save(`${flow.title.replace(/\s+/g, '_')}_report.pdf`);
    setIsExporting(false);
    toast({
      title: 'Download Complete',
      description: `"${flow.title}_report.pdf" has been downloaded.`,
    });
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
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </Button>
            <EditTaskDialog flowId={flow.id}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </EditTaskDialog>
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

       {/* Hidden container for PDF export content */}
       <div className="light absolute left-[-9999px] top-0 -z-10" aria-hidden="true">
         <div className="p-4 bg-background">
             {flow.tasks.map((task, index) => (
              <div key={task.id} ref={el => reportCardRefs.current[index] = el} className="mb-4" style={{width: '700px'}}>
                <TaskReportCard task={task} />
              </div>
            ))}
         </div>
      </div>
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
