"use client";

import { useState } from "react";
import { TokenGroup } from "@/lib/grouping";
import { ArtBlocksUserProfile } from "@/lib/artblocks";

type ViewMode = "wallet" | "profile";

interface Props {
  address: string;
  ens: string | null;
  groups: TokenGroup[];
  walletCount?: number;
  profile?: ArtBlocksUserProfile | null;
  displayName?: string | null;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  showViewToggle?: boolean;
  linkedWalletCount?: number;
}

// Art Blocks logo placeholder
function ArtBlocksLogo() {
  return <span className="text-xs font-semibold">AB</span>;
}

export function CollectorHeader({
  address,
  ens,
  groups,
  walletCount = 1,
  profile,
  displayName,
  viewMode = "profile",
  onViewModeChange,
  showViewToggle = false,
  linkedWalletCount = 1,
}: Props) {
  const [copied, setCopied] = useState(false);
  const totalTokens = groups.reduce(
    (sum, g) => sum + g.projects.reduce((s, p) => s + p.tokens.length, 0),
    0
  );
  const totalProjects = groups.reduce((sum, g) => sum + g.projects.length, 0);
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  // Determine the best display name: profile name > displayName > ENS > short address
  const headerName = profile?.name || displayName || ens || shortAddress;
  const showShortAddress = headerName !== shortAddress;

  // Art Blocks profile URL (if user has a username)
  const artBlocksProfileUrl = profile?.username
    ? `https://www.artblocks.io/user/${profile.username}`
    : `https://www.artblocks.io/user/${address}`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  };

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-muted">
        {walletCount > 1 ? `Combined Collection (${walletCount} wallets)` : "The Collection of"}
      </p>
      <h1 className="mt-4 text-4xl font-light tracking-tight text-foreground sm:text-6xl">
        {headerName}
      </h1>
      {showShortAddress && (
        <p className="mt-3 font-mono text-sm text-muted">{shortAddress}</p>
      )}

      {/* View mode toggle - only show when there are linked wallets */}
      {showViewToggle && onViewModeChange && (
        <div className="mt-6 flex items-center gap-1 rounded-full border border-border p-1">
          <button
            onClick={() => onViewModeChange("wallet")}
            className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-wider transition-colors ${
              viewMode === "wallet"
                ? "bg-foreground text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            This Wallet
          </button>
          <button
            onClick={() => onViewModeChange("profile")}
            className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-wider transition-colors ${
              viewMode === "profile"
                ? "bg-foreground text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            Full Profile ({linkedWalletCount})
          </button>
        </div>
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

      {/* External links */}
      <div className="mt-8 flex items-center gap-3">
        <a
          href={artBlocksProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
          title="View on Art Blocks"
        >
          <ArtBlocksLogo />
        </a>
        <a
          href={`https://etherscan.io/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
          title="View on Etherscan"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        <button
          onClick={handleShare}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
          title={copied ? "Copied!" : "Copy gallery link"}
        >
          {copied ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
