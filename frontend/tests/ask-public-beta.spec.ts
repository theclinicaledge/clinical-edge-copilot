import {test,expect} from '@playwright/test';
test('public education consent, device header, feedback and withdrawal preserve privacy',async({page})=>{
  test.skip(process.env.CE_PUBLIC_BETA_UI_TEST!=='true','Runs against the explicit isolated beta preview.');
  const sent:any[]=[];
  await page.route('**/api/ask/v1/conversation/consent',route=>route.fulfill({contentType:'application/json',body:JSON.stringify(route.request().method()==='DELETE'?{consent:false}:{version:4,receipt:'a'.repeat(64),dailyQuestionAllowance:3})}));
  await page.route('**/api/ask/v1/conversation/preview',route=>{
    sent.push({body:route.request().postDataJSON(),headers:route.request().headers()});
    return route.fulfill({contentType:'application/json',body:JSON.stringify({requestId:'mock-request-123',contextMode:'general',answer:'Mock educational explanation.',details:[],evidence:{status:'not_independently_source_verified',sources:[]}})});
  });
  await page.goto('/ask');
  await expect(page.getByRole('heading',{name:'Ask Clinical Edge — Public Beta',exact:true})).toBeVisible();
  await expect(page.getByText(/Each submitted conversational question, including follow-ups/)).toBeVisible();
  await page.getByRole('button',{name:'Enable educational conversation'}).click();
  await expect(page.getByText(/Daily allowance: 3 counted AI questions per device/)).toBeVisible();
  await page.getByLabel('Nursing question').fill('Explain ventricular compliance.');
  await page.getByRole('button',{name:'Ask Clinical Edge',exact:true}).click();
  await expect(page.getByText('Mock educational explanation.')).toBeVisible();
  expect(sent[0].body).toEqual({question:'Explain ventricular compliance.'});
  expect(sent[0].headers['x-ce-device']).toMatch(/^[a-f0-9-]{36}$/);
  const href=await page.getByRole('link',{name:'Report a concern'}).getAttribute('href');
  expect(href).toContain('mock-request-123');expect(decodeURIComponent(href!)).not.toContain('ventricular compliance');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`/private/tmp/ce-public-beta-${test.info().project.name}.png`,fullPage:true});
  await page.getByRole('button',{name:'Withdraw educational AI consent'}).click();
  await expect(page.getByText('Mock educational explanation.')).toHaveCount(0);
  expect(await page.evaluate(()=>JSON.stringify(localStorage))).not.toContain('Mock educational explanation');
});
