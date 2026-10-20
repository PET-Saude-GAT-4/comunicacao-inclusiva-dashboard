"use client";

import Image from "next/image";
import AddButton from "@/components/AddButton/AddButton";
import InfiniteList from "@/components/InfiniteList/InfiniteList";
import Input from "@/components/Input/Input";
import { useRemoteSearch } from "@/hooks/useRemoteSearch";
import { getBoardPage } from "@/services/boards";
import { BoardOutput } from "@/types/board";

interface BoardPickerProps {
  onSelect: (board: BoardOutput) => void;
  // Why a board cannot be picked here, or null when it can. Such boards are
  // listed greyed out with the reason rather than filtered out of the page, so
  // every page keeps its size and loading the next one stays correct.
  unavailableReason?: (board: BoardOutput) => string | null;
}

export default function BoardPicker({
  onSelect,
  unavailableReason = () => null,
}: BoardPickerProps) {
  const list = useRemoteSearch("boards", getBoardPage);

  return (
    <div className="flex flex-col w-full gap-md">
      <p className="text-text-on-primary">Pranchas Disponíveis:</p>
      <Input
        id="board-filter"
        placeholder="Filtrar por título"
        value={list.search}
        onChange={(e) => list.setSearch(e.target.value)}
      />
      <InfiniteList list={list}>
        {list.items.map((board) => {
          const reason = unavailableReason(board);

          return (
            <li
              key={board.uuid}
              className={`flex flex-row items-center gap-md border border-outline-common rounded-md p-sm justify-between ${
                reason ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              onClick={() => {
                if (!reason) onSelect(board);
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
              {reason ? (
                <span className="text-sm text-text-on-primary-variant text-right">
                  {reason}
                </span>
              ) : (
                <span onClick={(e) => e.stopPropagation()}>
                  <AddButton
                    label={`Adicionar prancha ${board.title}`}
                    onClick={() => onSelect(board)}
                  />
                </span>
              )}
            </li>
          );
        })}
      </InfiniteList>
    </div>
  );
}
