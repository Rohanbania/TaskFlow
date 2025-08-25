'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Wand2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateTasksFromTitleAction } from '@/lib/actions';
import { useContext } from 'react';
import { FlowsContext } from '@/contexts/FlowsContext';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long.' }),
  generateTasks: z.boolean().default(false),
});

type CreateFlowFormValues = z.infer<typeof formSchema>;

export function CreateFlowDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addFlow } = useContext(FlowsContext);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CreateFlowFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      generateTasks: false,
    },
  });

  async function onSubmit(values: CreateFlowFormValues) {
    setIsSubmitting(true);
    try {
      let generatedTasks: string[] = [];
      if (values.generateTasks) {
        const result = await generateTasksFromTitleAction(values.title);
        if (result.success && result.data) {
          generatedTasks = result.data;
          toast({
            title: 'AI Magic ✨',
            description: `Successfully generated ${generatedTasks.length} tasks for your new flow.`,
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'AI Task Generation Failed',
            description: result.error || 'Could not generate tasks. Please try again.',
          });
        }
      }
      
      const newFlow = addFlow(values.title, generatedTasks);
      form.reset();
      setOpen(false);
      router.push(`/flow/${newFlow.id}`);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error creating flow',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Create a New Flow</DialogTitle>
          <DialogDescription>
            Give your new flow a title to get started. A flow is a collection of related tasks.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flow Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Skincare Routine, Study Plan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="generateTasks"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="generate-tasks" className="flex items-center gap-2">
                      Generate tasks with AI <Wand2 className="h-4 w-4 text-primary" />
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Let AI suggest some initial tasks based on your title.
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Flow
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
