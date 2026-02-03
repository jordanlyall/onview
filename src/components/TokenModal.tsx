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
const SWIPE_THRESHOLD = 50;

export function TokenModal({ tokenId, tokenIds, onNavigate, onClose }: Props) {
  const [token, setToken] = useState<ArtBlocksTokenDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uiVisible, setUiVisible] = useState(true);
  const [slideshow, setSlideshow] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const slideshowRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

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

  // Track mouse/touch movement - also track clicks to catch iframe edge cases
  useEffect(() => {
    const handler = () => resetIdleTimer();
    window.addEventListener("mousemove", handler);
    window.addEventListener("touchstart", handler);
    window.addEventListener("click", handler);
    return () => {
      window.removeEventListener("mousemove", handler);
      window.removeEventListener("touchstart", handler);
      window.removeEventListener("click", handler);
    };
  }, [resetIdleTimer]);

  // Hide scroll hint once user has scrolled
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (el.scrollTop > 50) {
        setHasScrolled(true);
      }
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setHasScrolled(false);
    if (modalRef.current) modalRef.current.scrollTop = 0;

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

  // Swipe gestures for mobile navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;

      // Only trigger if horizontal swipe is dominant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX > 0) {
          goPrev();
        } else {
          goNext();
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
    },
    [goNext, goPrev]
  );

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
    <div
      ref={modalRef}
      className="fixed inset-0 z-[100] overflow-y-auto bg-background"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseMove={resetIdleTimer}
      onClick={resetIdleTimer}
    >
      {/* UI overlay - fixed to viewport, fades on idle */}
      <div
        className={`pointer-events-none fixed inset-0 z-[110] transition-opacity duration-500 ${
          uiVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Top bar: close + slideshow */}
        <div className="pointer-events-auto absolute right-2 top-2 flex items-center gap-2 sm:right-4 sm:top-4">
          <button
            onClick={toggleSlideshow}
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white sm:h-12 sm:w-12"
            aria-label={slideshow ? "Pause slideshow" : "Play slideshow"}
            title={slideshow ? "Pause" : "Slideshow"}
          >
            {/* Circular progress indicator */}
            {slideshow && (
              <svg
                key={tokenId}
                className="absolute inset-0 -rotate-90"
                width="100%"
                height="100%"
                viewBox="0 0 44 44"
              >
                <circle
                  cx="22"
                  cy="22"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="125.6"
                  strokeDashoffset="125.6"
                  className="text-accent"
                  style={{
                    animation: `slideshow-progress ${SLIDESHOW_INTERVAL}ms linear forwards`,
                  }}
                />
              </svg>
            )}
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
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white sm:h-12 sm:w-12"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Left/right navigation arrows - hidden on mobile, swipe instead */}
        {hasPrev && (
          <button
            onClick={goPrev}
            className="pointer-events-auto absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-3 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white sm:flex sm:left-4"
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
            className="pointer-events-auto absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-3 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white sm:flex sm:right-4"
            aria-label="Next"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        )}

        {/* Bottom gradient for text readability */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Scroll/swipe hint - bottom center, hidden after scrolling */}
        {token && !hasScrolled && (
          <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 sm:bottom-8">
            <p className="text-xs uppercase tracking-widest text-white/60 drop-shadow-md">
              <span className="hidden sm:inline">Scroll for details</span>
              <span className="sm:hidden">Swipe to navigate</span>
            </p>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="animate-bounce text-white/60 drop-shadow-md sm:block hidden"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-white/60 drop-shadow-md sm:hidden"
            >
              <path d="M8 7l4-4 4 4M8 17l4 4 4-4" />
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

      {token && <TokenDetailContent token={token} uiVisible={uiVisible} />}
    </div>
  );
}

function TokenDetailContent({ token, uiVisible }: { token: ArtBlocksTokenDetail; uiVisible: boolean }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
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
        {/* Skeleton placeholder */}
        {!imageLoaded && !iframeLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}

        {/* Artwork info overlay - scrolls with art, fades on idle */}
        <div
          className={`pointer-events-none absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent pb-6 pl-4 pt-16 transition-opacity duration-500 sm:pb-8 sm:pl-8 sm:pt-24 ${
            uiVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-[10px] uppercase tracking-widest text-white/70 drop-shadow-md sm:text-xs">
            {token.project.artist_name}
          </p>
          <p className="mt-1 text-base font-light text-white drop-shadow-md sm:text-lg">
            {token.project.name}
          </p>
          <p className="mt-1 font-mono text-[10px] text-white/60 drop-shadow-md sm:text-xs">
            #{token.invocation} of {token.project.max_invocations}
          </p>
        </div>

        {token.live_view_url ? (
          <div className="relative h-full w-full">
            {!iframeLoaded && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={token.media_url || token.preview_asset_url}
                alt={`${token.project_name} #${token.invocation}`}
                onLoad={() => setImageLoaded(true)}
                className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
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
            onLoad={() => setImageLoaded(true)}
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
          <div className="flex flex-wrap gap-4 pt-10">
            {token.live_view_url && (
              <a
                href={token.live_view_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
                title="Open Fullscreen"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
                <span className="sr-only sm:not-sr-only">Fullscreen</span>
              </a>
            )}
            <a
              href={`https://www.artblocks.io/token/1/${token.contract_address}/${token.token_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
              title="View on Art Blocks"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
              </svg>
              <span className="sr-only sm:not-sr-only">Art Blocks</span>
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
