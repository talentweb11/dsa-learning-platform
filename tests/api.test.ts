import { afterEach,describe,it,expect,vi } from 'vitest';
import type { Server } from 'node:http';
import { createApp } from '../server/app';
const servers:Server[]=[];
afterEach(async()=>{await Promise.all(servers.splice(0).map(s=>new Promise<void>((resolve,reject)=>{s.closeAllConnections();s.close(e=>e?reject(e):resolve());})));});
async function start(url='https://judge.invalid'){
 const grader=vi.fn(async()=>({executionStatus:'accepted' as const,testResults:[{index:0,passed:true}],elapsedMs:1,stdout:'',stderr:'',message:'Passed'}));
 const app=createApp({url,languageIds:{python:71,java:62,cpp:54,javascript:63}},['http://localhost:5173'],grader);
 const server=app.listen(0,'127.0.0.1');servers.push(server);await new Promise<void>(resolve=>server.once('listening',resolve));const address=server.address();if(!address||typeof address==='string')throw new Error('No port');
 return {grader,post:(body:unknown,origin='http://localhost:5173')=>fetch(`http://127.0.0.1:${address.port}/api/grade`,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)})};
}
const valid={problemId:'running-totals',mode:'guided',language:'python',sourceCode:'def solve(numbers, target): return numbers',action:'run'};
describe('runner HTTP API',()=>{
 it('uses backend-owned test fixtures and hides validation cases',async()=>{const {post,grader}=await start();expect((await post(valid)).status).toBe(200);expect(grader.mock.calls[0]).toBeDefined();expect((await post({...valid,action:'submit'})).status).toBe(200);const calls=grader.mock.calls as unknown as any[][];expect(calls[0][4]).toBe(true);expect(calls[1][4]).toBe(false);expect(calls[0][3]).not.toEqual(calls[1][3]);});
 it('rejects foreign origins and client-supplied tests',async()=>{const {post,grader}=await start();expect((await post(valid,'https://evil.example')).status).toBe(403);expect((await post({...valid,tests:[]})).status).toBe(400);expect(grader).not.toHaveBeenCalled();});
 it('rejects invalid languages, unknown problems and oversized input',async()=>{const {post}=await start();expect((await post({...valid,language:'ruby'})).status).toBe(400);expect((await post({...valid,problemId:'missing'})).status).toBe(404);expect((await post({...valid,sourceCode:'a'.repeat(30000)})).status).toBe(413);});
 it('reports unconfigured grading without breaking the API',async()=>{const {post}=await start('');const response=await post(valid);expect(response.status).toBe(503);expect((await response.json()).error).toContain('not been configured');});
 it('enforces a guest quota',async()=>{const {post}=await start();for(let i=0;i<12;i++)expect((await post(valid)).status).toBe(200);expect((await post(valid)).status).toBe(429);});
});
