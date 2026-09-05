import { reorderBoardTerm } from "@/services/boards";
import { useState } from "react";
import { DragEvent } from "react";

interface UseDragReorderProps {
  boardUuid: string;
  onReorderSuccess?: () => void;
}

export function useDragReorder({
  boardUuid,
  onReorderSuccess,
}: UseDragReorderProps) {
  const [draggedUuid, setDraggedUuid] = useState<string | null>(null);

  const move = async (boardTermUuid: string, next: string | null) => {
    const result = await reorderBoardTerm(boardUuid, boardTermUuid, { next });

    if (result.success) {
      onReorderSuccess?.();
    } else {
      console.error(result.error);
    }

    setDraggedUuid(null);
  };

  const handleDragStart = (e: DragEvent, boardTermUuid: string) => {
    setDraggedUuid(boardTermUuid);
    e.dataTransfer.setData("text/plain", boardTermUuid);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: DragEvent, targetUuid: string) => {
    e.preventDefault();
    const dragged = draggedUuid || e.dataTransfer.getData("text/plain");

    if (!dragged || dragged === targetUuid) return;

    await move(dragged, targetUuid);
  };

  const handleDropAtEnd = async (e: DragEvent) => {
    e.preventDefault();
    const dragged = draggedUuid || e.dataTransfer.getData("text/plain");

    if (!dragged) return;

    await move(dragged, null);
  };

  return {
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDropAtEnd,
    draggedUuid,
  };
}
