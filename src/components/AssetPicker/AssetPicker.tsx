"use client";

import { useState } from "react";
import Image from "next/image";
import AddButton from "@/components/AddButton/AddButton";
import Input from "@/components/Input/Input";

// Pictograms and SignWritings are both stored files carrying a description, so
// one picker serves both.
export type Asset = {
  uuid: string;
  description: string;
  fileUrl: string;
};

interface AssetPickerProps {
  items: Asset[];
  onSelect: (asset: Asset) => void;
  label?: string;
  id?: string;
}

export default function AssetPicker({
  items,
  onSelect,
  label = "Pictogramas Disponíveis:",
  id = "asset-filter",
}: AssetPickerProps) {
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? items.filter((item) =>
        item.description.toLowerCase().includes(filter.toLowerCase()),
      )
    : items;

  return (
    <div className="flex flex-col w-full gap-md">
      <p className="text-text-on-primary">{label}</p>
      <Input
        id={id}
        placeholder="Filtrar por descrição"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="flex flex-col h-96 overflow-y-auto gap-md">
        <ul className="flex flex-col gap-md">
          {filtered.map((asset) => (
            <div
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
              <AddButton onClick={() => onSelect(asset)} />
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}
