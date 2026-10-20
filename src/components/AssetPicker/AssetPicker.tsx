"use client";

import Image from "next/image";
import AddButton from "@/components/AddButton/AddButton";
import InfiniteList from "@/components/InfiniteList/InfiniteList";
import Input from "@/components/Input/Input";
import { useRemoteSearch } from "@/hooks/useRemoteSearch";
import { ListQuery, Paginated } from "@/types/common";

// Pictograms and SignWritings are both stored files carrying a description, so
// one picker serves both.
export type Asset = {
  uuid: string;
  description: string;
  fileUrl: string;
};

interface AssetPickerProps<K extends string> {
  // The key the endpoint lists its items under, e.g. "pictograms".
  listKey: K;
  fetchPage: (query: ListQuery) => Promise<Paginated<K, Asset>>;
  onSelect: (asset: Asset) => void;
  label?: string;
  // Names one item in its add button, e.g. "Adicionar pictograma Cachorro".
  itemNoun?: string;
  id?: string;
}

export default function AssetPicker<K extends string>({
  listKey,
  fetchPage,
  onSelect,
  label = "Pictogramas Disponíveis:",
  itemNoun = "pictograma",
  id = "asset-filter",
}: AssetPickerProps<K>) {
  const list = useRemoteSearch(listKey, fetchPage);

  return (
    <div className="flex flex-col w-full gap-md">
      <p className="text-text-on-primary">{label}</p>
      <Input
        id={id}
        placeholder="Filtrar por descrição"
        value={list.search}
        onChange={(e) => list.setSearch(e.target.value)}
      />
      <InfiniteList list={list}>
        {list.items.map((asset) => (
          <li
            key={asset.uuid}
            className="flex flex-row items-center gap-md border border-outline-common rounded-md p-sm justify-between cursor-pointer"
            onClick={() => onSelect(asset)}
          >
            <Image
              src={asset.fileUrl}
              alt=""
              width={50}
              height={50}
              className="object-contain rounded"
            />
            <p className="text-text-on-primary">{asset.description}</p>
            <span onClick={(e) => e.stopPropagation()}>
              <AddButton
                label={`Adicionar ${itemNoun} ${asset.description}`}
                onClick={() => onSelect(asset)}
              />
            </span>
          </li>
        ))}
      </InfiniteList>
    </div>
  );
}
