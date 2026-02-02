import { ArtBlocksToken } from "./artblocks";

export interface TokenGroup {
  label: string;
  sortOrder: number;
  projects: ProjectGroup[];
}

export interface ProjectGroup {
  projectName: string;
  artistName: string;
  curationStatus: string;
  slug: string;
  tokens: ArtBlocksToken[];
}

const TIER_ORDER: Record<string, number> = {
  curated: 0,
  presents: 1,
  heritage: 2,
  ab500: 3,
  explorations: 4,
  flex: 5,
  playground: 6,
  collaborations: 7,
};

function getTierLabel(token: ArtBlocksToken): string {
  const curation = token.project.curation_status_display?.toLowerCase() || "";
  const vertical = token.project.vertical_name?.toLowerCase() || "";

  if (curation === "curated" || vertical === "curated") return "Curated";
  if (curation === "presents" || vertical === "presents") return "Presents";
  if (curation === "heritage" || vertical === "heritage") return "Heritage";
  if (vertical === "ab500") return "Art Blocks 500";
  if (
    curation === "explorations" ||
    vertical === "explorations" ||
    curation === "factory"
  )
    return "Explorations";
  if (curation === "flex" || vertical === "flex") return "Flex";
  if (curation === "playground" || vertical === "playground")
    return "Playground";
  if (vertical === "collaborations") return "Collaborations";

  return "Other";
}

function getTierOrder(label: string): number {
  return TIER_ORDER[label.toLowerCase()] ?? 99;
}

export function groupTokens(tokens: ArtBlocksToken[]): TokenGroup[] {
  // Group by tier
  const tierMap = new Map<string, ArtBlocksToken[]>();

  for (const token of tokens) {
    const tier = getTierLabel(token);
    if (!tierMap.has(tier)) {
      tierMap.set(tier, []);
    }
    tierMap.get(tier)!.push(token);
  }

  // Build groups
  const groups: TokenGroup[] = [];

  for (const [label, tierTokens] of tierMap) {
    // Sub-group by project
    const projectMap = new Map<string, ArtBlocksToken[]>();
    for (const token of tierTokens) {
      const key = token.project.slug || token.project_name;
      if (!projectMap.has(key)) {
        projectMap.set(key, []);
      }
      projectMap.get(key)!.push(token);
    }

    const projects: ProjectGroup[] = [];
    for (const [, projectTokens] of projectMap) {
      const first = projectTokens[0];
      projects.push({
        projectName: first.project.name,
        artistName: first.project.artist_name,
        curationStatus: first.project.curation_status_display,
        slug: first.project.slug,
        tokens: projectTokens.sort((a, b) => a.invocation - b.invocation),
      });
    }

    // Sort projects: highest floor price first, fall back to lowest edition size
    projects.sort((a, b) => {
      const floorA = a.tokens[0]?.project.lowest_listing ?? 0;
      const floorB = b.tokens[0]?.project.lowest_listing ?? 0;
      if (floorA !== floorB) return floorB - floorA;
      return (
        (a.tokens[0]?.project.max_invocations || 9999) -
        (b.tokens[0]?.project.max_invocations || 9999)
      );
    });

    groups.push({
      label,
      sortOrder: getTierOrder(label),
      projects,
    });
  }

  // Sort tiers
  groups.sort((a, b) => a.sortOrder - b.sortOrder);

  return groups;
}
