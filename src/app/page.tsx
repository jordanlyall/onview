import Link from "next/link";
import { WalletInput } from "@/components/WalletInput";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="absolute right-6 top-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-col items-center gap-8 text-center">
        <div>
          <h1 className="text-5xl font-light tracking-tight sm:text-7xl">
            <span className="text-foreground">onview</span>
            <span className="text-accent">.art</span>
          </h1>
          <p className="mt-4 text-lg text-muted">
            Your Art Blocks collection, beautifully presented
          </p>
        </div>

        <div className="flex w-full max-w-lg flex-col gap-3">
          <WalletInput />
          <p className="text-sm text-muted/70">
            Enter an ENS name or wallet address. Use{" "}
            <span className="font-mono text-muted">+</span> to combine multiple wallets.
          </p>
        </div>

        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-xs uppercase tracking-widest text-muted/50">
            Try an example
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/gallery/artblocks.eth"
              className="rounded-full border border-border px-4 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
            >
              artblocks.eth
            </Link>
            <Link
              href="/gallery/punk6529.eth"
              className="rounded-full border border-border px-4 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
            >
              punk6529.eth
            </Link>
            <Link
              href="/gallery/cozomo.eth"
              className="rounded-full border border-border px-4 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
            >
              cozomo.eth
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
