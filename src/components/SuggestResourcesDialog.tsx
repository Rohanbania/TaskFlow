'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { suggestTaskResourcesAction } from '@/lib/actions';
import { Lightbulb, AlertTriangle } from 'lucide-react';
import { Badge } from './ui/badge';

interface SuggestResourcesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskDescription: string;
}

export function SuggestResourcesDialog({
  open,
  onOpenChange,
  taskDescription,
}: SuggestResourcesDialogProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const fetchSuggestions = async () => {
        setLoading(true);
        setError(null);
        setSuggestions([]);
        const result = await suggestTaskResourcesAction(taskDescription);
        if (result.success && result.data) {
          setSuggestions(result.data);
        } else {
          setError(result.error || 'An unknown error occurred.');
        }
        setLoading(false);
      };
      fetchSuggestions();
    }
  }, [open, taskDescription]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">AI-Powered Suggestions</DialogTitle>
          <DialogDescription>
            Here are some resources and tips for: "{taskDescription}"
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!loading && !error && (
            <ul className="list-none space-y-3">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <Lightbulb className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
