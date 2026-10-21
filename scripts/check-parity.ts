// Runs only repository-owned reference fixtures, NEVER user submissions.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import problems from '../src/content/problems.json';
import solutions from '../src/content/solutions.json';
import hidden from '../server/content/private-tests.json';
import { wrapSource } from '../server/wrappers';
import { languages, type Language, type TestCase } from '../src/schema';
const dir=resolve('.parity');mkdirSync(dir,{recursive:true});
const marker='RESULT_aabbcc';
const fixtures=solutions as Record<string,Record<Language,string>>;
const privateTests=hidden as Record<string,TestCase[]>;
const tools:Record<Language,string>={python:process.env.PYTHON||'python',javascript:process.execPath,java:'javac',cpp:'g++'};
let checked=0;const skipped:string[]=[];
for(const language of languages){
  const executable=tools[language];
  const probe=spawnSync(executable,[language==='java'?'-version':'--version'],{encoding:'utf8'});
  if(probe.error||probe.status!==0){if(process.env.CI)throw new Error(`Required compiler unavailable: ${language}`);skipped.push(language);continue;}
  for(const p of problems){
    const tests=[...p.publicTests,...privateTests[p.id]];
    const source=wrapSource(language,fixtures[p.id][language],tests,marker);
    const file=resolve(dir,language==='java'?'Main.java':language==='cpp'?'main.cpp':language==='python'?'main.py':'main.cjs');
    writeFileSync(file,source);
    let run:string, args:string[];
    if(language==='java'||language==='cpp'){
      const compileArgs=language==='java'?[file]:['-std=c++17','-O2',file,'-o',resolve(dir,process.platform==='win32'?'main.exe':'main')];
      const built=spawnSync(executable,compileArgs,{encoding:'utf8',timeout:30000});
      if(built.status!==0)throw new Error(`${p.id}/${language}: ${built.stderr||built.error}`);
      run=language==='java'?'java':resolve(dir,process.platform==='win32'?'main.exe':'main');args=language==='java'?['-cp',dir,'Main']:[];
    }else{run=executable;args=[file];}
    const result=spawnSync(run,args,{encoding:'utf8',timeout:10000,maxBuffer:100000});
    if(result.status!==0)throw new Error(`${p.id}/${language}: ${result.stderr||result.error}`);
    const output=result.stdout.trim().split(/\r?\n/).filter(l=>l.startsWith(marker)).map(l=>JSON.parse(l.slice(marker.length)));
    if(JSON.stringify(output)!==JSON.stringify(tests.map(t=>t.expected)))throw new Error(`Parity failure ${p.id}/${language}: ${JSON.stringify(output)}`);
    checked++;console.log(`PASS ${p.id} / ${language} (${tests.length} tests)`);
  }
}
console.log(`${checked} reference implementations passed. ${skipped.length?`Unavailable local compilers: ${skipped.join(', ')}. CI requires all four.`:'All four languages verified.'}`);
