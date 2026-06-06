import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

// Apify actor that does the real work (runs server-side, billed pay-per-event).
const ACTOR_ID = 'apivault_labs~yelp-business-scraper';

export class Yelp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Yelp Business Scraper',
		name: 'yelp',
		icon: 'file:yelp.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["businessUrls"]}}',
		description:
			'Real-time deep intelligence on any Yelp business: ratings, hours, website tech stack, emails, phones, social profiles, SEO audit, lead score and outreach pitch.',
		defaults: {
			name: 'Yelp Business Scraper',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'apifyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Yelp Business URLs',
				name: 'businessUrls',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				required: true,
				placeholder: 'https://www.yelp.com/biz/tartine-bakery-san-francisco',
				description:
					'One or more Yelp business page URLs. Separate multiple URLs with a new line or comma.',
			},
			{
				displayName: 'Export Format',
				name: 'exportFormat',
				type: 'options',
				options: [
					{ name: 'Default JSON (all fields)', value: 'default' },
					{ name: 'CSV (flattened, sales-ready)', value: 'csv' },
				],
				default: 'default',
				description: 'Shape of each business record',
			},
			{
				displayName: 'Enrichment Layers',
				name: 'enrichment',
				type: 'collection',
				placeholder: 'Add Enrichment Layer',
				default: {},
				description: 'Toggle the enrichment layers. All on-by-default layers run unless disabled here.',
				options: [
					{
						displayName: 'Core Fields',
						name: 'extractCore',
						type: 'boolean',
						default: true,
						description:
							'Whether to extract name, rating, reviews, phone, address, website, hours, categories, price range, neighborhood, image, amenities',
					},
					{
						displayName: 'Hours Intelligence',
						name: 'extractHoursIntel',
						type: 'boolean',
						default: true,
						description:
							'Whether to extract structured weekly schedule, hours/week, days open, weekend coverage, real-time is-open-now',
					},
					{
						displayName: 'Website Tech Stack',
						name: 'extractWebsite',
						type: 'boolean',
						default: true,
						description:
							'Whether to detect 50+ platforms (Shopify/WP/Wix/OpenTable/Toast/Stripe/Square…), alive check, server, HSTS, SEO + mobile audit',
					},
					{
						displayName: 'Website Discovery Fallback (DuckDuckGo)',
						name: 'websiteDiscoveryFallback',
						type: 'boolean',
						default: true,
						description:
							'Whether to search DuckDuckGo for the official site when Yelp hides the website field. Adds ~2s per business; recovers ~70% of hidden URLs.',
					},
					{
						displayName: 'Contact Enrichment (Emails, Phones, Socials)',
						name: 'extractContactEnrichment',
						type: 'boolean',
						default: true,
						description:
							'Whether to extract emails (CloudFlare decoder), phones (E.164), social profiles (IG/FB/Twitter/TikTok/YT/LinkedIn/Pinterest) and menu/booking/delivery URLs from the website',
					},
					{
						displayName: 'Structured Amenities',
						name: 'extractAmenities',
						type: 'boolean',
						default: true,
						description:
							'Whether to parse free-text amenities into 28 boolean flags (outdoor seating, reservations, delivery, wifi, wheelchair, vegan, dog-friendly…)',
					},
					{
						displayName: 'Listing Age (Wayback)',
						name: 'extractAge',
						type: 'boolean',
						default: true,
						description: 'Whether to derive years on Yelp from the earliest Wayback snapshot',
					},
					{
						displayName: 'Parse Address (Street/City/State/Zip)',
						name: 'extractAddressParts',
						type: 'boolean',
						default: true,
						description:
							'Whether to split the address into structured fields and derive timezone for accurate is-open-now',
					},
					{
						displayName: 'Guess Common Email Patterns',
						name: 'guessEmailPatterns',
						type: 'boolean',
						default: true,
						description:
							'Whether to generate likely contact addresses (info@, hello@, contact@…) when no email is extractable. Returned as emails_guessed[]; verify before sending.',
					},
					{
						displayName: 'Derived Signals',
						name: 'extractDerivedSignals',
						type: 'boolean',
						default: true,
						description:
							'Whether to compute popularity_score, customer_segment, quality_tier, online_presence_score, chain_likelihood_score',
					},
					{
						displayName: 'Lead Score + Best Contact',
						name: 'extractLeadScore',
						type: 'boolean',
						default: true,
						description:
							'Whether to compute a B2B prospecting score (0-100) with reasons, lead tier and bestContact picker',
					},
					{
						displayName: 'Industry Outreach Pitch',
						name: 'extractOutreachPitch',
						type: 'boolean',
						default: true,
						description:
							'Whether to write a ready-to-paste cold-outreach message tailored to the business category (15 industry templates)',
					},
					{
						displayName: 'One-Click Outreach Links',
						name: 'extractOutreachLinks',
						type: 'boolean',
						default: true,
						description:
							'Whether to build mailto/tel/sms/WhatsApp/LinkedIn/Google/Yelp-competitors URLs ready for CRM use',
					},
					{
						displayName: 'Website Domain Age (crt.sh SSL History)',
						name: 'extractDomainAge',
						type: 'boolean',
						default: false,
						description:
							'Whether to derive website_domain_age_years from earliest SSL cert. Adds ~10-30s per business — off by default.',
					},
					{
						displayName: 'Geocoding (lat/lng via Nominatim)',
						name: 'extractGeocoding',
						type: 'boolean',
						default: false,
						description:
							'Whether to resolve the address to lat/lng. Off by default — Nominatim is rate-limited (~1 req/sec).',
					},
				],
			},
			{
				displayName: 'Reliability & Filters',
				name: 'reliability',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Slug-Derived Fallback on Failure',
						name: 'slugFallbackOnFail',
						type: 'boolean',
						default: true,
						description:
							'Whether to recover business name + city from the URL slug and run enrichment anyway when Yelp throttles. Recovers ~60% of failed runs into partial-but-useful records.',
					},
					{
						displayName: 'Retries on Transient Block',
						name: 'maxRetries',
						type: 'number',
						typeOptions: { minValue: 0, maxValue: 5 },
						default: 2,
						description: 'Retries with linear backoff (8s, 16s) when Yelp throttles',
					},
					{
						displayName: 'Exclude Chains / Franchises',
						name: 'excludeChains',
						type: 'boolean',
						default: false,
						description:
							'Whether to skip businesses with chain_likelihood_score ≥ 50 (Starbucks, McDonald\'s…). Useful when prospecting independent SMBs only.',
					},
					{
						displayName: 'Write Aggregate Summary to KV Store',
						name: 'writeSummary',
						type: 'boolean',
						default: true,
						description:
							'Whether to write a SUMMARY record (avg metrics, segment distribution, top tech) to the KV store on multi-business runs. Free — not added to dataset.',
					},
				],
			},
			{
				displayName: 'Advanced Options',
				name: 'advancedOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Max Concurrency',
						name: 'maxConcurrency',
						type: 'number',
						typeOptions: { minValue: 1, maxValue: 5 },
						default: 2,
						description: 'Parallel businesses to analyze',
					},
					{
						displayName: 'Timeout per Business (Seconds)',
						name: 'timeout',
						type: 'number',
						typeOptions: { minValue: 60, maxValue: 300 },
						default: 180,
						description: 'Max wait time per business',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const rawUrls = this.getNodeParameter('businessUrls', i) as string;
				const businessUrls = rawUrls
					.split(/[\n,]+/)
					.map((u) => u.trim())
					.filter((u) => u.length > 0);

				if (businessUrls.length === 0) {
					throw new NodeOperationError(
						this.getNode(),
						'At least one Yelp business URL is required',
						{ itemIndex: i },
					);
				}

				const exportFormat = this.getNodeParameter('exportFormat', i, 'default') as string;
				const enrichment = this.getNodeParameter('enrichment', i, {}) as Record<string, boolean>;
				const reliability = this.getNodeParameter('reliability', i, {}) as {
					slugFallbackOnFail?: boolean;
					maxRetries?: number;
					excludeChains?: boolean;
					writeSummary?: boolean;
				};
				const advanced = this.getNodeParameter('advancedOptions', i, {}) as {
					maxConcurrency?: number;
					timeout?: number;
				};

				const body: Record<string, unknown> = {
					businessUrls,
					exportFormat,
					// enrichment layers (defaults match the actor's input schema)
					extractCore: enrichment.extractCore ?? true,
					extractHoursIntel: enrichment.extractHoursIntel ?? true,
					extractWebsite: enrichment.extractWebsite ?? true,
					websiteDiscoveryFallback: enrichment.websiteDiscoveryFallback ?? true,
					extractContactEnrichment: enrichment.extractContactEnrichment ?? true,
					extractAmenities: enrichment.extractAmenities ?? true,
					extractAge: enrichment.extractAge ?? true,
					extractAddressParts: enrichment.extractAddressParts ?? true,
					guessEmailPatterns: enrichment.guessEmailPatterns ?? true,
					extractDerivedSignals: enrichment.extractDerivedSignals ?? true,
					extractLeadScore: enrichment.extractLeadScore ?? true,
					extractOutreachPitch: enrichment.extractOutreachPitch ?? true,
					extractOutreachLinks: enrichment.extractOutreachLinks ?? true,
					extractDomainAge: enrichment.extractDomainAge ?? false,
					extractGeocoding: enrichment.extractGeocoding ?? false,
					// reliability & filters
					slugFallbackOnFail: reliability.slugFallbackOnFail ?? true,
					maxRetries: reliability.maxRetries ?? 2,
					excludeChains: reliability.excludeChains ?? false,
					writeSummary: reliability.writeSummary ?? true,
					// advanced
					maxConcurrency: advanced.maxConcurrency ?? 2,
					timeout: advanced.timeout ?? 180,
				};

				const options: IRequestOptions = {
					method: 'POST' as IHttpRequestMethods,
					url: `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items`,
					body,
					json: true,
				};

				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'apifyApi',
					options,
				);

				const results = Array.isArray(response) ? response : [response];
				for (const result of results) {
					returnData.push({ json: result, pairedItem: { item: i } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
