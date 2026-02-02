"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchTokenDetail, ArtBlocksTokenDetail } from "@/lib/artblocks";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ParallaxImage } from "@/components/ParallaxImage";
import Link from "next/link";

type Status =
  | { phase: "loading" }
  | { phase: "done"; token: ArtBlocksTokenDetail }
  | { phase: "error"; message: string };

export default function TokenDetailPage() {
  const params = useParams();
  const router = useRouter();
  const address = decodeURIComponent(params.address as string);
  const tokenId = decodeURIComponent(params.tokenId as string);
  const [status, setStatus] = useState<Status>({ phase: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const token = await fetchTokenDetail(tokenId);
        if (cancelled) return;
        if (!token) {
          setStatus({ phase: "error", message: "Token not found" });
          return;
        }
        setStatus({ phase: "done", token });
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
  }, [tokenId]);

  return (
    <div className="min-h-screen">
      {/* Floating nav */}
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-4">
        <button
          onClick={() => router.back()}
          className="museum-label rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground"
        >
          Back to Gallery
        </button>
        <div className="museum-label rounded-full p-1">
          <ThemeToggle />
        </div>
      </header>

      {status.phase === "loading" && (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6">
          <div className="h-10 w-10 animate-spin rounded-full border border-muted border-t-accent" />
          <p className="text-sm uppercase tracking-widest text-muted">
            Loading artwork...
          </p>
        </div>
      )}

      {status.phase === "error" && (
        <div className="flex min-h-screen flex-col items-center justify-center text-center">
          <p className="text-xl font-light text-foreground">
            {status.message}
          </p>
          <Link
            href={`/gallery/${encodeURIComponent(address)}`}
            className="mt-8 text-xs uppercase tracking-widest text-accent hover:underline"
          >
            Back to collection
          </Link>
        </div>
      )}

      {status.phase === "done" && <TokenDetail token={status.token} address={address} />}
    </div>
  );
}

function TokenDetail({
  token,
  address,
}: {
  token: ArtBlocksTokenDetail;
  address: string;
}) {
  const aspectRatio = token.project.aspect_ratio || 1;
  const mintDate = token.minted_at
    ? new Date(token.minted_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const features = token.features
    ? Object.entries(token.features).filter(
        ([, v]) => typeof v === "string" || typeof v === "number"
      )
    : [];

  return (
    <>
      {/* Live view or static image */}
      <div className="relative h-[80vh] w-full overflow-hidden bg-card">
        {token.live_view_url ? (
          <LiveView
            src={token.live_view_url}
            fallbackImage={token.media_url || token.preview_asset_url}
            alt={`${token.project_name} #${token.invocation}`}
            aspectRatio={aspectRatio}
          />
        ) : (
          <ParallaxImage
            src={token.media_url || token.preview_asset_url}
            alt={`${token.project_name} #${token.invocation}`}
            className="h-full w-full object-contain transition-opacity duration-700"
          />
        )}
      </div>

      {/* Info section */}
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
        {/* Title block */}
        <div className="border-b border-border pb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            {token.project.artist_name}
          </p>
          <h1 className="mt-3 text-4xl font-light tracking-tight text-foreground sm:text-5xl">
            {token.project.name}
          </h1>
          <p className="mt-3 font-mono text-sm text-muted">
            #{token.invocation} of {token.project.max_invocations}
          </p>
        </div>

        {/* Description */}
        {token.project.description && (
          <div className="border-b border-border py-10">
            <p className="text-sm leading-relaxed text-foreground/80">
              {token.project.description}
            </p>
          </div>
        )}

        {/* Details grid */}
        <div className="grid gap-8 border-b border-border py-10 sm:grid-cols-2">
          <DetailItem label="Collection" value={token.project.curation_status_display || token.project.vertical_name} />
          {mintDate && <DetailItem label="Minted" value={mintDate} />}
          {token.project.license && <DetailItem label="License" value={token.project.license} />}
          {token.project.script_type_and_version && (
            <DetailItem label="Script" value={token.project.script_type_and_version} />
          )}
          <DetailItem
            label="Edition Size"
            value={`${token.project.invocations} / ${token.project.max_invocations}`}
          />
          <DetailItem
            label="Aspect Ratio"
            value={aspectRatio.toFixed(2)}
          />
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="border-b border-border py-10">
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-muted">
              Features
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map(([key, value]) => (
                <DetailItem key={key} label={key} value={String(value)} />
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap gap-6 pt-10">
          {token.live_view_url && (
            <a
              href={token.live_view_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-widest text-accent hover:underline"
            >
              Open Fullscreen
            </a>
          )}
          <a
            href={`https://www.artblocks.io/collections/${token.project.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-widest text-accent hover:underline"
          >
            View on Art Blocks
          </a>
          <Link
            href={`/gallery/${encodeURIComponent(address)}`}
            className="text-xs uppercase tracking-widest text-muted hover:text-foreground"
          >
            Back to Collection
          </Link>
        </div>
      </div>
    </>
  );
}

function LiveView({
  src,
  fallbackImage,
  alt,
  aspectRatio,
}: {
  src: string;
  fallbackImage: string;
  alt: string;
  aspectRatio: number;
}) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  return (
    <div className="relative h-full w-full">
      {/* Static image as fallback while iframe loads */}
      {!iframeLoaded && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fallbackImage}
          alt={alt}
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}
      <iframe
        src={src}
        title={alt}
        onLoad={() => setIframeLoaded(true)}
        sandbox="allow-scripts"
        className={`h-full w-full border-0 transition-opacity duration-700 ${
          iframeLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ aspectRatio }}
      />
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}
