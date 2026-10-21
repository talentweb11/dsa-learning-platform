import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { javascript } from '@codemirror/lang-javascript';
import type { Language } from './schema';
const extensions = { python:python(), java:java(), cpp:cpp(), javascript:javascript() };
export default function Editor({language,value,onChange}:{language:Language;value:string;onChange:(value:string)=>void}) {
  return <CodeMirror aria-label={`${language} solution editor`} value={value} height="430px" extensions={[extensions[language]]} onChange={onChange} basicSetup={{lineNumbers:true,foldGutter:true,autocompletion:true}} theme="light" indentWithTab={false}/>;
}
