'use server';
/**
 * @fileOverview AI flow to generate tasks based on a given title.
 *
 * - generateTasksFromTitle - A function that generates a list of tasks from a flow title.
 * - GenerateTasksFromTitleInput - The input type for the generateTasksFromTitle function.
 * - GenerateTasksFromTitleOutput - The return type for the generateTasksFromTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTasksFromTitleInputSchema = z.object({
  title: z.string().describe('The title of the flow for which tasks need to be generated.'),
});
export type GenerateTasksFromTitleInput = z.infer<typeof GenerateTasksFromTitleInputSchema>;

const GenerateTasksFromTitleOutputSchema = z.object({
  tasks: z.array(z.string()).describe('An array of tasks generated based on the flow title.'),
});
export type GenerateTasksFromTitleOutput = z.infer<typeof GenerateTasksFromTitleOutputSchema>;

export async function generateTasksFromTitle(input: GenerateTasksFromTitleInput): Promise<GenerateTasksFromTitleOutput> {
  return generateTasksFromTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTasksFromTitlePrompt',
  input: {schema: GenerateTasksFromTitleInputSchema},
  output: {schema: GenerateTasksFromTitleOutputSchema},
  prompt: `You are a task generation expert. Generate a list of tasks to help a user get started with a flow based on the title.

Title: {{{title}}}

Tasks:`,
});

const generateTasksFromTitleFlow = ai.defineFlow(
  {
    name: 'generateTasksFromTitleFlow',
    inputSchema: GenerateTasksFromTitleInputSchema,
    outputSchema: GenerateTasksFromTitleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
