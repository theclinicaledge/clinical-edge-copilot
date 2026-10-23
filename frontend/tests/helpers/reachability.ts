import { expect, type Page } from '@playwright/test';

async function scrollEnd(page: Page) {
  await page.evaluate(() => {
    for (const e of document.querySelectorAll<HTMLElement>('#root *')) {
      if (e.getClientRects().length && /auto|scroll/.test(getComputedStyle(e).overflowY)) e.scrollTop = e.scrollHeight;
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
}
async function contentClearance(page: Page) {
  return page.evaluate(() => {
    const dock = document.querySelector('.ce-tool-dock');
    const visible = (e: Element) => {
      if (!e.getClientRects().length || getComputedStyle(e).visibility === 'hidden' || e.closest('[hidden],[inert]')) return false;
      const closed = e.closest('details:not([open])');
      if (closed && !closed.querySelector('summary')?.contains(e)) return false;
      const r = e.getBoundingClientRect();
      for (let parent = e.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        const style = getComputedStyle(parent), box = parent.getBoundingClientRect();
        if (/auto|scroll|hidden|clip/.test(style.overflowY) && (r.bottom <= box.top || r.top >= box.bottom)) return false;
      }
      return true;
    };
    const limit = dock && visible(dock) ? dock.getBoundingClientRect().top : innerHeight;
    const candidates = [...document.querySelectorAll<HTMLElement>('#root *')].filter(e => {
      if (!visible(e) || e.closest('.ce-tool-dock, svg, canvas, dialog, [class*="sr-only"]')) return false;
      const r = e.getBoundingClientRect(), css = getComputedStyle(e);
      if (r.width <= 1 || r.height <= 1 || css.clipPath !== 'none' || css.clip !== 'auto') return false;
      return e.matches('button, a, input, textarea, summary') || !e.children.length && !!e.textContent?.trim();
    });
    const last = candidates.sort((a,b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom)[0];
    return { gap: limit - (last?.getBoundingClientRect().bottom ?? 0), last: last?.textContent?.trim().slice(0,100), horizontal: document.documentElement.scrollWidth > innerWidth };
  });
}
export async function assertReachableEnd(page: Page) {
  await expect.poll(async () => { await scrollEnd(page); return (await contentClearance(page)).gap; }, { message: 'All final content and controls must scroll above the dock', timeout: 5000 }).toBeGreaterThanOrEqual(8);
  expect((await contentClearance(page)).horizontal).toBe(false);
}
