"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPublicPhrase } from "@/services/phrases";
import { PhraseOutput } from "@/types/phrase";
import PhraseVisibilityBadge from "@/components/PhraseVisibilityBadge/PhraseVisibilityBadge";
import PhraseSequenceEditor, {
  entryFromPlacement,
} from "@/components/PhraseSequenceEditor/PhraseSequenceEditor";
import { phraseVisibility } from "@/utils/phrase-visibility";

// The phrase screen from Frases, without what edits the phrase: no
// visibility change, description or term editing, saving or interactions.
function ReadonlyPhraseDetail() {
  const params = useParams();
  const uuid = String(params.uuid);

  const [phrase, setPhrase] = useState<PhraseOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // A published phrase kept out of the library is not found here either,
    // as it is not in the library's list.
    getPublicPhrase(uuid)
      .then((data) => setPhrase(data?.listedInLibrary ? data : null))
      .catch(() => setPhrase(null))
      .finally(() => setLoading(false));
  }, [uuid]);

  if (phrase === null) {
    return (
      <div className="w-full bg-surface-secondary">
        <div className="flex items-center justify-between border-b border-outline-common px-lg py-md">
          <p className="text-heading text-text-on-primary">
            {loading ? "Carregando..." : "Frase não encontrada"}
          </p>
        </div>
      </div>
    );
  }

  const items = [...phrase.terms]
    .sort((a, b) => a.order - b.order)
    .map(entryFromPlacement);

  return (
    <div className="flex w-full flex-col gap-lg">
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-lg py-md">
        <div className="flex items-center gap-md text-text-on-primary">
          <p className="text-heading">{phrase.description}</p>
          <PhraseVisibilityBadge visibility={phraseVisibility(phrase)} />
        </div>
      </div>

      <div className="flex flex-col gap-lg rounded-lg border border-gray-200 bg-white p-lg">
        <PhraseSequenceEditor items={items} />
      </div>
    </div>
  );
}

export default ReadonlyPhraseDetail;
