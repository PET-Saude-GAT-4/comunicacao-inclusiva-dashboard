"use client";

import AddButton from "@/components/AddButton/AddButton";
import InfiniteList from "@/components/InfiniteList/InfiniteList";
import Input from "@/components/Input/Input";
import PhraseVisibilityBadge from "@/components/PhraseVisibilityBadge/PhraseVisibilityBadge";
import { useRemoteSearch } from "@/hooks/useRemoteSearch";
import { getPhrasePage } from "@/services/phrases";
import { PhraseOutput } from "@/types/phrase";
import { phraseVisibility } from "@/utils/phrase-visibility";

interface PhrasePickerProps {
  onSelect: (phrase: PhraseOutput) => void;
}

// A phrase is a sequence of many terms, so there is no single pictogram that
// represents it the way BoardPicker shows one per board. The description is the
// whole identity here, and the badge says whether the interaction will do
// anything yet: a phrase in draft can carry interactions, but reaches no device
// until it is published.
export default function PhrasePicker({ onSelect }: PhrasePickerProps) {
  const list = useRemoteSearch("phrases", getPhrasePage);

  return (
    <div className="flex flex-col w-full gap-md">
      <p className="text-text-on-primary">Frases:</p>
      <Input
        id="phrase-filter"
        placeholder="Filtrar por descrição"
        value={list.search}
        onChange={(e) => list.setSearch(e.target.value)}
      />
      <InfiniteList list={list}>
        {list.items.map((phrase) => (
          <li
            key={phrase.uuid}
            className="flex flex-row items-center gap-md border border-outline-common rounded-md p-sm justify-between cursor-pointer"
            onClick={() => onSelect(phrase)}
          >
            <p className="text-text-on-primary">{phrase.description}</p>
            <div className="flex flex-row items-center gap-sm">
              <PhraseVisibilityBadge visibility={phraseVisibility(phrase)} />
              <span onClick={(e) => e.stopPropagation()}>
                <AddButton
                  label={`Adicionar frase ${phrase.description}`}
                  onClick={() => onSelect(phrase)}
                />
              </span>
            </div>
          </li>
        ))}
      </InfiniteList>
    </div>
  );
}
