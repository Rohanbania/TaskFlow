'use client';

import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { BookMarked, Plus, LayoutGrid, Bell, X, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateFlowDialog } from '@/components/CreateFlowDialog';
import { FlowCard } from '@/components/FlowCard';
import { FlowsContext } from '@/contexts/FlowsContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { AuthContext } from '@/contexts/AuthContext';
import { UserNav } from '@/components/UserNav';

export default function Home() {
  const { user, loading: authLoading, signInWithGoogle } = useContext(AuthContext);
  const { flows, loading: flowsLoading } = useContext(FlowsContext);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);
  const loading = authLoading || flowsLoading;

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        setShowPermissionBanner(true);
      }
    }
  }, []);

  const handleRequestPermission = () => {
    Notification.requestPermission().then((permission) => {
      setNotificationPermission(permission);
      setShowPermissionBanner(false);
    });
  };
  
  const handleDismissBanner = () => {
    setShowPermissionBanner(false);
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      );
    }
    
    if (!user) {
       return (
         <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card p-12 text-center">
            <h2 className="mb-2 text-xl font-semibold font-headline">Welcome to TaskFlow</h2>
            <p className="mb-4 max-w-sm text-muted-foreground">
              Sign in with your Google account to start creating your personalized task flows.
            </p>
            <Button onClick={signInWithGoogle}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In with Google
            </Button>
          </div>
       );
    }

    if (flows.length > 0) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {flows.map((flow) => (
            <FlowCard key={flow.id} flow={flow} />
          ))}
        </div>
      );
    }

    return (
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
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold font-headline">TaskFlow</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
             {user && <CreateFlowDialog>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Flow
                </Button>
            </CreateFlowDialog>}
            {user ? <UserNav /> : (
              !loading && (
                <Button onClick={signInWithGoogle}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              )
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:px-6">
        {showPermissionBanner && (
          <Alert className="mb-6 flex items-start justify-between gap-4">
           <div className='flex items-start gap-4'>
            <Bell className="h-5 w-5 text-primary" />
              <div>
                <AlertTitle className='font-headline'>Enable Notifications</AlertTitle>
                <AlertDescription>
                  Get notified when your tasks are about to start.
                </AlertDescription>
              </div>
           </div>
            <div className='flex gap-2 flex-shrink-0'>
                <Button onClick={handleRequestPermission}>Enable</Button>
                 <Button variant='ghost' size='icon' onClick={handleDismissBanner} className='h-9 w-9'>
                    <X className='h-4 w-4' />
                 </Button>
            </div>
          </Alert>
        )}
        
        {user && 
         <div className="mb-8 flex items-center gap-2">
          <LayoutGrid className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold font-headline">Your Flows</h1>
        </div>}

        {renderContent()}
      </main>
    </div>
  );
}
