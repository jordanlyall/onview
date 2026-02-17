import { ImageResponse } from "next/og";
import { createPublicClient, http } from "viem";
import { normalize } from "viem/ens";
import { mainnet } from "viem/chains";

export const runtime = "edge";

export const alt = "Art Blocks Collection";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const HASURA_ENDPOINT = "https://data.artblocks.io/v1/graphql";

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

async function resolveENS(ensName: string): Promise<string | null> {
  try {
    const address = await client.getEnsAddress({
      name: normalize(ensName),
    });
    return address?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

async function fetchPreviewTokens(address: string): Promise<string[]> {
  // Fetch more tokens so we can sort by floor price and pick the top 4
  const query = `
    query WalletPreview($owner: String!) {
      tokens_metadata(
        where: { owner_address: { _eq: $owner } }
        limit: 100
      ) {
        preview_asset_url
        project {
          lowest_listing
        }
      }
    }
  `;

  try {
    const response = await fetch(HASURA_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { owner: address.toLowerCase() },
      }),
      cache: "no-store",
    });

    if (!response.ok) return [];

    const data = await response.json();
    const tokens = data.data?.tokens_metadata || [];

    // Sort by floor price (highest first), then take top 4
    // Filter out video files (.mp4, .webm) as ImageResponse can't render them
    const sorted = tokens
      .filter((t: { preview_asset_url: string }) => {
        const url = t.preview_asset_url;
        if (!url) return false;
        const lower = url.toLowerCase();
        return !lower.endsWith('.mp4') && !lower.endsWith('.webm');
      })
      .sort((a: { project: { lowest_listing: number | null } }, b: { project: { lowest_listing: number | null } }) => {
        const floorA = a.project?.lowest_listing ?? 0;
        const floorB = b.project?.lowest_listing ?? 0;
        return floorB - floorA;
      });

    return sorted.slice(0, 4).map((t: { preview_asset_url: string }) => t.preview_asset_url);
  } catch {
    return [];
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  const decodedAddress = decodeURIComponent(address);

  // Resolve ENS if needed
  let resolvedAddress = decodedAddress;
  if (decodedAddress.endsWith(".eth")) {
    const resolved = await resolveENS(decodedAddress);
    if (resolved) resolvedAddress = resolved;
  }

  const images = await fetchPreviewTokens(resolvedAddress);
  const displayName = decodedAddress.endsWith(".eth")
    ? decodedAddress
    : `${decodedAddress.slice(0, 6)}...${decodedAddress.slice(-4)}`;

  // Simple 2x2 grid or fallback
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {images.length > 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 60,
            }}
          >
            {/* 2x2 image grid */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                width: 500,
                height: 500,
                gap: 16,
              }}
            >
              {images.slice(0, 4).map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  width={242}
                  height={242}
                  style={{
                    borderRadius: 16,
                    objectFit: "cover",
                  }}
                />
              ))}
            </div>

            {/* Branding - show full URL */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <span style={{ fontSize: 36, color: "#ffffff" }}>onview</span>
                <span style={{ fontSize: 36, color: "#6366f1" }}>.art</span>
                <span style={{ fontSize: 36, color: "rgba(255,255,255,0.5)" }}>/</span>
              </div>
              <p
                style={{
                  fontSize: 32,
                  color: "rgba(255,255,255,0.8)",
                  marginTop: 8,
                  maxWidth: 400,
                }}
              >
                {displayName}
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span style={{ fontSize: 48, color: "#ffffff" }}>onview</span>
              <span style={{ fontSize: 48, color: "#6366f1" }}>.art</span>
              <span style={{ fontSize: 48, color: "rgba(255,255,255,0.5)" }}>/</span>
            </div>
            <p style={{ fontSize: 36, color: "rgba(255,255,255,0.8)", marginTop: 8 }}>
              {displayName}
            </p>
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
