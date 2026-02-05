import { isAddress } from "viem";

export function isENS(input: string): boolean {
  return input.endsWith(".eth");
}

export interface ResolvedWallet {
  address: string;
  ens: string | null;
}

// Try multiple ENS resolution APIs with fallback
async function resolveENSViaAPI(name: string): Promise<string | null> {
  // Try ENSIdeas first
  try {
    const response = await fetch(`https://api.ensideas.com/ens/resolve/${encodeURIComponent(name)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.address) return data.address;
    }
  } catch {
    // Fall through to next provider
  }

  // Fallback: use Cloudflare's ENS gateway
  try {
    const response = await fetch(`https://ens.cloudflare-eth.com/v1/resolve/${encodeURIComponent(name)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.address) return data.address;
    }
  } catch {
    // Fall through to next provider
  }

  // Fallback: use ENS public resolver via eth.limo
  try {
    const response = await fetch(`https://${name.replace('.eth', '')}.eth.limo/.well-known/wallets/ETH`, {
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const text = await response.text();
      const address = text.trim();
      if (isAddress(address)) return address;
    }
  } catch {
    // All providers failed
  }

  return null;
}

// Reverse lookup - skip if it fails, not critical
async function reverseResolveENS(address: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.ensideas.com/ens/resolve/${address}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.name || null;
  } catch {
    return null;
  }
}

async function resolveSingle(input: string): Promise<ResolvedWallet> {
  const trimmed = input.trim().toLowerCase();

  if (isENS(trimmed)) {
    const address = await resolveENSViaAPI(trimmed);
    if (!address) {
      throw new Error(`Could not resolve ENS name: ${trimmed}`);
    }
    return { address: address.toLowerCase(), ens: trimmed };
  }

  if (isAddress(trimmed)) {
    // Reverse resolution is optional, don't block on failure
    const ens = await reverseResolveENS(trimmed);
    return { address: trimmed, ens };
  }

  throw new Error(`Invalid address or ENS name: ${trimmed}`);
}

export function isMultiWallet(input: string): boolean {
  return input.includes(",") || input.includes("+");
}

export async function resolveInput(
  input: string
): Promise<{ wallets: ResolvedWallet[]; primary: ResolvedWallet }> {
  // Accept both comma and plus as separators
  const parts = input
    .split(/[,+]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const wallets = await Promise.all(parts.map(resolveSingle));
  return { wallets, primary: wallets[0] };
}

// Convert input to URL-friendly format using + separator
export function toUrlPath(input: string): string {
  return input
    .split(/[,+]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join("+");
}
