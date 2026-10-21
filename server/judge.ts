import { randomBytes } from 'node:crypto';
import type { GradeResult, Language, TestCase } from '../src/schema';
import { wrapSource } from './wrappers';

export type JudgeConfig = { url: string; token?: string; languageIds: Record<Language, number> };
const MAX_RESPONSE_BYTES = 65536;
async function boundedJson(response: Response): Promise<any> {
  if (!response.ok) { await response.body?.cancel(); throw new Error(`Judge service returned HTTP ${response.status}`); }
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Empty judge response');
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_RESPONSE_BYTES) { await reader.cancel(); throw new Error('Judge output exceeded the response limit'); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export async function grade(config: JudgeConfig, language: Language, source: string, tests: TestCase[], isPublic: boolean, fetcher: typeof fetch = fetch): Promise<GradeResult> {
  const start = Date.now();
  const marker = `RESULT_${randomBytes(16).toString('hex')}`;
  const signal = AbortSignal.timeout(40000);
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (config.token) headers['X-Auth-Token'] = config.token;
  const payload = {
    language_id: config.languageIds[language], source_code: Buffer.from(wrapSource(language, source, tests, marker)).toString('base64'),
    cpu_time_limit: 2, cpu_extra_time: 0.5, wall_time_limit: 5, memory_limit: 128000,
    max_file_size: 64, max_processes_and_or_threads: 64, enable_network: false,
    enable_per_process_and_thread_time_limit: false, enable_per_process_and_thread_memory_limit: false,
    redirect_stderr_to_stdout: false, number_of_runs: 1,
  };
  const created = await boundedJson(await fetcher(`${config.url}/submissions?base64_encoded=true&wait=false`, { method:'POST', headers, body: JSON.stringify(payload), signal }));
  if (typeof created.token !== 'string' || !/^[a-zA-Z0-9-]+$/.test(created.token)) throw new Error('Invalid judge job response');
  let result: any;
  while (true) {
    result = await boundedJson(await fetcher(`${config.url}/submissions/${created.token}?base64_encoded=true&fields=status,stdout,stderr,compile_output,time`, { headers, signal }));
    if (result.status?.id > 2) break;
    if (![1,2].includes(result.status?.id)) throw new Error('Invalid judge status');
    await new Promise(resolve => setTimeout(resolve, 500));
    signal.throwIfAborted();
  }
  const decode = (value: unknown) => typeof value === 'string' ? Buffer.from(value, 'base64').toString('utf8').slice(0,16000) : '';
  const stdout = decode(result.stdout), stderr = decode(result.compile_output) || decode(result.stderr);
  const base = { elapsedMs: Date.now()-start, stdout: isPublic ? stdout.split('\n').filter(l=>!l.startsWith(marker)).join('\n').trim() : '', stderr: isPublic ? stderr : '', testResults: [] };
  if (result.status.id === 5) return { ...base, executionStatus:'timeout', message:'The solution exceeded its execution time limit. Check for an infinite loop or a slower-than-needed algorithm.' };
  if (result.status.id === 6) return { ...base, executionStatus:'compile-error', message:isPublic?'Compilation failed. Review the compiler diagnostics below.':'Compilation failed. Run public samples to inspect compiler diagnostics.' };
  if (result.status.id === 13 || result.status.id === 14) throw new Error('The judge could not execute this job');
  if (result.status.id !== 3) return { ...base, executionStatus:'runtime-error', message: isPublic ? 'The program stopped before completing the tests. Review the error output.' : 'The program failed during validation. Run sample tests to inspect diagnostics.' };
  const lines = stdout.split(/\r?\n/).filter(line => line.startsWith(marker));
  const results = tests.map((test, i) => {
    let actual: unknown = null;
    try { actual = JSON.parse(lines[i]?.slice(marker.length)); } catch { /* malformed output fails */ }
    const passed = lines.length === tests.length && Array.isArray(actual) && actual.every(Number.isSafeInteger) && JSON.stringify(actual) === JSON.stringify(test.expected);
    return { index:i, passed, ...(isPublic ? { input:test.input, expected:test.expected, actual } : {}) };
  });
  const accepted = results.every(t=>t.passed);
  return { ...base, executionStatus: accepted ? 'accepted' : 'wrong-answer', testResults: results, message: accepted ? 'All tests passed.' : 'Some outputs differ from the expected results. Check boundaries, duplicates, and empty inputs.' };
}
