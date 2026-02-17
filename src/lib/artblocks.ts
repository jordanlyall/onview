const HASURA_ENDPOINT = "https://data.artblocks.io/v1/graphql";

const PAGE_SIZE = 100;

// Query to get user profile and all linked wallets for an address
const USER_PROFILE_QUERY = `
  query UserProfile($address: String!) {
    users(where: { public_address: { _eq: $address } }) {
      public_address
      display_name
      profile_id
      profile_by_id {
        id
        username
        name
        bio
        twitter_username
        instagram_username
        external_website
      }
    }
  }
`;

// Query to get all linked wallets for a profile
const LINKED_WALLETS_QUERY = `
  query LinkedWallets($profileId: Int!) {
    users(where: { profile_id: { _eq: $profileId } }) {
      public_address
      display_name
    }
  }
`;

export interface ArtBlocksUserProfile {
  id: number;
  username: string | null;
  name: string | null;
  bio: string | null;
  twitter_username: string | null;
  instagram_username: string | null;
  external_website: string | null;
}

export interface ArtBlocksUser {
  public_address: string;
  display_name: string | null;
  profile_id: number | null;
  profile_by_id: ArtBlocksUserProfile | null;
}

export interface LinkedWalletsResult {
  profile: ArtBlocksUserProfile | null;
  linkedWallets: string[];
  displayName: string | null;
}

export async function fetchUserProfile(address: string): Promise<LinkedWalletsResult> {
  const response = await fetch(HASURA_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: USER_PROFILE_QUERY,
      variables: { address: address.toLowerCase() },
    }),
  });

  if (!response.ok) {
    return { profile: null, linkedWallets: [address], displayName: null };
  }

  const data = await response.json();
  const user = data.data?.users?.[0] as ArtBlocksUser | undefined;

  if (!user || !user.profile_id) {
    return { profile: null, linkedWallets: [address], displayName: user?.display_name || null };
  }

  // Fetch all linked wallets for this profile
  const linkedResponse = await fetch(HASURA_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: LINKED_WALLETS_QUERY,
      variables: { profileId: user.profile_id },
    }),
  });

  if (!linkedResponse.ok) {
    return {
      profile: user.profile_by_id,
      linkedWallets: [address],
      displayName: user.profile_by_id?.name || user.display_name || null
    };
  }

  const linkedData = await linkedResponse.json();
  const linkedUsers = linkedData.data?.users as { public_address: string }[] || [];
  const linkedWallets = linkedUsers.map(u => u.public_address);

  return {
    profile: user.profile_by_id,
    linkedWallets: linkedWallets.length > 0 ? linkedWallets : [address],
    displayName: user.profile_by_id?.name || user.display_name || null
  };
}

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
      contract_address
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
  contract_address: string;
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
  offset: number,
  retries = 3
): Promise<ArtBlocksToken[]> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
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
        if (response.status === 429 && attempt < retries - 1) {
          // Rate limited - wait and retry
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || "GraphQL error");
      }

      return data.data.tokens_metadata;
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  return [];
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
  // Fetch wallets in parallel (max 3 concurrent to avoid rate limits)
  const CONCURRENT_LIMIT = 3;
  const allTokens: ArtBlocksToken[] = [];
  let completedWallets = 0;

  for (let i = 0; i < addresses.length; i += CONCURRENT_LIMIT) {
    const batch = addresses.slice(i, i + CONCURRENT_LIMIT);
    const batchResults = await Promise.all(
      batch.map(async (addr, batchIndex) => {
        const tokens = await fetchWalletTokens(addr, (count) => {
          onProgress?.(allTokens.length + count, completedWallets + batchIndex + 1, addresses.length);
        });
        return tokens;
      })
    );

    for (const tokens of batchResults) {
      allTokens.push(...tokens);
      completedWallets++;
    }
    onProgress?.(allTokens.length, completedWallets, addresses.length);
  }

  // Deduplicate by token id (in case a token moved between wallets)
  const seen = new Set<string>();
  return allTokens.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}
