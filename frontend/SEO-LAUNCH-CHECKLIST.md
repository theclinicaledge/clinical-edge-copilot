# SEO Launch Checklist — Clinical Edge Blog

Manual steps for the site owner after deploying the prerendering work. Nothing
here can be automated safely from this environment (deployment, Search
Console auth, and third-party validators all require your own credentials).

## 1. Deploy

1. Review and merge the branch (see the git commands provided at the end of
   the implementation report).
2. Deploy to Vercel as usual. The build command already runs the full chain:
   `generate-sitemap → vite build → prerender`. No Vercel project settings
   need to change.

## 2. Confirm live canonical URLs

Visit each of these directly (not via internal links) and confirm the page
loads with real content, not a blank shell, and that "View Page Source"
(not DevTools — the *raw* response) shows the correct `<title>` and
`<link rel="canonical">`:

- `https://theclinicaledge.org/`
- `https://theclinicaledge.org/blog`
- `https://theclinicaledge.org/blog/abg-interpretation-for-nurses`
- `https://theclinicaledge.org/download`
- `https://theclinicaledge.org/privacy`
- `https://theclinicaledge.org/support`

## 3. Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console).
2. Add `theclinicaledge.org` as a **Domain property** (verifies the whole
   domain via DNS TXT record — covers `www` and non-`www`, http and https).
3. Complete DNS verification through your domain registrar.

## 4. Submit the sitemap

1. In Search Console, go to **Sitemaps**.
2. Submit `https://theclinicaledge.org/sitemap.xml`.
3. Confirm it's read successfully (Search Console will show a URL count —
   expect 11 as of this launch).

## 5. URL Inspection

1. Use **URL Inspection** for:
   - `https://theclinicaledge.org/blog`
   - `https://theclinicaledge.org/blog/abg-interpretation-for-nurses`
2. Click "Test Live URL" for each and confirm Google's renderer sees the
   article content and title.
3. Click "Request Indexing" for these two URLs **once each**.

## 6. Google Rich Results Test

1. Go to [search.google.com/test/rich-results](https://search.google.com/test/rich-results).
2. Test `https://theclinicaledge.org/blog/abg-interpretation-for-nurses`.
3. Confirm it detects a valid `BlogPosting` and `BreadcrumbList`.

## 7. Check indexing status after processing

Indexing is not instant. Come back after a few days and check **Coverage /
Pages** in Search Console to see whether the two blog URLs moved from
"Discovered" or "Crawled" to "Indexed."

## 8. Monitor performance

Once indexed, check **Search results** performance in Search Console
periodically for:

- Impressions
- Clicks
- CTR
- Average position
- Any indexing errors under **Pages**

## 9. Do not repeatedly request indexing

Requesting indexing more than once per URL in a short window doesn't speed
anything up and can look like spam to Google. Request once per URL, then
wait.

## 10. Review results after weeks, not days

New content on a low-authority domain typically takes several weeks to a
few months to accumulate meaningful impressions. Judge this launch on a
4–8 week horizon, not the first few days.

## 11. Social-preview validation

Test the article URL in each platform's own debugger/unfurl preview so you
catch any caching issues before sharing it live:

- Facebook/Instagram: [developers.facebook.com/tools/debug](https://developers.facebook.com/tools/debug/)
- LinkedIn: [linkedin.com/post-inspector](https://www.linkedin.com/post-inspector/)
- Twitter/X: paste the link into a draft post and check the card preview
- iMessage/Slack: send the link to yourself and check the unfurl

The social-sharing image is a real 1200×630 PNG
(`/og/abg-interpretation-for-nurses.png`), rasterized from the editable SVG
source (`/og/abg-interpretation-for-nurses.svg`) via Playwright — already a
project devDependency, no new package added. `og:image`, `twitter:image`, and
the JSON-LD `image` field all reference the PNG. If the branded design ever
needs to change, edit the `.svg` source and re-export the `.png` the same
way (see `git log` for the original conversion approach, or open the SVG in
any vector tool and export at 1200×630).

## Optional next step: analytics segmentation

Vercel Analytics is already installed and automatically tracks pageviews by
pathname (no code change needed — it's the built-in behavior of the
`<Analytics />` component in `main.jsx`). Once traffic arrives, filter the
Vercel Analytics dashboard by path (`/blog`, `/blog/abg-interpretation-for-nurses`)
to see blog-specific pageviews alongside the custom `blog_article_viewed`
event already fired from `BlogPostPage.jsx`. No new analytics vendor is
needed for this.
