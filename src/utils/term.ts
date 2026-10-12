import type { AssetCardBadge } from "@/app/(authenticated)/components/AssetCard/AssetCard";
import type { TermOutput } from "@/types/term";

// Which terms each pictogram (or SignWriting) belongs to, by its uuid. Terms
// already carry both parts, so one term listing answers this for a whole page
// without a request per card.
export function termNamesByPart(
  terms: TermOutput[],
  part: "pictogram" | "signWriting",
): Record<string, string[]> {
  const names: Record<string, string[]> = {};
  for (const term of terms) {
    const uuid = term[part].uuid;
    (names[uuid] ??= []).push(term.description);
  }
  return names;
}

// A part may belong to several terms or to none; the neutral badge marks the
// latter.
export function termBadge(names: string[] | undefined): AssetCardBadge {
  return names && names.length > 0
    ? { text: names.join(", ") }
    : { text: "Sem termo", neutral: true };
}
