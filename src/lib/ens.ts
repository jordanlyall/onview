import { createPublicClient, http, isAddress } from "viem";
import { normalize } from "viem/ens";
import { mainnet } from "viem/chains";

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export function isENS(input: string): boolean {
  return input.endsWith(".eth");
}

export interface ResolvedWallet {
  address: string;
  ens: string | null;
}

async function resolveSingle(input: string): Promise<ResolvedWallet> {
  const trimmed = input.trim().toLowerCase();

  if (isENS(trimmed)) {
    const address = await client.getEnsAddress({
      name: normalize(trimmed),
    });
    if (!address) {
      throw new Error(`Could not resolve ENS name: ${trimmed}`);
    }
    return { address: address.toLowerCase(), ens: trimmed };
  }

  if (isAddress(trimmed)) {
    let ens: string | null = null;
    try {
      ens = await client.getEnsName({
        address: trimmed as `0x${string}`,
      });
    } catch {
      // Reverse resolution is optional
    }
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
