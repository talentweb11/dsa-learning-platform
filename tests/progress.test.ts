import { describe,it,expect } from 'vitest';
import { emptyProgress,parseBackup,progressKey } from '../src/progress';
describe('progress backups',()=>{
  it('preserves independent language and mode drafts',()=>{
    const p=emptyProgress();
    for(const [mode,lang,code] of [['guided','python','python draft'],['guided','java','java draft'],['unguided','python','independent draft']] as const)
      p.entries[progressKey('pair-budget',mode,lang)]={completed:false,attempts:0,draftCode:code,lastAttemptAt:null};
    expect(parseBackup(JSON.stringify(p))).toEqual(p);
    expect(Object.keys(p.entries)).toHaveLength(3);
  });
  it('rejects malformed, oversized, and unsafe backups',()=>{
    for(const value of ['{bad}',JSON.stringify({version:2,entries:{},lessons:[]}),JSON.stringify({version:1,entries:{'__proto__':5},lessons:[42]}),' '.repeat(5000001)])expect(()=>parseBackup(value)).toThrow();
  });
  it('rejects invalid attempts and unknown key formats',()=>{
    expect(()=>parseBackup(JSON.stringify({version:1,entries:{'a:guided:python':{completed:true,attempts:-1,draftCode:'',lastAttemptAt:null}},lessons:[]}))).toThrow();
    expect(()=>parseBackup(JSON.stringify({version:1,entries:{'a:guided:ruby':{}},lessons:[]}))).toThrow();
  });
});
