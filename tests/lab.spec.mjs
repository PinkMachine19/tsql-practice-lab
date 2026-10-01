import {test,expect} from '@playwright/test';
import {lessons} from '../scripts/course.mjs';
import {interview} from '../scripts/interview.mjs';
test('lesson quiz enforces completion, scores correctly, persists notes and completion',async({page})=>{
 await page.goto('/sessions/session-08/index.html');
 await expect(page.locator('.question')).toHaveCount(2);
 await page.getByRole('button',{name:'Check answers'}).click();
 await expect(page.getByRole('alert')).toHaveText('Answer every question before checking your results.');
 const lesson=lessons.find(l=>l.id==='08');
 for(let i=0;i<2;i++)await page.locator('.question').nth(i).locator('input').nth(lesson.questions[i].answer).check();
 await page.getByRole('button',{name:'Check answers'}).click();
 await expect(page.locator('.quiz-result')).toContainText('2 / 2 correct');
 await expect(page.locator('.feedback:visible')).toHaveCount(2);
 await page.getByRole('button',{name:'Try again'}).click();
 for(let i=0;i<2;i++)await page.locator('.question').nth(i).locator('input').nth((lesson.questions[i].answer+1)%3).check();
 await page.getByRole('button',{name:'Check answers'}).click();
 await expect(page.locator('.quiz-result')).toContainText('0 / 2 correct');
 await expect(page.locator('.feedback.incorrect')).toHaveCount(2);
 await page.locator('#lesson-notes').fill('COUNT(child key) preserves zero.');
 await page.getByRole('button',{name:'Mark lesson complete',exact:true}).click();
 await page.reload();
 await expect(page.locator('#lesson-notes')).toHaveValue('COUNT(child key) preserves zero.');
 await expect(page.locator('#complete-lesson')).toHaveAttribute('aria-pressed','true');
 await page.goto('/quizzes/index.html');
 await expect(page.locator('[data-score="08"]')).toHaveText('2 / 2');
 await expect(page.locator('#answer-progress')).toHaveText('2 / 64 questions answered');
 await page.goto('/');await expect(page.locator('#progress-count')).toHaveText('1');
});
test('bank filters topic, scores selected questions, and supports retake',async({page})=>{
 await page.goto('/quizzes/index.html');
 await page.locator('#quiz-topic').selectOption('0');
 await page.locator('#quiz-size').selectOption('all');
 await expect(page.locator('#start-quiz')).toBeEnabled();
 await page.locator('#start-quiz').click();
 await expect(page.locator('.question')).toHaveCount(6);
 const answers=lessons.flatMap(l=>l.questions);
 for(const field of await page.locator('.question').all()){
  const prompt=await field.locator('h3').textContent();const question=answers.find(q=>q.prompt===prompt);
  await field.locator('input').nth(question.answer).check();
 }
 await page.getByRole('button',{name:'Check answers'}).click();
 await expect(page.locator('.quiz-result')).toContainText('6 / 6 correct');
 await page.getByRole('button',{name:'Try again'}).click();
 await expect(page.locator('input:checked')).toHaveCount(0);
});
test('all 21 map anchors and SQL downloads exist; Q18 search and reverse links work',async({page,request})=>{
 await page.goto('/interview-map/index.html');
 await expect(page.locator('[data-map-question]')).toHaveCount(21);
 await page.locator('#map-search').fill('Q18');
 await expect(page.locator('[data-map-question]:visible')).toHaveCount(1);
 await expect(page.locator('#q18')).toBeVisible();
 await expect(page.locator('#mapping-table tbody tr:visible')).toHaveCount(1);
 await page.locator('#q18 summary').click();
 await expect(page.locator('#q18 pre')).toContainText('DENSE_RANK()');
 for(const item of interview){const response=await request.get(`/sql/interview/Q${String(item.number).padStart(2,'0')}.sql`);expect(response.ok()).toBeTruthy();expect(await response.text()).toContain(item.sql);}
 await page.goto('/sessions/session-16/index.html');
 await expect(page.locator('.sheet-bridge')).toContainText('Q18');
 await page.locator('.sheet-bridge a').first().click();
 await expect(page).toHaveURL(/interview-map\/index.html#q18$/);
});
test('lesson search routes correctly and handles no matches',async({page})=>{
 await page.goto('/sessions/index.html');await page.locator('#lesson-search').fill('multi-row trigger');
 await expect(page.locator('.lesson-card:visible')).toHaveCount(1);
 await page.locator('.lesson-card:visible').click();await expect(page).toHaveURL(/session-27\/index.html$/);
 await page.goto('/sessions/index.html');await page.locator('#lesson-search').fill('no-such-lesson-zz');
 await expect(page.locator('#search-status')).toHaveText('0 lessons found');
});
test('reset cancels safely and only deletes this lab state after confirmation',async({page})=>{
 await page.goto('/');await page.evaluate(()=>{localStorage.setItem('unrelated','keep');localStorage.setItem('tsql-practice-lab:v1',JSON.stringify({answers:{},scores:{'08':2},completed:{'08':true},notes:{'08':'note'}}));});
 await page.goto('/quizzes/index.html');
 page.once('dialog',d=>d.dismiss());await page.locator('#reset-progress').click();await expect(page.locator('[data-score="08"]')).toHaveText('2 / 2');
 page.once('dialog',d=>d.accept());await page.locator('#reset-progress').click();await expect(page.locator('[data-score="08"]')).toHaveText('Not attempted');
 expect(await page.evaluate(()=>localStorage.getItem('unrelated'))).toBe('keep');
});
test('mobile pages fit viewport and contain no runtime errors',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:390,height:844});
 for(const url of ['/','/quizzes/index.html','/interview-map/index.html','/sessions/session-27/index.html','/setup/index.html']){
  await page.goto(url);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
 }
 expect(errors).toEqual([]);
});
test('lesson still works when local storage is blocked',async({page})=>{
 await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw Error('blocked');};});
 await page.goto('/sessions/session-01/index.html');await expect(page.locator('.question')).toHaveCount(2);
 await page.locator('#lesson-notes').fill('Unsaved note');await expect(page.locator('#note-status')).toContainText('Not saved');
});
