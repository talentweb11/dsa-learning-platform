import { test,expect } from '@playwright/test';

test('learner explores, filters, studies, and preserves lesson progress',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('heading',{name:/Build your problem-solving instinct/})).toBeVisible();
  await page.screenshot({path:'test-results/overview-desktop.png',fullPage:true});
  await page.getByRole('link',{name:'Start learning',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Arrays',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Mark lesson complete'}).click();
  await page.reload();
  await expect(page.getByRole('button',{name:'Completed · mark unread'})).toBeVisible();
  await page.goto('/#/practice');
  await page.getByRole('button',{name:'Hard',exact:true}).click();
  await page.getByLabel('Practice mode',{exact:true}).selectOption('unguided');
  await expect(page.locator('.table-row')).toHaveCount(5);
  await page.getByLabel('Search problem titles').fill('rising');
  await expect(page.locator('.table-row')).toHaveCount(1);
  await page.locator('.table-row').click();
  await expect(page.getByRole('heading',{name:'Longest rising chain'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Hints',exact:true})).toHaveCount(0);
  await expect(page.getByLabel('Language',{exact:true})).toHaveValue('python');
});

test('drafts stay separate, samples show feedback, submit records completion',async({page})=>{
  const requests:Record<string,unknown>[]=[];
  await page.route('https://runner.example.test/api/grade',async route=>{
    const data=route.request().postDataJSON();requests.push(data);
    await route.fulfill({json:{executionStatus:'accepted',testResults:[{index:0,passed:true,...(data.action==='run'?{input:{numbers:[2,4,1,3],target:0},expected:[2,6,7,10],actual:[2,6,7,10]}:{})}],elapsedMs:12,stdout:'',stderr:'',message:'All tests passed.'}});
  });
  await page.goto('/#/problem/running-totals/guided');
  const editor=page.locator('.cm-content');await expect(editor).toBeVisible();
  await editor.fill('def solve(numbers, target):\n    return [2, 6, 7, 10]');
  await page.getByLabel('Language',{exact:true}).selectOption('java');
  await expect(editor).toContainText('class Solution');
  await page.getByLabel('Language',{exact:true}).selectOption('python');
  await expect(editor).toContainText('return [2, 6, 7, 10]');
  await page.reload();await expect(editor).toContainText('return [2, 6, 7, 10]');
  await page.getByRole('button',{name:'Hints',exact:true}).click();
  await page.getByRole('button',{name:'Reveal next hint'}).click();
  await expect(page.getByText('Keep a running total as you move from left to right.')).toBeVisible();
  await page.getByRole('button',{name:'Run samples'}).click();
  await expect(page.getByText('All tests passed.')).toBeVisible();
  await page.getByText('Test 1 · Passed').click();
  await expect(page.getByText(/Expected: \[2,6,7,10\]/)).toBeVisible();
  await page.getByRole('button',{name:'Submit',exact:true}).click();
  await expect(page.getByText('Solved in Python')).toBeVisible();
  await page.reload();await expect(page.getByText('Solved in Python')).toBeVisible();
  expect(requests.map(r=>r.action)).toEqual(['run','submit']);
  await page.goto('/#/progress');await expect(page.locator('.stat-value').first()).toContainText('1');
});

test('runner outage preserves draft and mobile navigation fits',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.route('https://runner.example.test/api/grade',route=>route.fulfill({status:503,json:{error:'The execution service is unavailable. Your draft has been preserved.'}}));
  await page.goto('/#/problem/pair-budget/unguided');
  await expect(page.locator('.cm-content')).toBeVisible();
  await page.getByRole('button',{name:'Run samples'}).click();
  await expect(page.getByRole('alert')).toContainText('unavailable');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/workspace-mobile.png',fullPage:true});
  await page.getByRole('button',{name:'Toggle navigation'}).click();
  await page.getByRole('link',{name:'Overview',exact:true}).click();
  await expect(page.getByRole('heading',{name:/Build your problem-solving instinct/})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});

test('reset requires confirmation and invalid backups are rejected',async({page})=>{
  await page.goto('/#/problem/running-totals/guided');
  const editor=page.locator('.cm-content');await expect(editor).toBeVisible();await editor.fill('# keep my draft');
  page.once('dialog',dialog=>dialog.dismiss());
  await page.getByRole('button',{name:'Reset current draft'}).click();
  await expect(editor).toContainText('# keep my draft');
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Reset current draft'}).click();
  await expect(editor).toContainText('___');
  await page.goto('/#/progress');
  await page.getByLabel('Import progress backup').setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from('{broken')});
  await expect(page.getByRole('status')).toContainText('Import failed');
});
