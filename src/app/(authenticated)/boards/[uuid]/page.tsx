"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getBoard,
  getBoardPictograms,
  addPictogramToBoard,
} from "@/services/boards";
import { BoardOutput, PictogramOutput } from "@/utils/definitions";
import AddButton from "@/components/AddButton/AddButton";
import Modal from "@/components/Modal/Modal";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import Image from "next/image";
import { useDragReorder } from "@/hooks/useDragReorder";

function BoardDetail() {
  const params = useParams();
  const uuid = String(params.uuid);

  const [board, setBoard] = useState<BoardOutput | null>(null);
  const [items, setItems] = useState<PictogramOutput[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [pictogramUuid, setPictogramUuid] = useState("");
  const [order, setOrder] = useState("");

  const fetchItems = () =>
    getBoardPictograms(uuid).then((data) => setItems(data));

  useEffect(() => {
    Promise.all([getBoard(uuid), getBoardPictograms(uuid)]).then(
      ([boardData, pictogramsData]) => {
        setBoard(boardData);
        setItems(pictogramsData);
      },
    );
  }, [uuid]);

  const handleAdd = async () => {
    if (!pictogramUuid) {
      setFormError("Código de pictograma é obrigatório.");
      return;
    }
    const result = await addPictogramToBoard(uuid, {
      pictogramUuid,
      ...(order ? { order: Number(order) } : {}),
    });
    if (result.success) {
      setIsModalOpen(false);
      setFormError(null);
      setPictogramUuid("");
      setOrder("");
      fetchItems();
    } else {
      setFormError(result.error ?? "Erro ao adicionar pictograma.");
    }
  };

  // Destructuring the handlers from the custom hook
  const {
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDropAtEnd,
    draggedUuid,
  } = useDragReorder({
    boardUuid: uuid,
    pictograms: items,
    onReorderSuccess: fetchItems,
  });

  return (
    <div className="min-h-screen w-full bg-surface-primary">
      <div className="flex items-center justify-between border-b border-outline-common px-lg py-md">
        <div className="flex items-center gap-md text-text-on-primary">
          <p className="text-heading">{board?.title ?? "Carregando..."}</p>
        </div>
        <AddButton onClick={() => setIsModalOpen(true)} />
      </div>
      <div className="flex flex-wrap gap-md p-lg">
        {items.map((item) => (
          <div
            key={item.uuid}
            draggable
            onDragStart={(e) => handleDragStart(e, item.uuid)}
            onDragOver={(e) => handleDragOver(e)}
            onDrop={(e) => {
              if (items.indexOf(item) < items.length - 1) {
                handleDrop(e, item.uuid);
              } else {
                handleDropAtEnd(e);
              }
            }}
            className="flex flex-col items-center gap-xs bg-surface-secondary rounded-sm"
          >
            <Image
              src={item.fileUrl}
              alt={item.description}
              width={80}
              height={80}
              className="object-contain rounded"
            />
            <p className="text-text-on-primary text-body font-bold text-center  ">
              {item.description}
            </p>
          </div>
        ))}
        {items.length === 0 && board !== null && (
          <p className="text-text-on-primary-variant text-body">
            Nenhum pictograma nesta prancha.
          </p>
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Adicionar Pictograma"
      >
        <div className="flex flex-col gap-sm">
          <Input
            id="pictogramUuid"
            label="UUID do Pictograma"
            type="text"
            placeholder="ex: 550e8400-e29b-41d4-a716-446655440000"
            value={pictogramUuid}
            onChange={(e) => setPictogramUuid(e.target.value)}
          />
          <Input
            id="order"
            label="Ordem (opcional)"
            type="number"
            placeholder="ex: 1"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          />
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <Button type="button" onClick={handleAdd}>
            Adicionar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default BoardDetail;
