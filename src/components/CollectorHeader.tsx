"use client";

import { useState } from "react";
import { TokenGroup } from "@/lib/grouping";

interface Props {
  address: string;
  ens: string | null;
  groups: TokenGroup[];
  walletCount?: number;
}

export function CollectorHeader({ address, ens, groups, walletCount = 1 }: Props) {
  const [copied, setCopied] = useState(false);
  const totalTokens = groups.reduce(
    (sum, g) => sum + g.projects.reduce((s, p) => s + p.tokens.length, 0),
    0
  );
  const totalProjects = groups.reduce((sum, g) => sum + g.projects.length, 0);
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

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

      {/* External links */}
      <div className="mt-8 flex items-center gap-3">
        <a
          href={`https://opensea.io/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
          title="View on OpenSea"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0ZM5.92 12.403l.051-.081 3.123-4.884a.107.107 0 0 1 .187.014c.52 1.169.972 2.623.76 3.528-.088.372-.335.876-.614 1.342a2.405 2.405 0 0 1-.117.199.106.106 0 0 1-.09.045H6.013a.106.106 0 0 1-.091-.163Zm13.914 1.68a.109.109 0 0 1-.065.101c-.243.103-1.07.485-1.414.962-.878 1.222-1.548 2.97-3.048 2.97H9.053a4.019 4.019 0 0 1-4.013-4.028v-.072c0-.058.048-.106.108-.106h3.485c.07 0 .12.063.115.132-.026.226.017.459.125.67.206.42.636.682 1.099.682h1.726v-1.347H9.99a.11.11 0 0 1-.089-.173l.063-.09c.16-.231.391-.586.621-.992.157-.278.308-.576.43-.874.024-.061.043-.122.063-.182.03-.104.063-.202.086-.3.024-.085.043-.175.058-.261a3.6 3.6 0 0 0 .058-.718c0-.246-.015-.498-.044-.739a6.418 6.418 0 0 0-.058-.434 5.098 5.098 0 0 0-.1-.467c-.033-.154-.071-.3-.115-.443l-.017-.058c-.033-.122-.063-.238-.102-.35a8.463 8.463 0 0 0-.374-.977c-.046-.122-.1-.238-.152-.35-.077-.175-.158-.333-.228-.476a4.07 4.07 0 0 1-.104-.199c-.029-.061-.063-.117-.089-.175l-.277-.485c-.038-.065.024-.143.096-.122l1.32.357h.01l.173.05.19.057.07.02v-.78c0-.388.31-.702.692-.702a.695.695 0 0 1 .692.702v1.157l.14.043s.01.002.015.007a.564.564 0 0 1 .057.042c.024.02.058.046.1.077.029.024.063.053.1.084.071.061.154.137.248.221.024.02.048.043.068.063.117.105.251.226.39.363.038.038.077.076.115.117.14.14.286.297.428.467.048.053.091.112.139.165.048.058.1.117.14.175.058.078.122.16.176.246.029.038.053.081.082.119.082.122.154.249.22.377.029.058.058.122.082.182.063.131.11.266.15.4.014.044.029.094.038.143v.01c.015.058.024.121.034.179a2.008 2.008 0 0 1-.048.959 1.717 1.717 0 0 1-.058.182c-.029.077-.058.149-.091.226a2.632 2.632 0 0 1-.29.481c-.033.053-.072.105-.11.162-.038.053-.082.105-.12.153a2.59 2.59 0 0 1-.168.2c-.038.048-.082.1-.125.147-.058.063-.117.126-.18.185l-.115.111a.86.86 0 0 1-.115.1l-.074.072a.11.11 0 0 1-.072.029h-1.051v1.347h1.322c.295 0 .576-.104.804-.298.077-.063.492-.426.984-.975a.108.108 0 0 1 .058-.033l3.65-1.056a.106.106 0 0 1 .134.103v.773Z" />
          </svg>
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
