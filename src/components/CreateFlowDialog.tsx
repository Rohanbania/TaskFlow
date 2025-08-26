'use client';

import { useState, type ReactNode, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, Save } from 'lucide-react';

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
import { useToast } from '@/hooks/use-toast';
import { FlowsContext } from '@/contexts/FlowsContext';
import type { Flow } from '@/lib/types';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long.' }),
});

type CreateFlowFormValues = z.infer<typeof formSchema>;

interface CreateFlowDialogProps {
    children: ReactNode;
    flowToEdit?: Flow;
}

export function CreateFlowDialog({ children, flowToEdit }: CreateFlowDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addFlow, updateFlow } = useContext(FlowsContext);
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!flowToEdit;

  const form = useForm<CreateFlowFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  });
  
  useEffect(() => {
    if (flowToEdit && open) {
      form.reset({
        title: flowToEdit.title,
      });
    } else if (!isEditMode && open) {
      form.reset({
        title: '',
      });
    }
  }, [flowToEdit, open, form, isEditMode]);


  async function onSubmit(values: CreateFlowFormValues) {
    setIsSubmitting(true);
    try {
        if (isEditMode && flowToEdit) {
            updateFlow(flowToEdit.id, { title: values.title });
            toast({
                title: 'Flow Updated',
                description: `Successfully renamed to "${values.title}".`,
            });
        } else {
            const newFlowId = await addFlow(values.title);
            router.push(`/flow/${newFlowId}`);
        }
      
      form.reset();
      setOpen(false);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: `Error ${isEditMode ? 'updating' : 'creating'} flow`,
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
          <DialogTitle className="font-headline">{isEditMode ? 'Edit Flow' : 'Create a New Flow'}</DialogTitle>
          <DialogDescription>
             {isEditMode ? "Update your flow's title below." : "Give your new flow a title to get started. A flow is a collection of related tasks."}
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
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditMode ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />)}
                {isEditMode ? 'Save Changes' : 'Create Flow'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
