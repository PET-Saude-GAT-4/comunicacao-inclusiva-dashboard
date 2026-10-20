"use client";

import Image from "next/image";
import AddButton from "@/components/AddButton/AddButton";
import InfiniteList from "@/components/InfiniteList/InfiniteList";
import Input from "@/components/Input/Input";
import { useRemoteSearch } from "@/hooks/useRemoteSearch";
import { getTermPage } from "@/services/terms";
import { TermOutput } from "@/types/term";

interface TermPickerProps {
  onSelect: (term: TermOutput) => void;
}

export default function TermPicker({ onSelect }: TermPickerProps) {
  const list = useRemoteSearch("terms", getTermPage);

  return (
    <div className="flex flex-col w-full gap-md">
      <p className="text-text-on-primary">Termos Disponíveis:</p>
      <Input
        id="term-filter"
        placeholder="Filtrar por descrição"
        value={list.search}
        onChange={(e) => list.setSearch(e.target.value)}
      />
      <InfiniteList list={list}>
        {list.items.map((term) => (
          <li
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
            <span onClick={(e) => e.stopPropagation()}>
              <AddButton
                label={`Adicionar termo ${term.description}`}
                onClick={() => onSelect(term)}
              />
            </span>
          </li>
        ))}
      </InfiniteList>
    </div>
  );
}
