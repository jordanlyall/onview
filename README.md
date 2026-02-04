# onview.art

Instant galleries for Art Blocks collectors. Paste any wallet or ENS to create a beautiful, shareable gallery of your collection. No signup required.

**Live at [onview.art](https://onview.art)**

## Features

- Enter any wallet address or ENS name to view their Art Blocks collection
- **Multi-wallet support**: combine multiple wallets with commas
- Grouped by collection tier (Curated, Presents, Heritage, Explorations, Studio, etc.)
- Sorted by floor price within each tier to showcase the most valuable pieces first
- Full-screen token detail view with live generative art rendering
- Slideshow mode for ambient display
- Swipe navigation on mobile
- Dark/light theme support
- Dynamic OG images for social sharing (shows top 4 pieces by floor price)
- Links to Art Blocks, OpenSea, and Etherscan

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Data**: Art Blocks Hasura GraphQL API
- **ENS**: viem for resolution
- **Deployment**: Vercel

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## License

MIT
