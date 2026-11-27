# SEO handover

The application generates `/sitemap.xml` dynamically from published services, categories, offers, and future trips. It includes Arabic and English URLs and reciprocal `hreflang` annotations. `robots.txt` points crawlers to that sitemap and excludes the administration and API areas.

The public root URL uses the visitor's saved language preference; otherwise it opens in Arabic (the browser's language is not used, see `src/proxy.ts`). Each language remains available at its stable `/ar` or `/en` URL.

## Before production

1. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS canonical domain, with no trailing slash. This value controls canonical URLs, Open Graph URLs, structured data, `robots.txt`, and the sitemap.
2. In the dashboard, complete the public company contact details: WhatsApp number, email, city, street address where applicable, and verified social-profile URLs. They are used in the `TravelAgency` structured data.
3. Add a unique Arabic and English SEO title and description for every published service. Use accurate descriptions written for people; do not repeat keywords or make claims that cannot be verified.
4. Add descriptive alt text to every content image. Decorative images should retain an empty alt text.

## Launch checklist

1. Verify `https://your-domain/robots.txt` and `https://your-domain/sitemap.xml` return HTTP 200 and use the production domain.
2. Add both language variants in Google Search Console and submit `/sitemap.xml`. Also submit it in Bing Webmaster Tools.
3. Use Google's Rich Results Test on the home page and a representative service, trip, and FAQ page after deployment.
4. Confirm that `/ar` and `/en` pages have self-referencing canonical URLs and reciprocal `hreflang` tags.
5. Create or claim the business's Google Business Profile using exactly the same business name, telephone number, address, and public hours as the website.

## Ongoing editorial rules

- Publish only completed, useful pages; drafts and unavailable internal flows must not be linked as indexable landing pages.
- Keep visa requirements, prices, availability, and travel schedules current. Add the source or a review date in the visible copy when it helps customers assess time-sensitive information.
- Use a single primary topic and an informative H1 per page. Link relevant services, offers, and trips to each other using descriptive anchor text.
- Monitor Search Console for coverage, mobile usability, Core Web Vitals, and structured-data reports after each substantial release.
