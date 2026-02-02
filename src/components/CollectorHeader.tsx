"use client";

import { TokenGroup } from "@/lib/grouping";

interface Props {
  address: string;
  ens: string | null;
  groups: TokenGroup[];
  walletCount?: number;
}

export function CollectorHeader({ address, ens, groups, walletCount = 1 }: Props) {
  const totalTokens = groups.reduce(
    (sum, g) => sum + g.projects.reduce((s, p) => s + p.tokens.length, 0),
    0
  );
  const totalProjects = groups.reduce((sum, g) => sum + g.projects.length, 0);
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-muted">
        {walletCount > 1 ? `Combined Collection (${walletCount} wallets)` : "The Collection of"}
      </p>
      <h1 className="mt-4 text-4xl font-light tracking-tight text-foreground sm:text-6xl">
        {ens || shortAddress}
      </h1>
      {ens && (
        <p className="mt-3 font-mono text-sm text-muted">{shortAddress}</p>
      )}
      <div className="mt-8 flex gap-10 text-sm text-muted">
        <div className="text-center">
          <p className="text-2xl font-light text-foreground">{totalTokens}</p>
          <p className="mt-1 text-xs uppercase tracking-widest">Pieces</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-light text-foreground">{totalProjects}</p>
          <p className="mt-1 text-xs uppercase tracking-widest">Projects</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-light text-foreground">{groups.length}</p>
          <p className="mt-1 text-xs uppercase tracking-widest">Collections</p>
        </div>
      </div>
    </div>
  );
}
