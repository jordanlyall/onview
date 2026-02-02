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
          <h1 className="text-5xl font-light tracking-tight text-foreground sm:text-7xl">
            Auto Gallery
          </h1>
          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-muted">
            Art Blocks Collection Viewer
          </p>
        </div>
        <WalletInput />
      </div>
    </div>
  );
}
