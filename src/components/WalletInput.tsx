"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toUrlPath } from "@/lib/ens";

export function WalletInput() {
  const [input, setInput] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) {
      // Use + separator for clean URLs (no encoding needed)
      router.push(`/gallery/${toUrlPath(trimmed)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg">
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ENS or address (use + for multiple)"
          className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          spellCheck={false}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="rounded-lg bg-accent px-6 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          View
        </button>
      </div>
    </form>
  );
}
