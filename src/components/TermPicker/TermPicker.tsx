"use client";

import { useState } from "react";
import Image from "next/image";
import AddButton from "@/components/AddButton/AddButton";
import Input from "@/components/Input/Input";
import { TermOutput } from "@/types/term";

interface TermPickerProps {
  terms: TermOutput[];
  onSelect: (term: TermOutput) => void;
}

export default function TermPicker({ terms, onSelect }: TermPickerProps) {
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? terms.filter((t) =>
        t.description.toLowerCase().includes(filter.toLowerCase()),
      )
    : terms;

  return (
    <div className="flex flex-col w-full gap-md">
      <p className="text-text-on-primary">Termos Disponíveis:</p>
      <Input
        id="term-filter"
        placeholder="Filtrar por descrição"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="flex flex-col h-96 overflow-y-auto gap-md">
        <ul className="flex flex-col gap-md">
          {filtered.map((term) => (
            <div
              key={term.uuid}
              className="flex flex-row items-center gap-md border border-outline-common rounded-md p-sm justify-between cursor-pointer"
              onClick={() => onSelect(term)}
            >
              <div className="flex flex-row items-center gap-sm">
                <Image
                  src={term.pictogram.fileUrl}
                  alt=""
                  width={50}
                  height={50}
                  className="object-contain rounded"
                />
                <Image
                  src={term.signWriting.fileUrl}
                  alt=""
                  width={50}
                  height={50}
                  className="object-contain rounded"
                />
              </div>
              <p className="text-text-on-primary">{term.description}</p>
              <AddButton onClick={() => onSelect(term)} />
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}
