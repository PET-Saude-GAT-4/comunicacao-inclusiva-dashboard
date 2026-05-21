import { reorderPictogram } from "@/services/boards";
import { useState } from "react";
import { DragEvent } from "react";

interface UseDragReorderProps {
  boardUuid: string;
  pictograms: { uuid: string }[];
  onReorderSuccess?: () => void;
}

export function useDragReorder({
  boardUuid,
  pictograms,
  onReorderSuccess,
}: UseDragReorderProps) {
  const [draggedUuid, setDraggedId] = useState<string | null>("");

  const handleDragStart = (e: DragEvent, uuid: string) => {
    setDraggedId(uuid);
    console.log(`started dragging item: ${uuid}`);
    //datatransfer "Started`started dragging item: ${uuid}`sed to hoard data from the components being dragged
    e.dataTransfer.setData("text/plain", uuid);
    //Sets visual effect for the motion
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent) => {
    //Cancels browser events
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    console.log(`dragging item`);
  };

  const handleDrop = async (e: DragEvent, targetUuid: string) => {
    e.preventDefault();
    const draggedObjectId = draggedUuid ?? e.dataTransfer.getData("text/plain");

    if (!draggedObjectId || draggedObjectId === targetUuid) {
      return;
    }

    //tracking indexes
    const objectIndex = pictograms.findIndex((p) => p.uuid === draggedObjectId);
    const targetIndex = pictograms.findIndex((p) => p.uuid === targetUuid);

    console.log(
      `dragging object ${draggedObjectId} with array position ${objectIndex}`,
    );

    if (objectIndex === -1 || targetIndex === -1) return;

    let nextUuid: string | null = null;
    //if dragging from top to bottom
    if (objectIndex < targetIndex) {
      const newOrder = [...pictograms];
      const [removed] = newOrder.splice(objectIndex, 1);
      const insertAt = targetIndex - 1;

      newOrder.splice(insertAt, 0, removed);

      const newObjectIndex = newOrder.findIndex(
        (p) => p.uuid === draggedObjectId,
      );

      console.log(`${objectIndex} dragged to ${insertAt} position`);
      nextUuid = newOrder[newObjectIndex + 1]?.uuid ?? null;
    } else {
      //otherwise it would be dragged from bottom to top

      const newOrder = [...pictograms];
      const [removed] = newOrder.splice(objectIndex, 1);
      const insertAt = targetIndex;
      newOrder.splice(insertAt, 0, removed);

      const newObjectIndex = newOrder.findIndex(
        (p) => p.uuid === draggedObjectId,
      );

      console.log(`${objectIndex} dragged to ${insertAt} position`);
      nextUuid = newOrder[newObjectIndex + 1].uuid ?? null;
    }

    const operationResult = await reorderPictogram(boardUuid, draggedObjectId, {
      next: nextUuid,
    });

    if (operationResult.success) {
      onReorderSuccess?.();
    } else {
      console.error(operationResult.error);
    }
    setDraggedId(null);
  };

  const handleDropAtEnd = async (e: DragEvent) => {
    e.preventDefault();
    const draggedObjectId = draggedUuid ?? e.dataTransfer.getData("text/plain");

    if (!draggedObjectId) return;
    
    console.log(`${draggedObjectId} gettingt dragged to the end`);
    const operationResult = await reorderPictogram(boardUuid, draggedObjectId, {
      next: null,
    });

    if (operationResult.success) {
      onReorderSuccess?.();
    } else {
      console.error(operationResult.error)
    }

    setDraggedId(null);
  };

  return {
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDropAtEnd,
    draggedUuid,
  };
}
