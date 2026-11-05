"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getPublicPhrase } from "@/services/phrases";
import { PhraseOutput } from "@/types/phrase";

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

  return (
    <div className="w-full bg-surface-secondary">
      <div className="flex items-center justify-between border-b border-outline-common px-lg py-md">
        <p className="text-heading text-text-on-primary">
          {phrase.description}
        </p>
      </div>
      <ol className="flex flex-wrap gap-md p-lg">
        {[...phrase.terms]
          .sort((a, b) => a.order - b.order)
          .map((term) => (
            <li
              key={term.uuid}
              className="flex flex-col items-center gap-xs bg-surface-secondary rounded-sm p-xs"
            >
              <div className="flex items-center gap-xs">
                <Image
                  src={term.pictogram.fileUrl}
                  alt=""
                  width={80}
                  height={80}
                  className="object-contain rounded"
                />
                <Image
                  src={term.signWriting.fileUrl}
                  alt=""
                  width={80}
                  height={80}
                  className="object-contain rounded"
                />
              </div>
              <p className="text-text-on-primary text-body font-bold text-center">
                {term.description}
              </p>
            </li>
          ))}
        {phrase.terms.length === 0 && (
          <p className="text-text-on-primary-variant text-body">
            Nenhum termo nesta frase.
          </p>
        )}
      </ol>
    </div>
  );
}

export default ReadonlyPhraseDetail;
