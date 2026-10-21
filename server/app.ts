import express from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import rawProblems from '../src/content/problems.json';
import rawPrivate from './content/private-tests.json';
import { languages, problemSchema, testSchema, type GradeResult, type Language, type TestCase } from '../src/schema';
import { grade, type JudgeConfig } from './judge';

const problems = z.array(problemSchema).parse(rawProblems);
const privateTests = z.record(z.string(),z.array(testSchema)).parse(rawPrivate);
const requestSchema = z.object({ problemId:z.string().max(80), mode:z.enum(['guided','unguided']), language:z.enum(languages), sourceCode:z.string().min(1).max(20000), action:z.enum(['run','submit']) }).strict();
type Grader = (config: JudgeConfig, lang: Language, source: string, tests: TestCase[], isPublic: boolean) => Promise<GradeResult>;
export function createApp(config: JudgeConfig, origins: string[], grader: Grader = grade, trustProxyHops = 0) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', trustProxyHops);
  app.use((req,res,next)=>{
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-Content-Type-Options','nosniff');
    const origin=req.headers.origin;
    if (origin && !origins.includes(origin)) { res.status(403).json({error:'This origin is not allowed.'}); return; }
    if (origin) { res.setHeader('Access-Control-Allow-Origin',origin); res.setHeader('Vary','Origin'); }
    res.setHeader('Access-Control-Allow-Methods','POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
    if(req.method==='OPTIONS') { res.sendStatus(204); return; }
    next();
  });
  app.get('/health',(_req,res)=>res.json({status:'ok',configured:!!config.url}));
  app.use('/api',rateLimit({windowMs:60000,limit:12,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Guest quota reached: 12 requests per minute. Please wait a minute.'}}));
  app.use(express.json({limit:'24kb'}));
  let active = 0;
  app.post('/api/grade',async(req,res)=>{
    const parsed=requestSchema.safeParse(req.body);
    if(!parsed.success) { res.status(400).json({error:'Invalid submission. Source must contain 1–20,000 characters and a supported language and mode.'}); return; }
    const data=parsed.data, problem=problems.find(p=>p.id===data.problemId);
    if(!problem) { res.status(404).json({error:'Problem not found.'}); return; }
    if(!config.url) { res.status(503).json({error:'The runner has not been configured. Lessons and drafts remain available.'}); return; }
    if(active>=4) { res.status(429).json({error:'The runner is busy. Please try again shortly.'}); return; }
    active++;
    try {
      const tests=data.action==='run' ? problem.publicTests : privateTests[problem.id];
      const result=await grader(config,data.language,data.sourceCode,tests,data.action==='run');
      res.json(result);
    } catch(error) {
      const timeout=error instanceof Error && ['TimeoutError','AbortError'].includes(error.name);
      res.status(timeout?504:502).json({error:timeout?'The judge request timed out. Please try again.':'The execution service is unavailable. Your draft has been preserved.'});
    } finally { active--; }
  });
  app.use((error: unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{
    const tooLarge=typeof error==='object' && error!==null && 'type' in error && error.type==='entity.too.large';
    res.status(tooLarge?413:400).json({error:tooLarge?'Submission is too large.':'Invalid request body.'});
  });
  return app;
}
