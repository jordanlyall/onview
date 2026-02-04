import Link from "next/link";
import { WalletInput } from "@/components/WalletInput";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="absolute right-4 top-4 sm:right-6">
        <ThemeToggle />
      </div>
      <div className="flex w-full flex-col items-center gap-6 text-center sm:gap-8">
        <div>
          <h1 className="text-4xl font-light tracking-tight sm:text-5xl md:text-7xl">
            <span className="text-foreground">onview</span>
            <span className="text-accent">.art</span>
          </h1>
          <p className="mt-3 text-base text-muted sm:mt-4 sm:text-lg">
            Your Art Blocks collection, beautifully presented
          </p>
        </div>

        <div className="flex w-full max-w-lg flex-col gap-3 px-2 sm:px-0">
          <WalletInput />
          <p className="text-xs text-muted/70 sm:text-sm">
            Separate multiple wallets with commas
          </p>
        </div>

        <div className="mt-2 flex flex-col items-center gap-2 sm:mt-4">
          <p className="text-xs uppercase tracking-widest text-muted/50">
            Try an example
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <Link
              href="/snowfro.eth"
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent sm:px-4 sm:text-sm"
            >
              snowfro.eth
            </Link>
            <Link
              href="/vault.jordanlyall.eth"
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent sm:px-4 sm:text-sm"
            >
              vault.jordanlyall.eth
            </Link>
            <Link
              href="/0xhouston.eth"
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent sm:px-4 sm:text-sm"
            >
              0xhouston.eth
            </Link>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-muted/50">
          Powered by{" "}
          <a
            href="https://artblocks.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent"
          >
            Art Blocks
          </a>
        </p>
      </footer>
    </div>
  );
}
