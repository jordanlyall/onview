const HASURA_ENDPOINT = "https://data.artblocks.io/v1/graphql";

const PAGE_SIZE = 100;

const TOKENS_QUERY = `
  query WalletTokens($owner: String!, $limit: Int!, $offset: Int!) {
    tokens_metadata(
      where: { owner_address: { _eq: $owner } }
      order_by: { project_name: asc }
      limit: $limit
      offset: $offset
    ) {
      id
      token_id
      project_name
      media_url
      preview_asset_url
      invocation
      project {
        name
        artist_name
        curation_status_display
        vertical_name
        description
        max_invocations
        invocations
        aspect_ratio
        slug
        lowest_listing
      }
    }
  }
`;

export interface ArtBlocksProject {
  name: string;
  artist_name: string;
  curation_status_display: string;
  vertical_name: string;
  description: string;
  max_invocations: number;
  invocations: number;
  aspect_ratio: number;
  slug: string;
  lowest_listing: number | null;
}

export interface ArtBlocksToken {
  id: string;
  token_id: string;
  project_name: string;
  media_url: string;
  preview_asset_url: string;
  invocation: number;
  project: ArtBlocksProject;
}

const TOKEN_DETAIL_QUERY = `
  query TokenDetail($id: String!) {
    tokens_metadata(where: { id: { _eq: $id } }, limit: 1) {
      id
      token_id
      project_name
      media_url
      preview_asset_url
      live_view_url
      invocation
      hash
      features
      minted_at
      owner_address
      project {
        name
        artist_name
        curation_status_display
        vertical_name
        description
        max_invocations
        invocations
        aspect_ratio
        slug
        website
        license
        script_type_and_version
      }
    }
  }
`;

export interface ArtBlocksTokenDetail extends ArtBlocksToken {
  live_view_url: string | null;
  hash: string;
  features: Record<string, unknown> | null;
  minted_at: string | null;
  owner_address: string;
  project: ArtBlocksProject & {
    website: string | null;
    license: string | null;
    script_type_and_version: string | null;
  };
}

export async function fetchTokenDetail(
  tokenId: string
): Promise<ArtBlocksTokenDetail | null> {
  const response = await fetch(HASURA_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: TOKEN_DETAIL_QUERY,
      variables: { id: tokenId },
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(data.errors[0]?.message || "GraphQL error");
  }

  return data.data.tokens_metadata[0] || null;
}

async function fetchPage(
  ownerAddress: string,
  offset: number
): Promise<ArtBlocksToken[]> {
  const response = await fetch(HASURA_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: TOKENS_QUERY,
      variables: {
        owner: ownerAddress.toLowerCase(),
        limit: PAGE_SIZE,
        offset,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(data.errors[0]?.message || "GraphQL error");
  }

  return data.data.tokens_metadata;
}

export async function fetchWalletTokens(
  ownerAddress: string,
  onProgress?: (count: number) => void
): Promise<ArtBlocksToken[]> {
  const allTokens: ArtBlocksToken[] = [];
  let offset = 0;

  while (true) {
    const page = await fetchPage(ownerAddress, offset);
    allTokens.push(...page);
    onProgress?.(allTokens.length);

    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return allTokens;
}

export async function fetchMultiWalletTokens(
  addresses: string[],
  onProgress?: (count: number, wallet: number, totalWallets: number) => void
): Promise<ArtBlocksToken[]> {
  const allTokens: ArtBlocksToken[] = [];

  for (let i = 0; i < addresses.length; i++) {
    const walletTokens = await fetchWalletTokens(addresses[i], (count) => {
      onProgress?.(allTokens.length + count, i + 1, addresses.length);
    });
    allTokens.push(...walletTokens);
  }

  // Deduplicate by token id (in case a token moved between wallets)
  const seen = new Set<string>();
  return allTokens.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}
