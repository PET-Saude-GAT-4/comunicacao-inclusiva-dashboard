"use client";

import { useState } from "react";
import AddButton from "@/components/AddButton/AddButton";
import Input from "@/components/Input/Input";
import PhraseVisibilityBadge from "@/components/PhraseVisibilityBadge/PhraseVisibilityBadge";
import { PhraseOutput } from "@/types/phrase";
import { phraseVisibility } from "@/utils/phrase-visibility";

interface PhrasePickerProps {
  phrases: PhraseOutput[];
  onSelect: (phrase: PhraseOutput) => void;
}

// A phrase is a sequence of many terms, so there is no single pictogram that
// represents it the way BoardPicker shows one per board. The description is the
// whole identity here, and the badge says whether the interaction will do
// anything yet: a phrase in draft can carry interactions, but reaches no device
// until it is published.
export default function PhrasePicker({ phrases, onSelect }: PhrasePickerProps) {
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? phrases.filter((p) =>
        p.description.toLowerCase().includes(filter.toLowerCase()),
      )
    : phrases;

  return (
    <div className="flex flex-col w-full gap-md">
      <p className="text-text-on-primary">Frases:</p>
      <Input
        id="phrase-filter"
        placeholder="Filtrar por descrição"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="flex flex-col h-96 overflow-y-auto gap-md">
        <ul className="flex flex-col gap-md">
          {filtered.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhuma frase encontrada.</p>
          ) : (
            filtered.map((phrase) => (
              <li
                key={phrase.uuid}
                className="flex flex-row items-center gap-md border border-outline-common rounded-md p-sm justify-between cursor-pointer"
                onClick={() => onSelect(phrase)}
              >
                <p className="text-text-on-primary">{phrase.description}</p>
                <div className="flex flex-row items-center gap-sm">
                  <PhraseVisibilityBadge
                    visibility={phraseVisibility(phrase)}
                  />
                  <span onClick={(e) => e.stopPropagation()}>
                    <AddButton onClick={() => onSelect(phrase)} />
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
