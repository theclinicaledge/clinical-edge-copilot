import { test, expect } from '@playwright/test';

test('Shift 5 is reachable from the public library and four earlier Shifts remain available', async ({ page }) => {
  await page.goto('/learn/shifts');
  const cards = page.locator('.shift-library-card');
  await expect(cards).toHaveCount(6);
  for (const title of ['The Drowsy Patient', 'The Monitor Alarm', 'The Discharge Puzzle', 'The Conversation That Changes Everything']) {
    await expect(cards.filter({ hasText: title })).toBeVisible();
  }
  await cards.filter({ hasText: 'Which Patient First?' }).getByRole('link', { name: /Begin shift|Continue shift|Return to debrief/ }).click();
  await expect(page).toHaveURL(/\/learn\/shifts\/which-patient-first$/);
  await expect(page.getByRole('heading', { name: 'Which patient first?' })).toBeVisible();
  await page.getByRole('button', { name: 'Sources & review' }).click();
  await expect(page.locator('.shift-review-dialog')).toContainText('Founder reports that an independent nurse reviewed this scenario');
  await expect(page.locator('.shift-review-dialog')).toContainText('Not supplied');
  await page.getByRole('button', { name: 'Close source record' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Which patient first?' })).toBeVisible();
});

async function begin(page) {
  await page.goto('/learn/shifts/which-patient-first');
  await page.getByRole('button', { name: 'Start over' }).click();
  await page.getByRole('button', { name: 'Plan my round' }).click();
  for (const room of ['414', '412', '410', '416']) await page.locator('.s5-round-rooms').getByRole('button', { name: new RegExp(`ROOM ${room}`) }).click();
  await page.getByRole('button', { name: 'Most potential to change soon' }).click();
  await page.getByRole('button', { name: 'Set my plan' }).click();
  await page.getByRole('button', { name: 'Continue shift' }).click();
}

async function dispatchV1(page) {
  const room = id => page.locator('.s5-dispatch').filter({ hasText: `ROOM ${id}` });
  await room('410').getByRole('button', { name: 'Jordan', exact: true }).click();
  await room('410').getByRole('button', { name: /She's a high fall risk/ }).click();
  await room('412').getByRole('button', { name: 'You', exact: true }).click();
  await room('416').getByRole('button', { name: 'Hold / Sam' }).click();
  await room('416').getByRole('button', { name: /Your nurse knows your ride/ }).click();
  await page.getByRole('button', { name: 'Send assignments' }).click();
}

test('public Shift 5 flow keeps observations, coverage and debrief honest on mobile', async ({ page }) => {
  const apiRequests: string[] = [];
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) apiRequests.push(request.url()); });
  await page.setViewportSize({ width: 390, height: 844 });
  await begin(page);
  await expect(page.getByRole('heading', { name: 'Who’s available?' })).toBeVisible();
  await expect(page.locator('.s5-rail-staff')).toContainText('Charge RN');
  await dispatchV1(page);
  await expect(page.getByText('Dispatch V1.')).toBeVisible();
  await page.getByRole('button', { name: 'Follow the shift' }).click();
  await page.getByRole('button', { name: 'Continue to 0730' }).click();
  await expect(page.locator('.s5-board')).toContainText('Coverage is not assigned yet');
  await expect(page.getByRole('button', { name: /Room 410.*Coverage needed/ })).toBeVisible();
  await expect(page.locator('.s5-progress')).toContainText('Step 5 of 8');
  await expect(page.locator('.s5-cover-scene .s5-eyebrow')).toBeHidden();
  const labels = await page.locator('.s5-cover-scene .s5-section-label').allTextContents();
  expect(labels).toEqual(['What changed?', 'What needs covering?', 'Who’s available?', 'What will you do next?']);
  await expect(page.locator('.s5-selected-preview')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Choose an option' })).toBeDisabled();
  await expect(page.locator('.s5-cover-scene .s5-staff-list')).toContainText('Dee');
  await expect(page.locator('.s5-cover-scene .s5-staff-list')).toContainText('to 0800');
  await expect(page.getByText("Dee, 414's pressure is dropping and I'm going now.")).toHaveCount(0);
  await page.getByRole('button', { name: /^A\. Dee/ }).click();
  await expect(page.getByRole('button', { name: /^A\. Dee/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.s5-selected-preview')).toContainText("Dee, 414's pressure is dropping");
  await expect(page.getByRole('button', { name: /Room 410.*Coverage needed/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: /^A\. Dee/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.s5-selected-preview')).toContainText("Dee, 414's pressure is dropping");
  await expect(page.getByText('0742 glucose recheck and RN reassessment')).toBeVisible();
  await expect(page.getByText('A named RN watching your other rooms')).toBeVisible();
  await page.getByRole('button', { name: 'Send handoff' }).click();
  await expect(page.getByText(/Got it\. 412 at 0742/)).toBeVisible();
  await page.getByRole('button', { name: 'Go to Room 414' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Room 414 is changing' })).toBeVisible();
  await page.getByRole('button', { name: 'Call the surgical provider' }).click();
  await page.getByRole('button', { name: 'Act now' }).click();
  await expect(page.getByRole('button', { name: /Bright red drainage/ })).toHaveCount(0);
  await page.getByRole('button', { name: /^HR 88 to 112/ }).click();
  await page.getByRole('button', { name: 'Give report' }).click();
  await expect(page.getByText('YOUR SUBMITTED REPORT').locator('..')).not.toContainText('bleeding');
  await page.getByRole('button', { name: /^Got it: you're coming/ }).click();
  await page.getByRole('button', { name: 'Respond' }).click();
  await page.getByRole('button', { name: 'Check the loose ends' }).click();
  const cards = page.locator('.s5-loose');
  const followUp = async (title, pattern) => {
    const card = cards.filter({ hasText: title });
    await card.getByRole('radio', { name: pattern }).check();
    await expect(card.getByText('Open', { exact: true })).toBeVisible();
    await card.getByRole('button', { name: 'Confirm follow-up' }).click();
  };
  await followUp('416 / Ms. Whitfield', /Ask the confirmed/);
  await expect(cards.filter({ hasText: '416 / Ms. Whitfield' })).toContainText('Pending coverage');
  for (const [title, pattern] of [['412 / Mr. Okafor', /Check in on him/], ['414 / Your role', /Stay with his care/], ['Jordan / delegated work', /Thank Jordan/]]) await followUp(title, pattern);
  await followUp('Coverage / 410', /Dee, can you continue/);
  await expect(page.getByRole('button', { name: 'See shift debrief' })).toBeDisabled();
  await expect(cards.filter({ hasText: 'Coverage / 410' })).toContainText('Coverage is not confirmed until Dee accepts out loud.');
  await expect(cards.filter({ hasText: '412 / Mr. Okafor' })).toContainText('stays pending until Dee explicitly accepts coverage');
  await expect(cards.filter({ hasText: '416 / Ms. Whitfield' })).toContainText('stays pending until Dee explicitly accepts coverage');
  await page.getByRole('button', { name: "Hear Dee's reply" }).click();
  await expect(cards.filter({ hasText: '416 / Ms. Whitfield' })).toContainText('Story loop closed');
  await page.getByRole('button', { name: 'See shift debrief' }).click();
  await expect(page.getByRole('heading', { name: /You kept every room covered/ })).toBeVisible();
  await expect(page.locator('.s5-event').first()).toContainText('Her discharge teaching is still pending');
  await expect(page.locator('.s5-debrief')).not.toContainText('Bright red drainage');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', await page.evaluate(() => document.body.clientWidth));
  await page.getByRole('region', { name: 'Your next step' }).getByRole('link', { name: 'Prepare a question' }).click();
  await expect(page).toHaveURL(/which-patient-first\/ask\?topic=delegation/);
  await expect(page.locator('.shift-handoff')).toContainText('Nothing is submitted automatically');
  await page.getByRole('link', { name: /Return to Which Patient First/ }).click();
  await expect(page.getByRole('heading', { name: /You kept every room covered/ })).toBeVisible();
  expect(apiRequests).toEqual([]);
});

test('V5 settle-first and Priya-to-Dee handoff keep their explicit timing', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await begin(page);
  const room = id => page.locator('.s5-dispatch').filter({ hasText: `ROOM ${id}` });
  await room('410').getByRole('button', { name: 'You', exact: true }).click();
  await room('412').getByRole('button', { name: 'Priya', exact: true }).click();
  await room('416').getByRole('button', { name: 'Hold / Sam' }).click();
  await room('416').getByRole('button', { name: /Your nurse knows your ride/ }).click();
  await page.getByRole('button', { name: 'Send assignments' }).click();
  await expect(page.getByText('Dispatch V5.')).toBeVisible();
  await page.getByRole('button', { name: 'Follow the shift' }).click();
  await expect(page.getByText(/You help Ms\. Alvarez/)).toBeVisible();
  await page.getByRole('button', { name: 'Continue to 0730' }).click();
  await page.getByRole('button', { name: /^B\. Priya/ }).click();
  await page.getByRole('button', { name: /^Help her back to bed first/ }).click();
  await page.getByRole('button', { name: 'Send handoff' }).click();
  await expect(page.getByText(/Priya's task ends at 0745/)).toBeVisible();
  await expect(page.getByText(/Dee: “Yes. I have 410, 412 and 416 until 0800/)).toBeVisible();
  await page.getByRole('button', { name: 'Go to Room 414' }).click();
  await expect(page.locator('.s5-board-head')).toContainText('0735');
  await page.getByRole('button', { name: 'Current vitals' }).click();
  await expect(page.getByText(/0735: HR 118, BP 92\/58/)).toBeVisible();
});

test('keyboard can dispatch and unsafe path retains multiple reasons', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await begin(page);
  const room = id => page.locator('.s5-dispatch').filter({ hasText: `ROOM ${id}` });
  await room('410').getByRole('button', { name: 'You', exact: true }).focus();
  await page.keyboard.press('Enter');
  await room('412').getByRole('button', { name: 'Jordan', exact: true }).click();
  await room('416').getByRole('button', { name: 'Hold / Sam' }).click();
  await room('416').getByRole('button', { name: /Your nurse knows your ride/ }).click();
  await page.getByRole('button', { name: 'Send assignments' }).click();
  await expect(room('412')).toContainText('Outside role');
  await expect(room('412')).toContainText('Unsafe');
  await expect(page.getByText(/Taking the safer approach: you go to 412/)).toBeVisible();
  await page.getByRole('button', { name: 'Follow the shift' }).click();
  await page.getByRole('button', { name: 'Continue to 0730' }).click();
  await page.getByRole('button', { name: /^F\. Ask Jordan/ }).click();
  await expect(page.getByRole('button', { name: 'Ask Jordan to check 414' })).toBeEnabled();
  await page.getByRole('button', { name: 'Ask Jordan to check 414' }).click();
  await expect(page.locator('.s5-feedback').last()).toContainText('Outside role');
  await expect(page.locator('.s5-feedback').last()).toContainText('Unsafe');
});

test('unfinished planning resumes locally and the release stays readable at 390 and 1440', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/learn/shifts/which-patient-first');
  await page.getByRole('button', { name: 'Start over' }).click();
  await page.getByRole('button', { name: 'Plan my round' }).click();
  await page.locator('.s5-round-rooms').getByRole('button', { name: /ROOM 414/ }).click();
  await expect(page.locator('.s5-report-reminder')).toContainText('Open bowel surgery ended at 0300');
  await page.reload();
  await expect(page.locator('.s5-order')).toContainText('414');
  await expect(page.locator('.s5-report-reminder')).toContainText('Open bowel surgery ended at 0300');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', await page.evaluate(() => document.body.clientWidth));
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', await page.evaluate(() => document.body.clientWidth));
});

test('coverage choices preview without sending and restore at narrow mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await begin(page);
  await dispatchV1(page);
  await page.getByRole('button', { name: 'Follow the shift' }).click();
  await page.getByRole('button', { name: 'Continue to 0730' }).click();
  await page.getByRole('button', { name: /^E\. Finish/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: /^E\. Finish/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.s5-selected-preview')).toContainText('Stay with Mr. Okafor until his 0742 recheck, then go.');
  await expect(page.getByRole('button', { name: 'Finish current task' })).toBeEnabled();
  await expect(page.locator('.s5-feedback')).toHaveCount(0);
  await expect(page.locator('.s5-board-note')).toContainText('Coverage is not assigned yet');
  await page.reload();
  await expect(page.getByRole('button', { name: /^E\. Finish/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.s5-selected-preview')).toContainText('Stay with Mr. Okafor');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', await page.evaluate(() => document.body.clientWidth));
  await page.getByText('View delegation rules').click();
  await expect(page.locator('.s5-team')).toHaveAttribute('open', '');
});
