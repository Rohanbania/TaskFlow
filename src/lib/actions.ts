'use server';

import { generateTasksFromTitle } from '@/ai/flows/generate-tasks-from-title';
import { suggestResources } from '@/ai/flows/suggest-resources-for-task';

export async function generateTasksFromTitleAction(title: string) {
  try {
    const result = await generateTasksFromTitle({ title });
    return { success: true, data: result.tasks };
  } catch (error) {
    console.error('Error generating tasks:', error);
    return { success: false, error: 'Failed to generate tasks.' };
  }
}

export async function suggestTaskResourcesAction(taskDescription: string) {
  try {
    const result = await suggestResources({ taskDescription });
    return { success: true, data: result.suggestedResources };
  } catch (error) {
    console.error('Error suggesting resources:', error);
    return { success: false, error: 'Failed to suggest resources.' };
  }
}
