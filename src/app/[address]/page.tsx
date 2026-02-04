"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { resolveInput } from "@/lib/ens";
import {
  fetchWalletTokens,
  fetchMultiWalletTokens,
  ArtBlocksToken,
} from "@/lib/artblocks";
import { groupTokens, TokenGroup } from "@/lib/grouping";
import { CollectorHeader } from "@/components/CollectorHeader";
import { CollectionNav } from "@/components/CollectionNav";
import { GallerySection } from "@/components/GallerySection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TokenModal } from "@/components/TokenModal";
import Link from "next/link";

type Status =
  | { phase: "resolving" }
  | { phase: "fetching"; message: string }
  | { phase: "grouping"; count: number }
  | {
      phase: "done";
      address: string;
      ens: string | null;
      groups: TokenGroup[];
      walletCount: number;
    }
  | { phase: "error"; message: string }
  | { phase: "empty"; address: string; ens: string | null };

export default function GalleryPage() {
  const params = useParams();
  const input = decodeURIComponent(params.address as string);
  const [status, setStatus] = useState<Status>({ phase: "resolving" });
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  const handleSelectToken = useCallback((tokenId: string) => {
    setSelectedTokenId(tokenId);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTokenId(null);
  }, []);

  const handleNavigate = useCallback((tokenId: string) => {
    setSelectedTokenId(tokenId);
  }, []);

  // Build ordered list of all token IDs matching gallery display order
  const allTokenIds = useMemo(() => {
    if (status.phase !== "done") return [];
    return status.groups.flatMap((g) =>
      g.projects.flatMap((p) => p.tokens.map((t) => t.id))
    );
  }, [status]);

  // Update page title when collection loads
  useEffect(() => {
    if (status.phase === "done") {
      const name = status.ens || `${status.address.slice(0, 6)}...${status.address.slice(-4)}`;
      const totalPieces = status.groups.reduce(
        (sum, g) => sum + g.projects.reduce((s, p) => s + p.tokens.length, 0),
        0
      );
      document.title = `${name} (${totalPieces} pieces) | onview.art`;
    } else if (status.phase === "error" || status.phase === "empty") {
      document.title = "onview.art";
    }
  }, [status]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setStatus({ phase: "resolving" });
        const { wallets, primary } = await resolveInput(input);

        if (cancelled) return;

        let tokens: ArtBlocksToken[];

        if (wallets.length === 1) {
          setStatus({ phase: "fetching", message: "Fetching collection..." });
          tokens = await fetchWalletTokens(primary.address, (count) => {
            if (!cancelled) {
              setStatus({
                phase: "fetching",
                message: `Fetched ${count} pieces...`,
              });
            }
          });
        } else {
          setStatus({
            phase: "fetching",
            message: `Fetching from ${wallets.length} wallets...`,
          });
          tokens = await fetchMultiWalletTokens(
            wallets.map((w) => w.address),
            (count, wallet, total) => {
              if (!cancelled) {
                setStatus({
                  phase: "fetching",
                  message: `Wallet ${wallet}/${total} — ${count} pieces so far...`,
                });
              }
            }
          );
        }

        if (cancelled) return;
        if (tokens.length === 0) {
          setStatus({
            phase: "empty",
            address: primary.address,
            ens: primary.ens,
          });
          return;
        }

        setStatus({ phase: "grouping", count: tokens.length });
        const groups = groupTokens(tokens);

        if (cancelled) return;
        setStatus({
          phase: "done",
          address: primary.address,
          ens: primary.ens,
          groups,
          walletCount: wallets.length,
        });
      } catch (err) {
        if (cancelled) return;
        setStatus({
          phase: "error",
          message: err instanceof Error ? err.message : "Something went wrong",
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [input]);

  return (
    <div className="min-h-screen">
      {/* Floating nav */}
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="pointer-events-auto museum-label rounded-full px-4 py-2 text-sm font-light tracking-tight text-muted transition-colors hover:text-foreground"
        >
          <span>onview</span>
          <span className="text-accent">.art</span>
        </Link>
        <div className="pointer-events-auto museum-label rounded-full p-1">
          <ThemeToggle />
        </div>
      </header>

      {(status.phase === "resolving" ||
        status.phase === "fetching" ||
        status.phase === "grouping") && (
        <LoadingMessage
          message={
            status.phase === "resolving"
              ? "Resolving address..."
              : status.phase === "fetching"
                ? status.message
                : `Found ${status.count} pieces, curating gallery...`
          }
        />
      )}

      {status.phase === "error" && <ErrorMessage message={status.message} />}

      {status.phase === "empty" && (
        <div className="flex min-h-screen flex-col items-center justify-center text-center">
          <p className="text-xl font-light text-foreground">
            No Art Blocks pieces found
          </p>
          <p className="mt-3 text-sm text-muted">
            This wallet doesn&apos;t hold any Art Blocks tokens.
          </p>
          <Link
            href="/"
            className="mt-8 text-xs uppercase tracking-widest text-accent hover:underline"
          >
            Try another wallet
          </Link>
        </div>
      )}

      {status.phase === "done" && (
        <>
          <CollectionNav groups={status.groups} />
          <CollectorHeader
            address={status.address}
            ens={status.ens}
            groups={status.groups}
            walletCount={status.walletCount}
          />
          {status.groups.map((group, i) => (
            <GallerySection
              key={group.label}
              group={group}
              index={i}
              onSelectToken={handleSelectToken}
            />
          ))}
          <footer className="py-16 text-center">
            <Link
              href="/"
              className="text-xs uppercase tracking-widest text-muted hover:text-foreground"
            >
              View another collection
            </Link>
          </footer>
        </>
      )}

      {/* Token detail modal */}
      {selectedTokenId && (
        <TokenModal
          tokenId={selectedTokenId}
          tokenIds={allTokenIds}
          onNavigate={handleNavigate}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

function LoadingMessage({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="h-10 w-10 animate-spin rounded-full border border-muted border-t-accent" />
      <p className="text-sm uppercase tracking-widest text-muted">{message}</p>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <p className="text-xl font-light text-foreground">Something went wrong</p>
      <p className="mt-3 text-sm text-muted">{message}</p>
      <Link
        href="/"
        className="mt-8 text-xs uppercase tracking-widest text-accent hover:underline"
      >
        Try again
      </Link>
    </div>
  );
}
