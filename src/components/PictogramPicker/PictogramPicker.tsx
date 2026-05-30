"use client";

import { useState } from "react";
import Image from "next/image";
import AddButton from "@/components/AddButton/AddButton";
import Input from "@/components/Input/Input";
import { PictogramOutput } from "@/utils/definitions";

export type PictogramInput = {
  uuid: string;
  imageUrl: string;
  description: string;
};

interface PictogramPickerProps {
  pictograms: PictogramOutput[];
  onSelect: (pictogram: PictogramInput) => void;
}

export default function PictogramPicker({
  pictograms,
  onSelect,
}: PictogramPickerProps) {
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? pictograms.filter((p) =>
        p.description.toLowerCase().includes(filter.toLowerCase()),
      )
    : pictograms;

  return (
    <div className="flex flex-col w-full gap-md">
      <p className="text-text-on-primary">Pictogramas Disponíveis:</p>
      <Input
        id="pictogram-filter"
        placeholder="Filtrar por descrição"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="flex flex-col h-96 overflow-y-auto gap-md">
        <ul className="flex flex-col gap-md">
          {filtered.map((pictogram) => (
            <div
              key={pictogram.uuid}
              className="flex flex-row items-center gap-md border border-outline-common rounded-md p-sm justify-between cursor-pointer"
              onClick={() =>
                onSelect({
                  uuid: pictogram.uuid,
                  description: pictogram.description,
                  imageUrl: pictogram.fileUrl,
                })
              }
            >
              <Image
                src={pictogram.fileUrl}
                alt=""
                width={50}
                height={50}
                className="object-contain rounded"
              />
              <p className="text-text-on-primary">{pictogram.description}</p>
              <AddButton
                onClick={() =>
                  onSelect({
                    uuid: pictogram.uuid,
                    imageUrl: pictogram.fileUrl,
                    description: pictogram.description,
                  })
                }
              />
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}
