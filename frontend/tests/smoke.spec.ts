import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Fresh localStorage per test so recent/saved-case/prefill state can't leak in.
  await page.addInitScript(() => localStorage.clear());
});

test('home hub loads and shows module navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Clinical tools for real-world nursing.' })).toBeVisible();
  await expect(page.getByText('Copilot', { exact: true })).toBeVisible();
  await expect(page.getByText('Rhythm Lab', { exact: true })).toBeVisible();
  await expect(page.getByText('ICU Drips', { exact: true })).toBeVisible();
  await expect(page.getByText('Reference Hub', { exact: true })).toBeVisible();
  await expect(page.getByText('ABG & Oxygenation Lab', { exact: true })).toBeVisible();
});

test('copilot route loads and shows its main input', async ({ page }) => {
  await page.goto('/copilot');
  await expect(page.getByPlaceholder('What are you thinking through right now?')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ask Copilot' })).toBeVisible();
});

test('rhythm lab route loads', async ({ page }) => {
  await page.goto('/rhythm-lab');
  await expect(page.getByRole('heading', { name: 'Rhythm Lab' })).toBeVisible();
});

test('icu drips route loads', async ({ page }) => {
  await page.goto('/icu-drips');
  await expect(page.getByRole('heading', { name: 'ICU Drips' })).toBeVisible();
});

test('reference hub search accepts input and displays matching content', async ({ page }) => {
  await page.goto('/reference-hub');
  const search = page.getByPlaceholder('Search references…');
  await search.fill('lactate');
  await expect(page.getByText('Serum Lactate')).toBeVisible();
});

test('reference hub aliases match new entries', async ({ page }) => {
  await page.goto('/reference-hub');
  const search = page.getByPlaceholder('Search references…');

  await search.fill('iCa');
  await expect(page.getByText('Serum Calcium', { exact: true })).toBeVisible();

  await search.fill('Mg');
  await expect(page.getByText('Serum Magnesium', { exact: true })).toBeVisible();

  await search.fill('PERRLA');
  await expect(page.getByText('Pupil Assessment (PERRLA)', { exact: true })).toBeVisible();

  await search.fill('Glasgow');
  await expect(page.getByText('Glasgow Coma Scale (GCS)', { exact: true })).toBeVisible();

  await search.fill('pleur-evac');
  await expect(page.getByText('Chest Tube / Pleural Drainage System', { exact: true })).toBeVisible();
});

test('neuro assessment category appears and filters to the new entries', async ({ page }) => {
  await page.goto('/reference-hub');
  await page.getByRole('button', { name: 'Neuro Assessment' }).click();
  await expect(page.getByText('Glasgow Coma Scale (GCS)', { exact: true })).toBeVisible();
  await expect(page.getByText('Pupil Assessment (PERRLA)', { exact: true })).toBeVisible();
});

test('opening a new reference detail view works', async ({ page }) => {
  await page.goto('/reference-hub');
  await page.getByPlaceholder('Search references…').fill('Serum Calcium');
  await page.getByRole('button', { name: 'Serum Calcium' }).click();
  await expect(page.getByRole('heading', { name: 'Serum Calcium' })).toBeVisible();
  await expect(page.getByText('When albumin or acid-base status is abnormal, total and ionized calcium may tell different stories.')).toBeVisible();
});

test('abg lab example can be selected and interpreted', async ({ page }) => {
  await page.goto('/abg-lab');
  await page.getByRole('button', { name: 'Respiratory acidosis' }).click();
  await expect(page.getByText('Pattern Summary')).toBeVisible();
  await expect(page.getByText('How I Read It')).toBeVisible();
});

test('quickstart option can be selected and completed', async ({ page }) => {
  await page.goto('/quickstart');
  const textarea = page.getByPlaceholder('e.g. BP dropping post-op and patient looks pale, HR climbing...');
  await page.getByRole('button', { name: 'BP dropping post-op' }).click();
  await expect(textarea).toHaveValue('BP dropping post-op');

  await page.getByRole('button', { name: 'Start thinking it through →' }).click();
  await page.waitForURL('**/copilot');
  await expect(page.getByPlaceholder('What are you thinking through right now?')).toHaveValue('BP dropping post-op');
});

test('scenario advances from the first step to the next step', async ({ page }) => {
  await page.goto('/scenario');
  await page.getByRole('button', { name: 'Think it through →' }).click();
  await expect(page.getByRole('heading', { name: 'What are you thinking?' })).toBeVisible();
});

test('privacy page loads', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
});

test('support page loads', async ({ page }) => {
  await page.goto('/support');
  await expect(page.getByRole('heading', { name: 'Support' })).toBeVisible();
});

test('download page loads', async ({ page }) => {
  await page.goto('/download');
  await expect(page.getByRole('heading', { name: 'Clinical reasoning support for nurses.' })).toBeVisible();
});
