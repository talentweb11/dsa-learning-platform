import type { Language, TestCase } from '../src/schema';

// Only trusted, schema-validated fixtures are interpolated into harness source.
// Submitted source is NEVER executed by this server. The remote judge owns isolation.
export function wrapSource(language: Language, source: string, tests: TestCase[], marker: string): string {
  if (!/^RESULT_[a-f0-9]+$/.test(marker)) throw new Error('Invalid harness marker');
  const nums = (t: TestCase) => t.input.numbers.join(',');
  if (language === 'python') return `from __future__ import annotations\n${source}\n\nimport json as __json\n${tests.map(t => `print('${marker}' + __json.dumps(solve([${nums(t)}], ${t.input.target})))`).join('\n')}\n`;
  if (language === 'javascript') return `${source}\n\n${tests.map(t => `console.log('${marker}' + JSON.stringify(solve([${nums(t)}], ${t.input.target})));`).join('\n')}\n`;
  if (language === 'java') return `import java.util.*;\n${source}\npublic class Main { public static void main(String[] args) {\n${tests.map(t => `System.out.println("${marker}" + Arrays.toString(new Solution().solve(new int[]{${nums(t)}}, ${t.input.target})));`).join('\n')}\n}}\n`;
  return `#include <bits/stdc++.h>\nusing namespace std;\n${source}\nvoid __emit(vector<int> a) { cout << "${marker}["; for(size_t i=0;i<a.size();i++) { if(i) cout << ","; cout << a[i]; } cout << "]\\n"; }\nint main() {\n${tests.map(t => `__emit(solve(vector<int>{${nums(t)}}, ${t.input.target}));`).join('\n')}\n}\n`;
}
