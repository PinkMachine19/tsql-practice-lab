import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {lessons,groups} from './course.mjs';
import {interview} from './interview.mjs';
import {highlight} from './code-block.mjs';
test('syntax coloring preserves every character of all SQL scripts',()=>{
 const scripts=[...lessons.map(l=>l.sql),...interview.map(q=>q.sql),...['00-setup.sql','01-verify.sql'].map(name=>fs.readFileSync(new URL(`../sql/${name}`,import.meta.url),'utf8'))];
 for(const sql of scripts){
  const plain=highlight(sql).replace(/<\/?span\b[^>]*>/g,'').replaceAll('&quot;','"').replaceAll('&gt;','>').replaceAll('&lt;','<').replaceAll('&amp;','&');
  assert.equal(plain,sql);
 }
});
test('Course IDs, topics, and questions remain coherent',()=>{
 assert.equal(new Set(lessons.map(l=>l.id)).size,32);
 assert.equal(new Set(lessons.map(l=>l.group)).size,groups.length);
 for(const l of lessons){assert.equal(l.id,String(l.number).padStart(2,'0'));for(const q of l.questions){assert.equal(q.options.length,3);assert.ok(Number.isInteger(q.answer));assert.ok(q.answer>=0&&q.answer<q.options.length);}}
});
test('Capstone expected totals match the seeded business rules',()=>{
 const totals=new Map([[101,130],[102,200],[103,55],[104,80],[105,410],[106,20]]);
 const paid=new Map([[101,130],[103,55],[106,20]]);
 const orders=[[101,1,'Shipped'],[102,1,'Pending'],[103,2,'Shipped'],[104,3,'Cancelled'],[105,2,'Pending'],[106,4,'Shipped']];
 const result=[1,2,3,4,5].map(customer=>orders.filter(o=>o[1]===customer&&o[2]!=='Cancelled').reduce((sum,[id])=>sum+totals.get(id)-(paid.get(id)||0),0));
 assert.deepEqual(result,[200,410,0,0,0]);assert.equal(result.reduce((a,b)=>a+b,0),610);
});
test('Generated downloads match source solutions',()=>{
 for(const l of lessons){const source=fs.readFileSync(new URL(`../sql/lessons/${l.id}.sql`,import.meta.url),'utf8');assert.ok(source.includes(l.sql));assert.equal(source,fs.readFileSync(new URL(`../docs/sql/lessons/${l.id}.sql`,import.meta.url),'utf8'));}
});
