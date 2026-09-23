"use client";

import { useState } from "react";
import Image from "next/image";
import AddButton from "@/components/AddButton/AddButton";
import Input from "@/components/Input/Input";
import { BoardOutput } from "@/types/board";

interface BoardPickerProps {
  boards: BoardOutput[];
  onSelect: (board: BoardOutput) => void;
  // The API refuses an unpublished board as the destination of an interaction.
  // Set this where that rule applies, so the board is shown greyed out with the
  // reason instead of being offered only to fail on submit.
  requirePublished?: boolean;
}

export default function BoardPicker({
  boards,
  onSelect,
  requirePublished = false,
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
          {filtered.map((board) => {
            const blocked = requirePublished && board.publishedAt === null;

            return (
              <li
                key={board.uuid}
                className={`flex flex-row items-center gap-md border border-outline-common rounded-md p-sm justify-between ${
                  blocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={() => {
                  if (!blocked) onSelect(board);
                }}
              >
                <Image
                  src={board.representativePictogram.fileUrl}
                  alt=""
                  width={50}
                  height={50}
                  className="object-contain rounded"
                />
                <p className="text-text-on-primary">{board.title}</p>
                {blocked ? (
                  <span className="text-sm text-text-on-primary-variant text-right">
                    Não publicada
                  </span>
                ) : (
                  <AddButton onClick={() => onSelect(board)} />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
