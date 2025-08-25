'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { BookMarked, Plus, LayoutGrid } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CreateFlowDialog } from '@/components/CreateFlowDialog';
import { FlowCard } from '@/components/FlowCard';
import { FlowsContext } from '@/contexts/FlowsContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { flows, loading } = useContext(FlowsContext);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <BookMarked className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold font-headline">TaskFlow</span>
          </Link>
          <CreateFlowDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Flow
            </Button>
          </CreateFlowDialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:px-6">
        <div className="mb-8 flex items-center gap-2">
          <LayoutGrid className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold font-headline">Your Flows</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        ) : flows.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {flows.map((flow) => (
              <FlowCard key={flow.id} flow={flow} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card p-12 text-center">
            <h2 className="mb-2 text-xl font-semibold font-headline">No Flows Yet</h2>
            <p className="mb-4 max-w-sm text-muted-foreground">
              It looks like you haven't created any flows. Get started by creating a new one.
            </p>
            <CreateFlowDialog>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Flow
              </Button>
            </CreateFlowDialog>
          </div>
        )}
      </main>
    </div>
  );
}
