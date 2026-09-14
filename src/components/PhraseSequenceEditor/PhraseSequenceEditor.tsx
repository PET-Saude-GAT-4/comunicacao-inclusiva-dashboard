"use client";

import { DragEvent, useState } from "react";
import Image from "next/image";
import { PictogramOutput } from "@/types/pictogram";
import { SignWritingOutput } from "@/types/sign-writing";
import { TermOutput, TermPlacementOutput } from "@/types/term";

// A term cannot identify an entry: the same term may legitimately appear more
// than once in a phrase, and a draft entry has no placement uuid yet because it
// does not exist server-side. So each entry carries a key minted on insertion.
//
// Only what the editor renders is kept, so an entry can be built either from a
// term picked in the TermPicker or from a placement on a loaded phrase.
export type SequenceEntry = {
  key: string;
  termUuid: string;
  description: string;
  pictogram: PictogramOutput;
  signWriting: SignWritingOutput;
};

export function entryFromTerm(term: TermOutput): SequenceEntry {
  return {
    key: crypto.randomUUID(),
    termUuid: term.uuid,
    description: term.description,
    pictogram: term.pictogram,
    signWriting: term.signWriting,
  };
}

export function entryFromPlacement(
  placement: TermPlacementOutput,
): SequenceEntry {
  return {
    key: crypto.randomUUID(),
    termUuid: placement.termUuid,
    description: placement.description,
    pictogram: placement.pictogram,
    signWriting: placement.signWriting,
  };
}

interface PhraseSequenceEditorProps {
  items: SequenceEntry[];
  onChange: (items: SequenceEntry[]) => void;
}

export default function PhraseSequenceEditor({
  items,
  onChange,
}: PhraseSequenceEditorProps) {
  const [draggedKey, setDraggedKey] = useState<string | null>(null);

  const move = (key: string, targetIndex: number) => {
    const from = items.findIndex((i) => i.key === key);
    if (from === -1) return;

    const without = items.filter((i) => i.key !== key);
    // Removing the dragged entry shifts everything after it back by one.
    const to = targetIndex > from ? targetIndex - 1 : targetIndex;

    onChange([...without.slice(0, to), items[from], ...without.slice(to)]);
    setDraggedKey(null);
  };

  const handleDragStart = (e: DragEvent, key: string) => {
    setDraggedKey(key);
    e.dataTransfer.setData("text/plain", key);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: DragEvent, targetIndex: number) => {
    e.preventDefault();
    const dragged = draggedKey || e.dataTransfer.getData("text/plain");
    if (!dragged) return;
    move(dragged, targetIndex);
  };

  const handleRemove = (key: string) => {
    onChange(items.filter((i) => i.key !== key));
  };

  return (
    <div className="flex flex-col w-full gap-md">
      <p className="text-text-on-primary">Sequência da Frase:</p>
      <div
        className="flex flex-wrap items-start gap-md border border-outline-common rounded-md p-md min-h-40"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, items.length)}
      >
        {items.map((item, index) => (
          <div
            key={item.key}
            draggable
            onDragStart={(e) => handleDragStart(e, item.key)}
            onDragOver={handleDragOver}
            onDrop={(e) => {
              e.stopPropagation();
              handleDrop(e, index);
            }}
            className={`group relative flex flex-col items-center gap-xs bg-surface-secondary rounded-sm p-xs cursor-move${
              draggedKey === item.key ? " opacity-50" : ""
            }`}
          >
            <button
              type="button"
              aria-label={`Remover ${item.description}`}
              onClick={() => handleRemove(item.key)}
              className="absolute top-0 right-0 hidden group-hover:block px-xs text-text-on-primary-variant hover:text-text-on-primary hover:cursor-pointer"
            >
              ×
            </button>
            <div className="flex items-center gap-xs">
              <Image
                src={item.pictogram.fileUrl}
                alt=""
                draggable={false}
                width={80}
                height={80}
                className="object-contain rounded"
              />
              <Image
                src={item.signWriting.fileUrl}
                alt=""
                draggable={false}
                width={80}
                height={80}
                className="object-contain rounded"
              />
            </div>
            <p className="text-text-on-primary text-body font-bold text-center">
              {item.description}
            </p>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-text-on-primary-variant text-body">
            Nenhum termo na frase. Escolha um termo na lista ao lado.
          </p>
        )}
      </div>
    </div>
  );
}
