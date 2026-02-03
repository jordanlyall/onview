"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { fetchTokenDetail, ArtBlocksTokenDetail } from "@/lib/artblocks";
import { ParallaxImage } from "./ParallaxImage";

interface Props {
  tokenId: string;
  tokenIds: string[];
  onNavigate: (tokenId: string) => void;
  onClose: () => void;
}

const IDLE_TIMEOUT = 3000;
const SLIDESHOW_INTERVAL = 60000;

export function TokenModal({ tokenId, tokenIds, onNavigate, onClose }: Props) {
  const [token, setToken] = useState<ArtBlocksTokenDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uiVisible, setUiVisible] = useState(true);
  const [slideshow, setSlideshow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const slideshowRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const currentIndex = tokenIds.indexOf(tokenId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < tokenIds.length - 1;

  const goNext = useCallback(() => {
    if (currentIndex < tokenIds.length - 1) {
      onNavigate(tokenIds[currentIndex + 1]);
    }
  }, [currentIndex, tokenIds, onNavigate]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(tokenIds[currentIndex - 1]);
    }
  }, [currentIndex, tokenIds, onNavigate]);

  // Auto-hide UI after inactivity
  const resetIdleTimer = useCallback(() => {
    setUiVisible(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setUiVisible(false), IDLE_TIMEOUT);
  }, []);

  useEffect(() => {
    resetIdleTimer();
    return () => clearTimeout(timerRef.current);
  }, [resetIdleTimer]);

  // Track mouse/touch movement
  useEffect(() => {
    const handler = () => resetIdleTimer();
    window.addEventListener("mousemove", handler);
    window.addEventListener("touchstart", handler);
    return () => {
      window.removeEventListener("mousemove", handler);
      window.removeEventListener("touchstart", handler);
    };
  }, [resetIdleTimer]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchTokenDetail(tokenId)
      .then((t) => {
        if (cancelled) return;
        if (!t) {
          setError("Token not found");
        } else {
          setToken(t);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Something went wrong");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tokenId]);

  // Keyboard: Escape, ArrowLeft, ArrowRight
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    },
    [onClose, goNext, goPrev]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  // Slideshow auto-advance
  useEffect(() => {
    if (slideshow && hasNext) {
      slideshowRef.current = setInterval(goNext, SLIDESHOW_INTERVAL);
      return () => clearInterval(slideshowRef.current);
    } else {
      clearInterval(slideshowRef.current);
    }
  }, [slideshow, hasNext, goNext]);

  // Stop slideshow at end of list
  useEffect(() => {
    if (slideshow && !hasNext) {
      setSlideshow(false);
    }
  }, [slideshow, hasNext]);

  const toggleSlideshow = useCallback(() => {
    setSlideshow((s) => !s);
    resetIdleTimer();
  }, [resetIdleTimer]);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-background">
      {/* UI overlay - fixed to viewport, fades on idle */}
      <div
        className={`pointer-events-none fixed inset-0 z-[110] transition-opacity duration-500 ${
          uiVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Top bar: close + slideshow */}
        <div className="pointer-events-auto absolute right-4 top-4 flex items-center gap-2">
          <button
            onClick={toggleSlideshow}
            className="rounded-full bg-black/40 p-3 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
            aria-label={slideshow ? "Pause slideshow" : "Play slideshow"}
            title={slideshow ? "Pause" : "Slideshow"}
          >
            {slideshow ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 4H6v16h4V4zM18 4h-4v16h4V4z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 4l15 8-15 8V4z" />
              </svg>
            )}
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-black/40 p-3 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Left/right navigation arrows */}
        {hasPrev && (
          <button
            onClick={goPrev}
            className="pointer-events-auto absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
            aria-label="Previous"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        )}
        {hasNext && (
          <button
            onClick={goNext}
            className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
            aria-label="Next"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        )}

        {/* Bottom gradient for text readability */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Artwork info overlay - bottom left */}
        {token && (
          <div className="pointer-events-none absolute bottom-8 left-8">
            <p className="text-xs uppercase tracking-widest text-white/70 drop-shadow-md">
              {token.project.artist_name}
            </p>
            <p className="mt-1 text-lg font-light text-white drop-shadow-md">
              {token.project.name}
            </p>
            <p className="mt-1 font-mono text-xs text-white/60 drop-shadow-md">
              #{token.invocation} of {token.project.max_invocations}
              {tokenIds.length > 1 && (
                <span className="ml-3">
                  {currentIndex + 1} / {tokenIds.length}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Scroll down hint - bottom center */}
        {token && (
          <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <p className="text-xs uppercase tracking-widest text-white/60 drop-shadow-md">
              Scroll for details
            </p>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="animate-bounce text-white/60 drop-shadow-md"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        )}
      </div>

      {/* Content with sticky artwork */}
      {loading && (
        <div className="flex h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border border-muted border-t-accent" />
        </div>
      )}

      {error && (
        <div className="flex h-screen flex-col items-center justify-center text-center">
          <p className="text-xl font-light text-foreground">{error}</p>
          <button
            onClick={onClose}
            className="mt-8 text-xs uppercase tracking-widest text-accent hover:underline"
          >
            Close
          </button>
        </div>
      )}

      {token && <TokenDetailContent token={token} />}
    </div>
  );
}

function TokenDetailContent({ token }: { token: ArtBlocksTokenDetail }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
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
      {/* Sticky artwork - stays pinned while scrolling */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {token.live_view_url ? (
          <div className="relative h-full w-full">
            {!iframeLoaded && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={token.media_url || token.preview_asset_url}
                alt={`${token.project_name} #${token.invocation}`}
                className="absolute inset-0 h-full w-full object-contain"
              />
            )}
            <iframe
              src={token.live_view_url}
              title={`${token.project_name} #${token.invocation}`}
              onLoad={() => setIframeLoaded(true)}
              sandbox="allow-scripts"
              className={`h-full w-full border-0 transition-opacity duration-700 ${
                iframeLoaded ? "opacity-100" : "opacity-0"
              }`}
              style={{ aspectRatio }}
            />
          </div>
        ) : (
          <ParallaxImage
            src={token.media_url || token.preview_asset_url}
            alt={`${token.project_name} #${token.invocation}`}
            className="h-full w-full object-contain transition-opacity duration-700"
          />
        )}
      </div>

      {/* Info section - slides up over the sticky artwork */}
      <div className="relative z-10 bg-background">
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
            <DetailItem
              label="Collection"
              value={
                token.project.curation_status_display ||
                token.project.vertical_name
              }
            />
            {mintDate && <DetailItem label="Minted" value={mintDate} />}
            {token.project.license && (
              <DetailItem label="License" value={token.project.license} />
            )}
            {token.project.script_type_and_version && (
              <DetailItem
                label="Script"
                value={token.project.script_type_and_version}
              />
            )}
            <DetailItem
              label="Edition Size"
              value={`${token.project.invocations} / ${token.project.max_invocations}`}
            />
            <DetailItem label="Aspect Ratio" value={aspectRatio.toFixed(2)} />
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
          </div>
        </div>
      </div>
    </>
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
