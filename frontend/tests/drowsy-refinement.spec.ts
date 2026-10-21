import { test, expect } from '@playwright/test';
test.use({ storageState: { cookies: [], origins: [] } });
for (const width of [320,390,1440]) {
  for (const stage of [3,5]) {
    test(`selection, confirmation and resume ${stage} at ${width}`, async ({page}) => {
      await page.setViewportSize({width,height:844});
      await page.goto('/');
      await page.evaluate(stage => localStorage.setItem('ce-private-shift-drowsy-r2',JSON.stringify({version:1,stage,viewed:[],revealed:[],selected:[],answers:{priority:'12',cues:['loc','rr'],...(stage===5?{action:'escalate',abg:'partial'}:{})}})),stage);
      await page.goto('/learn/shifts/drowsy-patient');
      const confirm=page.getByRole('button',{name:stage===3?'Confirm my action':'Confirm my SBAR'});
      await expect(confirm).toBeDisabled();
      const radios=page.getByRole('radio');
      await expect(radios).toHaveCount(stage===3?6:3);
      await radios.nth(1).focus();
      await radios.nth(1).press('Space');
      await expect(page.getByRole('region',{name:'Decision feedback'})).toHaveCount(0);
      await expect(confirm).toBeEnabled();
      await confirm.click();
      await expect(page.getByRole('region',{name:'Decision feedback'})).toBeVisible();
      await expect(radios.nth(1)).toBeDisabled();
      await page.reload();
      await expect(radios.nth(1)).toBeChecked();
      await expect(radios.nth(1)).toBeDisabled();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      if(width===390) {await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`/private/tmp/drowsy-refinement-${stage}.png`});}
    });
  }
}
