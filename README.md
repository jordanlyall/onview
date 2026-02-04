# onview.art

A beautiful, museum-style viewer for Art Blocks NFT collections.

**Live at [onview.art](https://onview.art)**

## Features

- Enter any wallet address or ENS name to view their Art Blocks collection
- Grouped by collection tier (Curated, Presents, Explorations, Studio, etc.)
- Full-screen token detail view with live generative art rendering
- Slideshow mode for ambient display
- Swipe navigation on mobile
- Dark/light theme support
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
