import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {lessons} from './course.mjs';
import {interview} from './interview.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const docs=path.join(root,'docs');
const errors=[];
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const file of walk(docs)){
 const content=fs.readFileSync(file,'utf8');
 if(/AI assisted|learn-with-ai|visit-relay|placeholder-block|Quiz goblin|Phase 1/i.test(content))errors.push(`Stale content in ${file}`);
 if(file.endsWith('.html')){
  if(!content.includes('<main id="main"'))errors.push(`No main landmark: ${file}`);
  for(const match of content.matchAll(/(?:href|src)="([^"]+)"/g)){
   const url=match[1];if(/^(https?:|#|data:)/.test(url))continue;
   const target=path.resolve(path.dirname(file),decodeURIComponent(url.split('#')[0]));
   if(!target.startsWith(docs+path.sep))errors.push(`Link escapes docs: ${url}`);
   else if(!fs.existsSync(target))errors.push(`Broken link in ${file}: ${url}`);
  }
 }
}
if(lessons.length!==32)errors.push('Expected 32 lessons');
if(interview.length!==21||new Set(interview.map(q=>q.number)).size!==21)errors.push('Expected 21 unique mapped questions');
for(const item of interview){
 for(const id of item.lessons)if(!lessons.some(l=>l.id===id))errors.push(`Q${item.number} maps to nonexistent lesson ${id}`);
 if(!item.sql||!item.expected||!item.note)errors.push(`Incomplete interview drill ${item.number}`);
}
for(const lesson of lessons){
 if(!lesson.concept||!lesson.task||!lesson.expected||!lesson.sql)errors.push(`Incomplete lesson ${lesson.id}`);
 if(lesson.questions.length!==2)errors.push(`Expected two questions: ${lesson.id}`);
 for(const question of lesson.questions)if(!question.options[question.answer]||!question.explanation)errors.push(`Invalid question in ${lesson.id}`);
 if(!fs.existsSync(path.join(docs,'sessions',`session-${lesson.id}`,'index.html')))errors.push(`Missing lesson ${lesson.id}`);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('Validated all local links, 32 lessons, 64 questions, and absence of stale branding/tracking.');
