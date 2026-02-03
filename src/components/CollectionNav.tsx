"use client";

import { useEffect, useState } from "react";
import { TokenGroup } from "@/lib/grouping";

interface Props {
  groups: TokenGroup[];
}

export function CollectionNav({ groups }: Props) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Track which section is in view
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    groups.forEach((group) => {
      const sectionId = `section-${group.label.toLowerCase().replace(/\s+/g, "-")}`;
      const el = document.getElementById(sectionId);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(group.label);
          }
        },
        { threshold: 0.2, rootMargin: "-80px 0px -50% 0px" }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [groups]);

  // Show nav after scrolling past the header
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight * 0.4);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (label: string) => {
    const sectionId = `section-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (groups.length <= 1) return null;

  return (
    <nav
      className={`fixed left-1/2 top-4 z-40 -translate-x-1/2 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      <div className="museum-label flex items-center gap-1 rounded-full px-2 py-1.5 sm:gap-2 sm:px-3">
        {groups.map((group) => {
          const isActive = activeSection === group.label;
          const tokenCount = group.projects.reduce(
            (sum, p) => sum + p.tokens.length,
            0
          );

          return (
            <button
              key={group.label}
              onClick={() => scrollToSection(group.label)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors sm:px-3 sm:py-1.5 ${
                isActive
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <span className="hidden sm:inline">{group.label}</span>
              <span className="sm:hidden">{getShortLabel(group.label)}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                  isActive ? "bg-white/20" : "bg-border"
                }`}
              >
                {tokenCount}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function getShortLabel(label: string): string {
  const shorts: Record<string, string> = {
    Curated: "Cur",
    Presents: "Pres",
    Heritage: "Her",
    "Art Blocks 500": "500",
    Explorations: "Exp",
    Playground: "Play",
    Collaborations: "Col",
    Studio: "Stu",
  };
  return shorts[label] || label.slice(0, 3);
}
