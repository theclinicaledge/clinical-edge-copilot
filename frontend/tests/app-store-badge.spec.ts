import { test, expect, type Page } from '@playwright/test';

const APP_STORE_URL = 'https://apps.apple.com/app/id6761643064';
const SAFARI_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const IOS_WEBVIEW = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
const TAGGED_APP = `${IOS_WEBVIEW} ClinicalEdgeApp/1.0.3`;
const INSTAGRAM_IOS = `${IOS_WEBVIEW} Instagram 350.0.0.18.106 (iPhone15,2; iOS 18_0; en_US; en-US; scale=3.00; 1179x2556; 642541213)`;
const TIKTOK_IOS = `${IOS_WEBVIEW} musical_ly_36.5.0 JsSdk/2.0 NetType/WIFI Channel/App Store ByteLocale/en Region/US BytedanceWebview/d8a21c6`;
const FACEBOOK_IOS = `${IOS_WEBVIEW} [FBAN/FBIOS;FBAV/480.0.0.48.107;FBBV/654321;FBDV/iPhone15,2;FBMD/iPhone;FBSN/iOS;FBSV/18.0;FBSS/3;FBID/phone;FBLC/en_US;FBOP/5]`;

const PLACEMENTS: [string, string[]][] = [
  ['/landing', ['landing', 'footer']],
  ['/download', ['download', 'download', 'footer']],
  ['/', ['footer']],
  ['/blog/abg-interpretation-for-nurses', ['footer']],
];

async function badges(page: Page) {
  return page.locator('.ce-app-store-badge').evaluateAll(links => links.map(link => {
    const a = link as HTMLAnchorElement;
    const img = a.querySelector('img')!;
    const box = img.getBoundingClientRect();
    return { placement: a.dataset.placement, href: a.getAttribute('href'), target: a.target, rel: a.rel, alt: img.alt, src: img.getAttribute('src'), height: box.height, ratio: box.width / box.height, padding: parseFloat(getComputedStyle(a).paddingTop), visible: getComputedStyle(a).display !== 'none' };
  }));
}

test('the Smart App Banner meta tag is present', async ({ page }) => {
  for (const path of ['/', '/landing', '/download']) {
    await page.goto(path);
    await expect(page.locator('meta[name="apple-itunes-app"]')).toHaveAttribute('content', 'app-id=6761643064');
  }
});

test('the self-hosted official badge artwork is served unmodified as SVG', async ({ request }) => {
  const response = await request.get('/badges/download-on-the-app-store.svg');
  expect(response.ok()).toBe(true);
  const svg = await response.text();
  expect(svg).toContain('viewBox="0 0 119.66407 40"');
  expect(svg).not.toMatch(/<script|onload=|javascript:/i);
});

for (const [path, expected] of PLACEMENTS) {
  test(`badge renders on ${path} as a plain App Store link, at least 40px tall, not squished`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('.ce-app-store-badge').first()).toBeVisible();
    const found = await badges(page);
    expect(found.map(b => b.placement)).toEqual(expected);
    for (const badge of found) {
      expect(badge).toMatchObject({ href: APP_STORE_URL, target: '_blank', alt: 'Download on the App Store', src: '/badges/download-on-the-app-store.svg', visible: true });
      expect(badge.rel.split(' ').sort()).toEqual(['noopener', 'noreferrer']);
      expect(badge.height).toBeGreaterThanOrEqual(40);
      expect(badge.ratio).toBeCloseTo(119.66407 / 40, 2);
      expect(badge.padding).toBeGreaterThanOrEqual(badge.height / 4);
    }
    expect(await page.locator('.ce-app-store-badge').evaluateAll(links => links.every(a => !a.closest('button')))).toBe(true);
  });
}

test.describe('inside the iOS app', () => {
  for (const [label, userAgent] of [['tagged wrapper user agent', TAGGED_APP], ['iOS web view without Safari (interim)', IOS_WEBVIEW]]) {
    test.describe(label, () => {
      test.use({ userAgent });
      test('no App Store badge on any page', async ({ page }) => {
        for (const [path] of PLACEMENTS) {
          await page.goto(path);
          await expect(page.locator('h1').first()).toBeVisible();
          await expect(page.locator('html')).toHaveAttribute('data-ce-native-app', 'true');
          await expect(page.locator('.ce-app-store-badge')).toHaveCount(0);
          await expect(page.getByAltText('Download on the App Store')).toHaveCount(0);
        }
      });
    });
  }

  test.describe('ClinicalEdgeApp tag alongside a social token', () => {
    test.use({ userAgent: `${INSTAGRAM_IOS} ClinicalEdgeApp/1.0.3` });
    test('the app tag still hides the badge', async ({ page }) => {
      await page.goto('/landing');
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-ce-native-app', 'true');
      await expect(page.locator('.ce-app-store-badge')).toHaveCount(0);
    });
  });

  test.describe('iPhone Safari', () => {
    test.use({ userAgent: SAFARI_IPHONE });
    test('shows the badge and is not flagged as the app', async ({ page }) => {
      await page.goto('/landing');
      await expect(page.locator('html')).not.toHaveAttribute('data-ce-native-app', 'true');
      await expect(page.locator('.ce-app-store-badge[data-placement="landing"]')).toBeVisible();
    });
  });
});

async function captureAnalytics(page: Page) {
  const events: unknown[][] = [];
  page.on('console', async message => {
    if (message.text().startsWith('[analytics]')) events.push(await Promise.all(message.args().map(arg => arg.jsonValue())));
  });
  await page.context().route('https://apps.apple.com/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: 'App Store' }));
  return events;
}

test('clicking a badge sends only app_store_badge_clicked with its placement, through trackEvent', async ({ page }) => {
  const events = await captureAnalytics(page);
  for (const [path, placement] of [['/landing', 'landing'], ['/download', 'download'], ['/', 'footer']]) {
    await page.goto(path);
    const badge = page.locator(`.ce-app-store-badge[data-placement="${placement}"]`).first();
    const [popup] = await Promise.all([page.waitForEvent('popup'), badge.click()]);
    await popup.close();
  }
  await expect.poll(() => events.filter(e => e[1] === 'app_store_badge_clicked')).toEqual([
    ['[analytics]', 'app_store_badge_clicked', { placement: 'landing' }],
    ['[analytics]', 'app_store_badge_clicked', { placement: 'download' }],
    ['[analytics]', 'app_store_badge_clicked', { placement: 'footer' }],
  ]);
  expect(events.some(e => e[1] === 'app_store_click')).toBe(false);
});

test.describe('without analytics consent', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test('a badge click sends no analytics', async ({ page }) => {
    const events = await captureAnalytics(page);
    await page.goto('/landing');
    const [popup] = await Promise.all([page.waitForEvent('popup'), page.locator('.ce-app-store-badge[data-placement="landing"]').click()]);
    await popup.close();
    await page.waitForTimeout(200);
    expect(events).toEqual([]);
  });
});

test.describe('375px mobile layout', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  for (const [path] of PLACEMENTS) {
    test(`no horizontal overflow and badges keep their shape on ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('.ce-app-store-badge').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      for (const badge of await badges(page)) {
        expect(badge.height).toBeGreaterThanOrEqual(40);
        expect(badge.ratio).toBeCloseTo(119.66407 / 40, 2);
      }
    });
  }
});

// Social in-app browsers are iOS web views without "Safari/", but social traffic lands there,
// so they must keep the badge.
for (const [label, userAgent] of [['Instagram iOS in-app browser', INSTAGRAM_IOS], ['TikTok iOS in-app browser', TIKTOK_IOS], ['Facebook iOS in-app browser', FACEBOOK_IOS]]) {
  test.describe(label, () => {
    test.use({ userAgent });
    test('shows the badge and is not treated as the Clinical Edge app', async ({ page }) => {
      for (const [path, expected] of PLACEMENTS) {
        await page.goto(path);
        await expect(page.locator('.ce-app-store-badge').first()).toBeVisible();
        await expect(page.locator('html')).not.toHaveAttribute('data-ce-native-app', 'true');
        expect((await badges(page)).map(b => b.placement)).toEqual(expected);
      }
    });
  });
}
