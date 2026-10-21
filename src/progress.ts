import { z } from 'zod';
import type { Language, Mode } from './schema';
const entrySchema = z.object({ completed:z.boolean(), attempts:z.number().int().min(0).max(1000000), draftCode:z.string().max(20000), lastAttemptAt:z.string().nullable() });
export const progressSchema = z.object({ version:z.literal(1), entries:z.record(z.string().regex(/^[a-z0-9-]+:(guided|unguided):(python|java|cpp|javascript)$/),entrySchema), lessons:z.array(z.string().max(80)).max(100) });
export type Progress = z.infer<typeof progressSchema>;
export const emptyProgress = ():Progress => ({version:1,entries:{},lessons:[]});
export const progressKey = (id:string,mode:Mode,language:Language) => `${id}:${mode}:${language}`;
const KEY='pattern-progress-v1';
export function readProgress(): {data:Progress; warning:string} {
  try { const raw=localStorage.getItem(KEY); return {data:raw?progressSchema.parse(JSON.parse(raw)):emptyProgress(),warning:''}; }
  catch { return {data:emptyProgress(),warning:'Browser storage is unavailable or contains invalid data. Changes will remain in this session; export a backup before leaving.'}; }
}
export function saveProgress(data:Progress): boolean { try { localStorage.setItem(KEY,JSON.stringify(data)); return true; } catch { return false; } }
export function parseBackup(text:string): Progress {
  if(text.length>5000000) throw new Error('Backup exceeds the 5 MB size limit.');
  const data=progressSchema.parse(JSON.parse(text));
  if(Object.keys(data.entries).length>1000) throw new Error('Backup contains too many entries.');
  return data;
}
