'use server';
/**
 * @fileOverview AI flow to suggest resources and tips for completing a task based on its description.
 *
 * - suggestResources - A function that takes a task description and returns suggested resources and tips.
 * - SuggestResourcesInput - The input type for the suggestResources function.
 * - SuggestResourcesOutput - The return type for the suggestResources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestResourcesInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The detailed description of the task for which resources are needed.'),
});
export type SuggestResourcesInput = z.infer<typeof SuggestResourcesInputSchema>;

const SuggestResourcesOutputSchema = z.object({
  suggestedResources: z
    .array(z.string())
    .describe('A list of relevant resources and tips to aid in completing the task.'),
});
export type SuggestResourcesOutput = z.infer<typeof SuggestResourcesOutputSchema>;

export async function suggestResources(input: SuggestResourcesInput): Promise<SuggestResourcesOutput> {
  return suggestResourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestResourcesPrompt',
  input: {schema: SuggestResourcesInputSchema},
  output: {schema: SuggestResourcesOutputSchema},
  prompt: `You are a helpful AI assistant designed to provide resources and tips for completing tasks.

  Analyze the following task description and provide a list of suggested resources and tips to help the user complete the task efficiently and effectively.

  Task Description: {{{taskDescription}}}

  Consider online tutorials, documentation, tools, and general advice that would be useful.
  Format the output as a JSON array of strings.
  `,
});

const suggestResourcesFlow = ai.defineFlow(
  {
    name: 'suggestResourcesFlow',
    inputSchema: SuggestResourcesInputSchema,
    outputSchema: SuggestResourcesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
