import type { AssetCardBadge } from "@/app/(authenticated)/components/AssetCard/AssetCard";

// Names past this many are counted instead of listed, so a part used by many
// terms keeps its badge to one line.
const SHOWN_TERM_NAMES = 2;

// A part may belong to several terms or to none; the neutral badge marks the
// latter.
export function termBadge(terms: { description: string }[]): AssetCardBadge {
  if (terms.length === 0) return { text: "Sem termo", neutral: true };

  const names = terms.map((term) => term.description);
  const hidden = names.length - SHOWN_TERM_NAMES;
  if (hidden <= 0) return { text: names.join(", ") };

  return {
    text: `${names.slice(0, SHOWN_TERM_NAMES).join(", ")} +${hidden}`,
    fullText: names.join(", "),
  };
}
