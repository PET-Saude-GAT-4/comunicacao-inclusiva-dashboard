"use client";

import { useState } from "react";
import Image from "next/image";
import AddButton from "@/components/AddButton/AddButton";
import Input from "@/components/Input/Input";
import { BoardOutput } from "@/types/board";

interface BoardPickerProps {
  boards: BoardOutput[];
  onSelect: (board: BoardOutput) => void;
}

export default function BoardPicker({
  boards,
  onSelect,
}: BoardPickerProps) {
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? boards.filter((p) => p.title.toLowerCase().includes(filter.toLowerCase()))
    : boards;

  return (
    <div className="flex flex-col w-full gap-md">
      <p className="text-text-on-primary">Pranchas Disponíveis:</p>
      <Input
        id="board-filter"
        placeholder="Filtrar por título"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="flex flex-col h-96 overflow-y-auto gap-md">
        <ul className="flex flex-col gap-md">
          {filtered.map((board) => (
            <div
              key={board.uuid}
              className="flex flex-row items-center gap-md border border-outline-common rounded-md p-sm justify-between cursor-pointer"
              onClick={() =>
                onSelect({
                  uuid: board.uuid,
                  title: board.title,
                  authorUuid: board.authorUuid,
                  representativePictogram: board.representativePictogram,
                  publishedAt: board.publishedAt,
                  createdAt: board.createdAt,
                  updatedAt: board.updatedAt,
                })
              }
            >
              <Image
                src={board.representativePictogram.fileUrl}
                alt=""
                width={50}
                height={50}
                className="object-contain rounded"
              />
              <p className="text-text-on-primary">{board.title}</p>
              <AddButton
                onClick={() =>
                  onSelect({
                    uuid: board.uuid,
                    title: board.title,
                    authorUuid: board.authorUuid,
                    representativePictogram: board.representativePictogram,
                    publishedAt: board.publishedAt,
                    createdAt: board.createdAt,
                    updatedAt: board.updatedAt,
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
