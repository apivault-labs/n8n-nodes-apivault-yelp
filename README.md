# n8n-nodes-apivault-yelp

An [n8n](https://n8n.io) community node for the **Yelp Business Scraper** — real-time deep intelligence on any Yelp business, no cache.

No login. Pay-as-you-go, no monthly subscription. The scraping and 12-source enrichment run server-side on [Apify](https://apify.com); this node is a thin connector you drive with your own Apify API token.

Built by **[apivault_labs](https://apify.com/apivault_labs)** — see [all our actors](https://apify.com/apivault_labs).

## What you get per business (40+ fields)

- **Core**: name, rating, reviews count, phone, address, website, hours, categories, price range, neighborhood, image, amenities
- **Hours intelligence**: structured weekly schedule, hours/week, weekend coverage, timezone-aware **is-open-now**
- **Website tech stack**: 50+ platforms (Shopify, WordPress, Wix, OpenTable, Resy, Toast, Tock, DoorDash, Stripe, Square, Klaviyo, HubSpot…), alive check, server, HSTS
- **Contact enrichment**: emails (CloudFlare decoder + pattern guessing), phones (E.164), social profiles (IG/FB/Twitter/TikTok/YT/LinkedIn/Pinterest), menu/booking/delivery URLs
- **SEO + mobile audit**, structured **amenities** (28 flags), parsed **address** + timezone
- **Listing age** (Wayback), optional **domain age** (crt.sh) and **geocoding**
- **leadScore 0-100** + tier + reasons + **bestContact** picker
- **Industry outreach pitch** (15 templates) + **one-click outreach links** (mailto/tel/sms/WhatsApp/LinkedIn)
- **Slug-fallback** keeps the actor useful even when Yelp throttles

## Installation

In your n8n instance:

1. Go to **Settings → Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-apivault-yelp`
4. Confirm and install

## Credentials

This node uses an **Apify API token**:

1. Create a free account at [apify.com](https://apify.com)
2. Go to **Apify Console → Settings → Integrations** and copy your **API token**
3. In n8n, create new **Apify API** credentials and paste the token

A free Apify account includes monthly usage credits.

## Usage

- **Yelp Business URLs** — one or more `https://www.yelp.com/biz/...` pages (one per line, or comma-separated)
- **Export Format** — default JSON / CSV (flattened, sales-ready)
- **Enrichment Layers** — toggle any of the 15 layers (tech stack, contacts, lead score, outreach pitch, domain age, geocoding…)
- **Reliability & Filters** — slug fallback, retries, exclude chains, KV summary
- **Advanced** — concurrency, timeout

## Pricing

Billed per business through Apify (pay-per-event): **$3 / 1,000 businesses** ($0.003 each). All enrichment included.

## Use cases

- **B2B prospecting** — score local businesses and grab contact-ready leads
- **Local SEO / web-agency outreach** — find tech-stack gaps and dead sites
- **CRM enrichment** — export CSV straight into HubSpot/Salesforce/Pipedrive
- **Market research** — ratings, segments and online-presence signals by area

## Resources

- [Yelp Business Scraper actor on Apify](https://apify.com/apivault_labs/yelp-business-scraper)
- [All actors by apivault_labs](https://apify.com/apivault_labs)
- Prefer Python? Use the [Python SDK](https://github.com/apivault-labs/yelp-business-analyzer-python)
- [n8n community nodes docs](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)

## Keywords

`yelp-scraper` `yelp-business` `lead-generation` `b2b-prospecting` `local-seo` `business-intelligence` `outreach-automation` `crm-enrichment` `apollo-alternative` `n8n` `apify`
