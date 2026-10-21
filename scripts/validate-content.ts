import { z } from 'zod';
import raw from '../src/content/problems.json';
import solutions from '../src/content/solutions.json';
import privateTests from '../server/content/private-tests.json';
import { languages, problemSchema, testSchema } from '../src/schema';
import { lessons } from '../src/content/lessons';
const problems=z.array(problemSchema).parse(raw);
const ids=new Set(problems.map(p=>p.id));
if(ids.size!==problems.length)throw new Error('Duplicate problem IDs');
if(new Set(problems.map(p=>p.slug)).size!==problems.length)throw new Error('Duplicate slugs');
const refs=solutions as Record<string,Record<string,string>>;
const hidden=z.record(z.string(),z.array(testSchema).min(2)).parse(privateTests);
for(const problem of problems){
  if('privateTests' in problem)throw new Error('Private tests must not be client content');
  if(!hidden[problem.id])throw new Error(`Missing private tests: ${problem.id}`);
  const samples=new Set(problem.publicTests.map(t=>JSON.stringify(t.input)));
  if(hidden[problem.id].some(t=>samples.has(JSON.stringify(t.input))))throw new Error(`Validation must use separate inputs: ${problem.id}`);
  for(const lang of languages){
    if(!refs[problem.id]?.[lang] || refs[problem.id][lang].includes('___'))throw new Error(`Missing solution: ${problem.id}/${lang}`);
    if(problem.perLanguage[lang].starterCode.includes('___'))throw new Error('Unguided starter contains blanks');
    if(!problem.perLanguage[lang].guidedCode.includes('___'))throw new Error('Missing guided blank');
  }
}
for(const difficulty of ['Easy','Medium','Hard'])if(problems.filter(p=>p.difficulty===difficulty).length!==5)throw new Error(`Expected 5 paired problems at ${difficulty}`);
if(lessons.length!==15 || new Set(lessons.map(l=>l.id)).size!==15)throw new Error('Expected 15 distinct lessons');
for(const lesson of lessons)if(!ids.has(lesson.practice)||!lesson.concept||!lesson.complexity||!lesson.example||!lesson.steps.length)throw new Error(`Invalid lesson ${lesson.id}`);
console.log(`Validated ${problems.length} problems, ${problems.length*2} variants, 60 language fixtures, and ${lessons.length} lessons. Private tests are separate.`);
