# Auto Gallery

Art Blocks NFT collection viewer. Enter a wallet address or ENS name, see a curated gallery of their Art Blocks pieces.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Art Blocks Hasura API for token/project data
- viem for ENS resolution
- Deployed to Vercel

## Data Source
- Hasura endpoint: `https://data.artblocks.io/v1/graphql`
- Query `tokens_metadata` by `owner_address`, join `project` for metadata
- Images from `media_url` (media-proxy.artblocks.io)

## Key Decisions
- Client-side fetching with progressive loading states
- Dark mode default with light mode toggle (localStorage persisted)
- Tokens grouped by curation tier: Curated > Presents > AB500 > Explorations/Flex
- Shareable URLs: `/gallery/[address]`
