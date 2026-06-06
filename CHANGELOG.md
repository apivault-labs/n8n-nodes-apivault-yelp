# Changelog

## 0.1.0

- Initial release.
- `Yelp Business Scraper` node: real-time deep intelligence on any Yelp
  business URL (no cache), 12 public sources combined.
- 40+ fields per business: core data, hours intelligence (timezone-aware
  is-open-now), website tech stack (50+ platforms), contact enrichment
  (emails with CloudFlare decoder + pattern guessing, phones E.164, socials),
  SEO + mobile audit, 28 amenity flags, parsed address + timezone, listing age
  (Wayback), optional domain age (crt.sh) and geocoding.
- leadScore (0-100) + tier + bestContact, industry outreach pitch (15
  templates), one-click outreach links (mailto/tel/sms/WhatsApp/LinkedIn).
- Slug-fallback recovery when Yelp throttles + configurable retries.
- Export formats: default JSON / CSV (flattened, sales-ready).
- `Apify API` credentials with token test against `/users/me`.
- Calls the `apivault_labs/yelp-business-scraper` actor via
  `run-sync-get-dataset-items`.
