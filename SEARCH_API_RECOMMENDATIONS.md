# Search API Integration Recommendations

## Executive Summary

This document outlines search API solutions to improve processes in the Cubey Farcaster MiniApp waitlist application. Based on the current codebase analysis, key areas for improvement include:

1. **Waitlist Management** - Search and filter collected emails/FIDs
2. **Duplicate Prevention** - Check if users already exist
3. **Farcaster User Discovery** - Enrich user profiles and enable social features
4. **On-Chain Data Integration** - Query wallet history and blockchain data
5. **Analytics & Reporting** - Track growth and user engagement

---

## 1. Application Search APIs (Waitlist Management)

### Recommended: **MeiliSearch**

**Why MeiliSearch?**
- ✅ **Instant search** - Optimized for end-user facing search experiences
- ✅ **Easy to integrate** - Simple API, excellent documentation
- ✅ **Open source** - Self-hostable with no vendor lock-in
- ✅ **Typo-tolerant** - Handles email typos and fuzzy matching
- ✅ **Filtering & faceting** - Perfect for date ranges, sorting, pagination
- ✅ **Lightweight** - Ideal for smaller datasets (waitlist scale)
- ✅ **Free tier** - Cost-effective for startups

**Use Cases:**
- Search waitlist entries by email, FID, or username
- Filter by join date ranges
- Sort by most recent signups
- Paginate through results
- Duplicate detection before signup

**Integration Example:**
```typescript
// Install: npm install meilisearch
import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST,
  apiKey: process.env.MEILISEARCH_API_KEY,
});

// Index waitlist entries
const index = client.index('waitlist');
await index.addDocuments([
  {
    id: '1',
    email: 'user@example.com',
    fid: '12345',
    displayName: 'Alice',
    joinedAt: '2026-01-02T10:00:00Z',
  },
]);

// Search
const results = await index.search('alice', {
  filter: 'joinedAt > 1704153600',
  limit: 20,
  offset: 0,
});

// Check for duplicates
const duplicate = await index.search(email, {
  filter: `email = "${email}"`,
  limit: 1,
});
```

**Deployment Options:**
- Meilisearch Cloud (managed, $0.60/hour for basic instance)
- Self-hosted on Vercel/Railway/Fly.io
- Docker container on any cloud provider

**Resources:**
- [Meilisearch GitHub](https://github.com/meilisearch/meilisearch)
- [Meilisearch vs Algolia Comparison](https://www.meilisearch.com/blog/meilisearch-vs-algolia)
- [Comparison to Elasticsearch](https://www.meilisearch.com/blog/algolia-vs-elasticsearch)

### Alternative: **Algolia** (Premium Option)

**Pros:**
- Industry-leading performance
- Advanced AI-powered NeuralSearch (keyword + vector search)
- Sophisticated ranking algorithms
- Handles millions of queries per second

**Cons:**
- Expensive for growing startups (~$1/1000 search requests)
- Complex pricing model
- Overkill for simple waitlist search

**Best for:** High-traffic applications with complex search requirements

---

## 2. Farcaster-Specific Search APIs

### Recommended: **Neynar API**

**Why Neynar?**
- ✅ **Comprehensive Farcaster data** - User profiles, casts, followers, engagement
- ✅ **FID lookup** - Get user info by FID or Ethereum/Solana address
- ✅ **Bulk operations** - Fetch multiple users at once
- ✅ **Real-time webhooks** - Get notified when users cast about your app
- ✅ **Well-documented SDK** - Easy integration with TypeScript

**Use Cases:**
- Enrich waitlist entries with full Farcaster profiles
- Display follower counts and social proof
- Search for VIP users (high engagement)
- Track when users share the waitlist
- Verify user authenticity

**Integration Example:**
```typescript
// Install: npm install @neynar/nodejs-sdk
import { NeynarAPIClient } from '@neynar/nodejs-sdk';

const neynar = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

// Get user profile by FID
const user = await neynar.fetchBulkUsers({ fids: [12345] });

// Search users by username
const searchResults = await neynar.searchUser({
  q: 'alice',
  limit: 10,
});

// Get user's casts (for engagement metrics)
const casts = await neynar.fetchAllCastsCreatedByUser({
  fid: 12345,
  limit: 25,
});
```

**Pricing:**
- Free tier: 1,000 requests/day
- Starter: $50/month (100k requests)
- Growth: $500/month (1M requests)

**Resources:**
- [Neynar Documentation](https://docs.neynar.com/docs/fetching-farcaster-user-based-on-ethereum-address)
- [Neynar SDK Tutorial](https://medium.com/coinmonks/how-to-use-the-neynar-sdk-to-build-on-farcaster-webhooks-casts-user-info-a71ec4cbd00d)

### Alternative: **Airstack API**

**Pros:**
- Multi-protocol support (Farcaster + Lens + other socials)
- GraphQL API (flexible queries)
- Social capital scoring
- Cross-chain wallet connections

**Best for:** Multi-protocol social apps combining Farcaster + other platforms

**Resources:**
- [Airstack Farcaster Search Docs](https://docs.airstack.xyz/airstack-docs-and-faqs/farcaster/farcaster/search-farcaster-users)

### Community Option: **Searchcaster**

**Pros:**
- Free and open source
- Simple API for searching casts
- Good for basic username/content search

**Cons:**
- Limited features compared to Neynar
- Community-maintained (may have uptime issues)

**Resources:**
- [Searchcaster Website](https://searchcaster.xyz/)
- [Searchcaster GitHub](https://github.com/gskril/searchcaster)

---

## 3. Blockchain/Web3 Search APIs (On-Chain Data)

### Recommended: **Moralis Wallet API**

**Why Moralis?**
- ✅ **Cross-chain support** - Ethereum, Base, Polygon, Arbitrum, Optimism, etc.
- ✅ **Comprehensive wallet data** - Balances, NFTs, tokens, transaction history
- ✅ **EVM compatibility** - Works with all chains your app supports
- ✅ **Simple REST API** - Easy to integrate with Next.js
- ✅ **Real-time webhooks** - Monitor wallet activity

**Use Cases:**
- Display user's NFT collections in profile
- Show token holdings and wallet value
- Verify on-chain activity/reputation
- Segment waitlist by wallet balance (VIP users)
- Track transaction history for fraud detection

**Integration Example:**
```typescript
// Install: npm install moralis
import Moralis from 'moralis';

await Moralis.start({
  apiKey: process.env.MORALIS_API_KEY,
});

// Get wallet balance on Base chain
const balance = await Moralis.EvmApi.balance.getNativeBalance({
  chain: '0x2105', // Base chain ID
  address: userWalletAddress,
});

// Get NFTs owned by user
const nfts = await Moralis.EvmApi.nft.getWalletNFTs({
  chain: '0x2105',
  address: userWalletAddress,
});

// Get ERC20 token balances
const tokens = await Moralis.EvmApi.token.getWalletTokenBalances({
  chain: '0x2105',
  address: userWalletAddress,
});

// Transaction history
const transactions = await Moralis.EvmApi.transaction.getWalletTransactions({
  chain: '0x2105',
  address: userWalletAddress,
  limit: 100,
});
```

**Pricing:**
- Free tier: 40,000 requests/month
- Starter: $49/month (3M compute units)
- Pro: $249/month (15M compute units)

**Resources:**
- [Moralis Wallet API](https://moralis.com/api/wallet/)
- [How to Query Blockchain Data](https://moralis.com/how-to-query-blockchain-data-for-transactions-balances-and-more/)

### Alternative: **thirdweb Insight**

**Pros:**
- Simple REST API (no GraphQL complexity)
- Easy indexing and transformation
- Good TypeScript support
- Integrated with thirdweb SDK (already common in Web3)

**Resources:**
- [thirdweb Insight Guide](https://blog.thirdweb.com/guides/getting-started-with-insight-query-blockchain-data-with-simple-api-calls/)

### Enterprise Option: **Bitquery**

**Pros:**
- Supports 40+ blockchains
- Real-time WebSocket streaming
- SQL-like query interface
- Powerful for analytics

**Cons:**
- More complex setup
- Higher learning curve
- Overkill for basic wallet lookups

**Best for:** Advanced blockchain analytics dashboards

**Resources:**
- [Bitquery Products](https://bitquery.io/)

---

## 4. Recommended Implementation Strategy

### Phase 1: Core Waitlist Search (Week 1-2)
1. **Set up database** - Use Supabase (has built-in Postgres full-text search) or Firebase
2. **Implement MeiliSearch** - For instant search, filtering, and duplicate detection
3. **Build API endpoints:**
   - `POST /api/waitlist` - Save email + FID
   - `GET /api/waitlist/search?q={query}&limit=20&offset=0` - Search entries
   - `GET /api/waitlist/exists?email={email}` - Duplicate check
   - `GET /api/waitlist/stats` - Analytics (count, growth)

### Phase 2: Farcaster Integration (Week 3)
1. **Integrate Neynar API** - Enrich user profiles
2. **Build endpoints:**
   - `GET /api/farcaster/user/{fid}` - Get full profile
   - `GET /api/farcaster/search?q={username}` - Find users
3. **Add webhooks** - Track when users cast about the app

### Phase 3: Web3 Enhancement (Week 4+)
1. **Integrate Moralis Wallet API** - Optional on-chain data
2. **Build VIP detection:**
   - Check wallet balance
   - Count NFTs owned
   - Assign priority tier
3. **Add wallet search** - Find users by connected address

---

## 5. Cost Estimate (Monthly)

### Recommended Stack:
- **MeiliSearch Cloud** - $43/month (basic instance)
- **Neynar API** - $50/month (100k requests, starter plan)
- **Moralis API** - $0 (free tier, 40k requests/month)
- **Database (Supabase)** - $0 (free tier, up to 500MB)

**Total: ~$93/month** for production-ready search infrastructure

### Budget Alternative (Free Tier):
- **Supabase** - Free tier (Postgres full-text search)
- **Searchcaster** - Free (community API)
- **Moralis** - Free tier
- **Self-hosted MeiliSearch** - Free (deploy to Railway/Fly.io)

**Total: $0-20/month** (just hosting costs)

---

## 6. Quick Start: Supabase + Built-in Search

For immediate implementation without additional dependencies:

**Supabase offers:**
- Postgres database with full-text search
- Real-time subscriptions
- Auto-generated REST API
- Free tier (500MB, 50k monthly active users)

**Example:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Save to waitlist
const { data, error } = await supabase
  .from('waitlist')
  .insert({
    email: 'user@example.com',
    fid: '12345',
    display_name: 'Alice',
    joined_at: new Date().toISOString(),
  });

// Search with full-text search
const { data: results } = await supabase
  .from('waitlist')
  .select('*')
  .textSearch('email', searchQuery)
  .order('joined_at', { ascending: false })
  .range(0, 19);

// Check for duplicate
const { data: existing } = await supabase
  .from('waitlist')
  .select('*')
  .eq('email', email)
  .single();
```

---

## 7. Technical Comparison Matrix

| Feature | MeiliSearch | Algolia | Supabase FTS | Elasticsearch |
|---------|-------------|---------|--------------|---------------|
| **Speed** | ⚡️ Instant | ⚡️ Fastest | 🐢 Moderate | 🐢 Slow |
| **Ease of Setup** | ✅ Easy | ✅ Easy | ✅ Very Easy | ❌ Complex |
| **Typo Tolerance** | ✅ Yes | ✅ Advanced | ❌ No | ⚠️ Manual |
| **Filtering** | ✅ Excellent | ✅ Excellent | ✅ Good | ✅ Excellent |
| **Free Tier** | ✅ Generous | ⚠️ Limited | ✅ Generous | ❌ No |
| **Pricing** | 💚 Low | 💸 High | 💚 Very Low | 💰 Medium |
| **Scalability** | ⚠️ Medium | ✅ Massive | ⚠️ Medium | ✅ Massive |
| **Best For** | Small-medium apps | Enterprise | Startups/MVPs | Big data/logs |

---

## 8. Implementation Checklist

- [ ] Choose database solution (Supabase recommended for quick start)
- [ ] Decide on search API (MeiliSearch for best UX, Supabase FTS for simplicity)
- [ ] Set up Neynar API account for Farcaster integration
- [ ] Create API endpoints for waitlist operations
- [ ] Implement duplicate email detection
- [ ] Add search filtering (date ranges, sorting)
- [ ] Integrate Farcaster profile enrichment
- [ ] Set up webhooks for social sharing tracking
- [ ] (Optional) Add Moralis for Web3 wallet data
- [ ] Build admin dashboard for waitlist management
- [ ] Add analytics endpoints (growth stats, user segments)

---

## 9. Next Steps

1. **Start with Supabase** - Get data persistence working first
2. **Add MeiliSearch** - Upgrade search experience once you have data
3. **Integrate Neynar** - Enrich Farcaster profiles incrementally
4. **Monitor usage** - Start with free tiers, upgrade based on actual traffic

---

## Resources & Documentation

### Application Search
- [MeiliSearch Documentation](https://www.meilisearch.com/docs)
- [Algolia vs Elasticsearch Comparison](https://www.meilisearch.com/blog/algolia-vs-elasticsearch)
- [Top 10 Algolia Alternatives 2025](https://www.meilisearch.com/blog/algolia-alternatives)

### Farcaster APIs
- [Neynar API Docs](https://docs.neynar.com/docs/fetching-farcaster-user-based-on-ethereum-address)
- [Airstack Farcaster Search](https://docs.airstack.xyz/airstack-docs-and-faqs/farcaster/farcaster/search-farcaster-users)
- [Searchcaster](https://searchcaster.xyz/)
- [Farcaster Official API Reference](https://docs.farcaster.xyz/reference/farcaster/api)

### Blockchain/Web3 APIs
- [Moralis Wallet API](https://moralis.com/api/wallet/)
- [thirdweb Insight](https://blog.thirdweb.com/guides/getting-started-with-insight-query-blockchain-data-with-simple-api-calls/)
- [Bitquery Blockchain APIs](https://bitquery.io/)
- [Blockchain.com API](https://www.blockchain.com/api)

### Search API Guides
- [Top Web Search APIs 2025](https://www.firecrawl.dev/blog/top_web_search_api_2025)
- [Best Search API Tools](https://data4ai.com/blog/tool-comparisons/best-search-api-tools/)
- [Search API Comparison](https://typesense.org/typesense-vs-algolia-vs-elasticsearch-vs-meilisearch/)

---

**Last Updated:** January 2, 2026
**Document Version:** 1.0
