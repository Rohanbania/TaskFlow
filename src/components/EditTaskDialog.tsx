
'use client';

import { useState, useContext, type ReactNode, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Save, Loader2 } from 'lucide-react';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FlowsContext } from '@/contexts/FlowsContext';
import { ScrollArea } from './ui/scroll-area';
import type { Task } from '@/lib/types';


const taskFormSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface EditTaskDialogProps {
  children: ReactNode;
  flowId: string;
  task?: Task; // Make task optional for adding new tasks
}

export function EditTaskDialog({ children, flowId, task }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTask, updateTask } = useContext(FlowsContext);
  const { toast } = useToast();
  const isEditMode = !!task;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    if (task && open) {
      form.reset({
        title: task.title,
        description: task.description,
      });
    } else if (!task && open) {
       form.reset({
        title: '',
        description: '',
      });
    }
  }, [task, open, form]);

  const handleFormSubmit = async (values: TaskFormValues) => {
    setIsSubmitting(true);
    try {
        const taskData: Partial<Task> = {
          title: values.title,
          description: values.description || '',
        };
        
        if (isEditMode && task) {
          await updateTask(flowId, task.id, taskData);
          toast({ title: 'Task Updated', description: `"${values.title}" has been updated.` });
        } else {
          await addTask(
            flowId,
            values.title,
            values.description || '',
          );
          toast({ title: 'Task Added', description: `"${values.title}" has been added to your flow.` });
        }

        form.reset();
        setOpen(false);
    } catch (error: any) {
        console.error("Failed to save task", error);
        toast({
            variant: 'destructive',
            title: 'Error saving task',
            description: 'Failed to save task. Please add all data.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{isEditMode ? 'Edit Task' : 'Add New Task'}</DialogTitle>

          <DialogDescription>
             {isEditMode ? "Update the details for your task below." : "Fill in the details for your new task below. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-6 py-2">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Schedule a meeting with the team" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Add more details about the task, like agenda or required documents..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
            </ScrollArea>
            <DialogFooter className="pt-6 border-t">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                 {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 ) : isEditMode ? (
                    <Save className="mr-2 h-4 w-4" />
                 ) : (
                    <Plus className="mr-2 h-4 w-4" />
                 )}
                {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Task')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
