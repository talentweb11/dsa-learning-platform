import { describe,it,expect,vi } from 'vitest';
import { grade, type JudgeConfig } from '../server/judge';
import { wrapSource } from '../server/wrappers';
const config:JudgeConfig={url:'https://judge.invalid',token:'server-secret',languageIds:{python:71,java:62,cpp:54,javascript:63}};
const tests=[{input:{numbers:[2,4],target:0},expected:[2,6]}];
function fakeJudge(status=3,wrong=false){let marker='';return vi.fn(async(_url:unknown,options:any)=>{
  if(options?.method==='POST'){
    const body=JSON.parse(options.body);const source=Buffer.from(body.source_code,'base64').toString();marker=source.match(/RESULT_[a-f0-9]+/)![0];
    expect(body.enable_network).toBe(false);expect(body.cpu_time_limit).toBe(2);expect(body.wall_time_limit).toBe(5);expect(body.memory_limit).toBe(128000);
    expect(options.headers['X-Auth-Token']).toBe('server-secret');
    return new Response(JSON.stringify({token:'job-123'}));
  }
  return new Response(JSON.stringify({status:{id:status},stdout:Buffer.from(`debug output\n${marker}${wrong?'[99]':'[2,6]'}\n`).toString('base64'),stderr:Buffer.from('runtime input details').toString('base64'),compile_output:status===6?Buffer.from('compiler detail').toString('base64'):null}));
}) as unknown as typeof fetch;}
describe('judge integration',()=>{
  it('compares behavior and exposes public test detail',async()=>{const result=await grade(config,'python','pass',tests,true,fakeJudge());expect(result.executionStatus).toBe('accepted');expect(result.testResults[0].actual).toEqual([2,6]);expect(result.stdout).toBe('debug output');});
  it('detects a wrong answer',async()=>{const result=await grade(config,'java','class Solution {}',tests,true,fakeJudge(3,true));expect(result.executionStatus).toBe('wrong-answer');});
  it('never returns private inputs, actuals, or program output',async()=>{const result=await grade(config,'cpp','',tests,false,fakeJudge());expect(result.testResults).toEqual([{index:0,passed:true}]);expect(result.stdout).toBe('');expect(result.stderr).toBe('');});
  it.each([[5,'timeout'],[6,'compile-error'],[11,'runtime-error']])('maps status %s to %s',async(status,expected)=>{expect((await grade(config,'javascript','',tests,true,fakeJudge(status as number))).executionStatus).toBe(expected);});
  it('does not reveal private fixtures through compile diagnostics',async()=>{expect((await grade(config,'java','',tests,false,fakeJudge(6))).stderr).toBe('');});
  it('rejects provider outages',async()=>{await expect(grade(config,'python','',tests,true,vi.fn(async()=>new Response('',{status:503})) as typeof fetch)).rejects.toThrow('HTTP 503');});
  it('rejects oversized provider output',async()=>{await expect(grade(config,'python','',tests,true,vi.fn(async()=>new Response('x'.repeat(70000))) as typeof fetch)).rejects.toThrow('limit');});
  it('validates harness markers and generates each language wrapper',()=>{expect(()=>wrapSource('python','',tests,'bad')).toThrow();for(const lang of ['python','java','cpp','javascript'] as const)expect(wrapSource(lang,'',tests,'RESULT_abcd')).toContain('RESULT_abcd');});
});
