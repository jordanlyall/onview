"use client";

import { useEffect, useRef, useState } from "react";
import { TokenGroup } from "@/lib/grouping";
import { TokenCard } from "./TokenCard";

const FEATURED_LIMIT = 4;

export function GallerySection({
  group,
  onSelectToken,
}: {
  group: TokenGroup;
  onSelectToken: (tokenId: string) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const allTokens = group.projects.flatMap((p) => p.tokens);
  const heroToken = allTokens[0];
  const featuredTokens = allTokens.slice(1, 1 + FEATURED_LIMIT);
  const gridTokens = allTokens.slice(1 + FEATURED_LIMIT);

  const totalTokens = allTokens.length;

  return (
    <section
      ref={ref}
      className={`gallery-section mb-24 ${visible ? "visible" : ""}`}
    >
      {/* Tier divider */}
      <div className="mb-12 flex items-center gap-6 px-4 sm:px-8">
        <div className="h-px flex-1 bg-border" />
        <div className="text-center">
          <h2 className="text-xs font-medium uppercase tracking-[0.3em] text-muted">
            {group.label}
          </h2>
          <p className="mt-1 text-xs text-muted/60">
            {totalTokens} piece{totalTokens !== 1 ? "s" : ""} &middot;{" "}
            {group.projects.length} project
            {group.projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Hero piece */}
      {heroToken && (
        <TokenCard token={heroToken} variant="hero" onSelect={onSelectToken} />
      )}

      {/* Featured pieces - large format */}
      {featuredTokens.length > 0 && (
        <div className="mx-auto mt-16 grid max-w-6xl gap-12 px-4 sm:grid-cols-2 sm:px-8">
          {featuredTokens.map((token) => (
            <TokenCard
              key={token.id}
              token={token}
              variant="featured"
              onSelect={onSelectToken}
            />
          ))}
        </div>
      )}

      {/* Grid for remaining pieces */}
      {gridTokens.length > 0 && (
        <div className="mx-auto mt-16 max-w-7xl px-4 sm:px-8">
          <p className="mb-6 text-xs uppercase tracking-widest text-muted">
            Collection
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {gridTokens.map((token) => (
              <TokenCard
                key={token.id}
                token={token}
                variant="grid"
                onSelect={onSelectToken}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
