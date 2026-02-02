"use client";

import { ArtBlocksToken } from "@/lib/artblocks";
import { useState } from "react";
import { ParallaxImage } from "./ParallaxImage";

interface Props {
  token: ArtBlocksToken;
  variant: "hero" | "featured" | "grid";
  onSelect: (tokenId: string) => void;
}

export function TokenCard({ token, variant, onSelect }: Props) {
  const [loaded, setLoaded] = useState(false);
  const aspectRatio = token.project.aspect_ratio || 1;
  const handleClick = () => onSelect(token.id);

  if (variant === "hero") {
    return <HeroCard token={token} onClick={handleClick} />;
  }

  if (variant === "featured") {
    return (
      <FeaturedCard
        token={token}
        aspectRatio={aspectRatio}
        loaded={loaded}
        onLoad={() => setLoaded(true)}
        onClick={handleClick}
      />
    );
  }

  return (
    <GridCard
      token={token}
      aspectRatio={aspectRatio}
      loaded={loaded}
      onLoad={() => setLoaded(true)}
      onClick={handleClick}
    />
  );
}

function HeroCard({
  token,
  onClick,
}: {
  token: ArtBlocksToken;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative block h-[85vh] w-full overflow-hidden cursor-pointer text-left"
    >
      <ParallaxImage
        src={token.media_url || token.preview_asset_url}
        alt={`${token.project_name} #${token.invocation}`}
        className="h-full w-full object-cover transition-opacity duration-700"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8 sm:p-12">
        <p className="text-sm uppercase tracking-widest text-white/60">
          {token.project.artist_name}
        </p>
        <h2 className="mt-2 text-3xl font-light text-white sm:text-5xl">
          {token.project.name}
        </h2>
        <p className="mt-2 text-sm text-white/50">
          #{token.invocation} of {token.project.max_invocations}
        </p>
      </div>
    </button>
  );
}

function FeaturedCard({
  token,
  aspectRatio,
  loaded,
  onLoad,
  onClick,
}: {
  token: ArtBlocksToken;
  aspectRatio: number;
  loaded: boolean;
  onLoad: () => void;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="group relative block cursor-pointer text-left w-full">
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio }}
      >
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-card" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={token.media_url || token.preview_asset_url}
          alt={`${token.project_name} #${token.invocation}`}
          loading="lazy"
          onLoad={onLoad}
          className={`parallax-img h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.01] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <p className="text-lg font-light text-foreground">
            {token.project.name}
          </p>
          <p className="text-sm text-muted">{token.project.artist_name}</p>
        </div>
        <p className="font-mono text-xs text-muted">
          #{token.invocation} / {token.project.max_invocations}
        </p>
      </div>
    </button>
  );
}

function GridCard({
  token,
  aspectRatio,
  loaded,
  onLoad,
  onClick,
}: {
  token: ArtBlocksToken;
  aspectRatio: number;
  loaded: boolean;
  onLoad: () => void;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="group block cursor-pointer text-left w-full">
      <div
        className="relative w-full overflow-hidden rounded"
        style={{ aspectRatio }}
      >
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-card" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={token.media_url || token.preview_asset_url}
          alt={`${token.project_name} #${token.invocation}`}
          loading="lazy"
          onLoad={onLoad}
          className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.02] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
      <div className="mt-2">
        <p className="truncate text-sm text-foreground">{token.project.name}</p>
        <p className="truncate text-xs text-muted">
          {token.project.artist_name} &middot; #{token.invocation}
        </p>
      </div>
    </button>
  );
}
