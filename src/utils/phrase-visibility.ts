// The API keeps two independent fields: `publishedAt` decides whether a phrase
// reaches devices at all, `listedInLibrary` whether it is browsable there. Four
// combinations exist and one of them says nothing — an unpublished phrase
// reaches no device, so its listing flag has no effect. The dashboard speaks in
// the three that do.
export type PhraseVisibility = "draft" | "hidden" | "listed";

// Least to most visible. The order is load-bearing: it decides which requests a
// change sends first, and which changes are announced as a loss of reach.
export const PHRASE_VISIBILITY_ORDER: PhraseVisibility[] = [
  "draft",
  "hidden",
  "listed",
];

export const PHRASE_VISIBILITIES: Record<
  PhraseVisibility,
  { label: string; description: string }
> = {
  draft: {
    label: "Rascunho",
    description: "Existe apenas aqui. Não é enviada para os aplicativos.",
  },
  hidden: {
    label: "Oculta",
    description:
      "É enviada para os aplicativos com suas interações, mas não aparece na biblioteca.",
  },
  listed: {
    label: "Na biblioteca",
    description:
      "É enviada para os aplicativos e aparece na biblioteca, onde pode ser buscada e salva.",
  },
};

export function phraseVisibility(phrase: {
  publishedAt: string | null;
  listedInLibrary: boolean;
}): PhraseVisibility {
  if (phrase.publishedAt === null) return "draft";
  return phrase.listedInLibrary ? "listed" : "hidden";
}

export function phraseVisibilityFields(visibility: PhraseVisibility): {
  published: boolean;
  listed: boolean;
} {
  return {
    published: visibility !== "draft",
    listed: visibility === "listed",
  };
}

export function reducesPhraseVisibility(
  from: PhraseVisibility,
  to: PhraseVisibility,
): boolean {
  return (
    PHRASE_VISIBILITY_ORDER.indexOf(to) < PHRASE_VISIBILITY_ORDER.indexOf(from)
  );
}
