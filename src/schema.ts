import { z } from 'zod';
export const languages = ['python', 'java', 'cpp', 'javascript'] as const;
export type Language = typeof languages[number];
export type Mode = 'guided' | 'unguided';
export const testSchema = z.object({ input: z.object({ numbers: z.array(z.number().int().min(-1000000).max(1000000)).max(1000), target: z.number().int().min(-1000000).max(1000000) }), expected: z.array(z.number().int()).max(2000) });
export type TestCase = z.infer<typeof testSchema>;
const fixture = z.object({ functionSignature: z.string().min(1), starterCode: z.string().min(1), guidedCode: z.string().includes('___'), guidedBlanks: z.array(z.string()).min(1), runnerTemplate: z.literal('integer-array-v1') });
export const problemSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), slug: z.string(), title: z.string().min(1), difficulty: z.enum(['Easy','Medium','Hard']),
  modes: z.tuple([z.literal('guided'), z.literal('unguided')]), topicTags: z.array(z.string()).min(1), description: z.string().min(30),
  examples: z.array(testSchema).min(1), constraints: z.array(z.string()).min(1), supportedLanguages: z.tuple([z.literal('python'),z.literal('java'),z.literal('cpp'),z.literal('javascript')]),
  perLanguage: z.object({ python: fixture, java: fixture, cpp: fixture, javascript: fixture }), hints: z.array(z.string()).min(2), publicTests: z.array(testSchema).min(2), explanation: z.string().min(20), complexity: z.string()
}).strict();
export type Problem = z.infer<typeof problemSchema>;
export type TestResult = { index: number; passed: boolean; input?: TestCase['input']; expected?: number[]; actual?: unknown };
export type GradeResult = { executionStatus: 'accepted'|'wrong-answer'|'compile-error'|'runtime-error'|'timeout'; testResults: TestResult[]; elapsedMs: number; stdout: string; stderr: string; message: string };
