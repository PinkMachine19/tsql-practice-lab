import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {lessons} from '../scripts/course.mjs';
import {interview} from '../scripts/interview.mjs';
test.describe('inline SQL and clipboard',()=>{
 test.describe.configure({mode:'default'});
 test('copy submits exact SQL during the tap; Chromium also verifies native paste',async({page,isMobile,browserName})=>{
  if(browserName==='webkit')await page.addInitScript(()=>{
   const original=navigator.clipboard.writeText.bind(navigator.clipboard);
   navigator.clipboard.writeText=text=>{
    window.copyObservation={text,active:navigator.userActivation.isActive};
    return original(text);
   };
  });
  await page.goto('/sessions/session-21/index.html#solution');
  const block=page.locator('#solution .code-wrap');
  await expect(block).toBeVisible();
  expect(await block.locator('pre code').textContent()).toBe(lessons[20].sql);
  await expect(block.locator('.sql-keyword').first()).toBeVisible();
  if(isMobile)await block.locator('.copy').tap();else await block.locator('.copy').click();
  await expect(block.locator('.copy-status')).toContainText('SQL copied.');
  if(browserName==='webkit'){
   // Windows WebKit automation cannot reliably round-trip the host clipboard.
   // The original writeText still runs; verify its content and live tap activation.
   expect(await page.evaluate(()=>window.copyObservation)).toEqual({text:lessons[20].sql,active:true});
  }else{
   await page.locator('#lesson-notes').focus();await page.keyboard.press('ControlOrMeta+V');
   await expect(page.locator('#lesson-notes')).toHaveValue(lessons[20].sql);
  }
  const height=await block.locator('.copy').evaluate(node=>node.getBoundingClientRect().height);expect(height).toBeGreaterThanOrEqual(44);
 });
 test('blocked clipboard gives selectable complete text without claiming success',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new DOMException('Blocked','NotAllowedError'))}}));
  await page.goto('/interview-map/index.html#q20-sql');
  const block=page.locator('#q20-sql .code-wrap');
  await block.locator('.copy').click();
  await expect(block.locator('.copy-fallback')).toBeVisible();
  await expect(block.locator('.copy-text')).toHaveValue(interview[19].sql);
  await expect(block.locator('.copy-status')).not.toContainText('SQL copied.');
  await block.locator('.select-code').click();
  const range=await block.locator('.copy-text').evaluate(node=>[node.selectionStart,node.selectionEnd]);
  expect(range).toEqual([0,interview[19].sql.length]);
 });
 test('setup and library expose exact scripts inline, with expandable anchor links',async({page})=>{
  const seed=fs.readFileSync(new URL('../sql/00-setup.sql',import.meta.url),'utf8');
  const verify=fs.readFileSync(new URL('../sql/01-verify.sql',import.meta.url),'utf8');
  await page.goto('/setup/index.html#setup-sql');
  expect(await page.locator('#setup-sql pre code').textContent()).toBe(seed);
  await expect(page.locator('#setup-sql')).toHaveAttribute('open','');
  await page.goto('/labs/index.html#verify-sql');
  expect(await page.locator('#verify-sql pre code').textContent()).toBe(verify);
  await expect(page.locator('.script-block')).toHaveCount(34);
  for(const url of ['/setup/index.html','/labs/index.html','/sessions/session-21/index.html','/interview-map/index.html']){
   await page.goto(url);await expect(page.locator('a[download], a[href$=".sql"]')).toHaveCount(0);
  }
 });
 test('line wrapping changes display only and code blocks fit tablet and phone widths',async({page})=>{
  await page.goto('/interview-map/index.html#q18-sql');
  const block=page.locator('#q18-sql .code-wrap');const before=await block.locator('pre code').textContent();
  await block.locator('.wrap-code').check();await expect(block).toHaveClass(/wrapped/);
  expect(await block.locator('pre code').textContent()).toBe(before);
  for(const width of [834,390]){await page.setViewportSize({width,height:1100});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();}
 });
});
