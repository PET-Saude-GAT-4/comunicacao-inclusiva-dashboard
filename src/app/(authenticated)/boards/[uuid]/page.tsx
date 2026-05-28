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
import { getPictograms } from "@/services/pictograms";

type PictogramInput = {
  uuid: string;
  imageUrl: string;
  description: string;
};

function BoardDetail() {
  const params = useParams();
  const uuid = String(params.uuid);

  const [board, setBoard] = useState<BoardOutput | null>(null);
  const [items, setItems] = useState<PictogramOutput[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [selectedPictogram, setSelectedPictogram] = useState<PictogramInput>();

  const [pictograms, setPictograms] = useState<PictogramOutput[]>([]);
  const [order, setOrder] = useState("");

  const clearForm = () => {
    setFormError("");
    setSelectedPictogram(undefined);
  };
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
    if (!selectedPictogram?.uuid) {
      setFormError("Selecionar pictograma é obrigatório.");
      return;
    }
    const result = await addPictogramToBoard(uuid, {
      pictogramUuid: selectedPictogram.uuid,
      ...(order ? { order: Number(order) } : {}),
    });
    if (result.success) {
      setIsModalOpen(false);
      clearForm();
      fetchItems();
    } else {
      setFormError(result.error ?? "Erro ao adicionar pictograma.");
    }
  };

  const listPictograms = async () => {
    getPictograms().then((items) => setPictograms(items));
    setIsModalOpen(true);
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
        <AddButton
          onClick={() => {
            setIsModalOpen(true);
            listPictograms();
          }}
        />
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
        onClose={() => {
          setIsModalOpen(false);
          clearForm();
        }}
        title="Adicionar Pictograma"
      >
        {formError && <p className="text-sm text-red-500">{formError}</p>}
        <div className="flex flex-row gap-sm w-200 m-xl mb-xs">
          <div
            id="pictograms"
            className="flex flex-col w-full h-96 overflow-y-auto gap-md"
          >
            <p className="text-text-on-primary sticky top-0 bg-surface-primary pt-0 pb-2 z-10">
              Pictogramas Disponíveis:{" "}
            </p>
            <ul className="flex flex-col gap-md top-10">
              {pictograms.map((pictogram) => (
                <div
                  key={pictogram.uuid}
                  className="flex flex-row items-center gap-md border border-outline-common rounded-md p-sm justify-between cursor-pointer"
                  onClick={() => {}}
                >
                  <Image
                    src={pictogram.fileUrl}
                    alt=""
                    width={50}
                    height={50}
                    className="object-contain rounded"
                  />
                  <p className="text-text-on-primary">
                    {pictogram.description}
                  </p>
                  <AddButton
                    onClick={() => {
                      setSelectedPictogram({
                        uuid: pictogram.uuid,
                        imageUrl: pictogram.fileUrl,
                        description: pictogram.description,
                      });
                    }}
                  />
                </div>
              ))}
            </ul>
          </div>
          <div className="flex flex-col w-full gap-md ">
            <Input
              id="pictogramUuid"
              label="Código do Pictograma"
              type="text"
              disabled
              placeholder="ex: 550e8400-e29b-41d4-a716-446655440000"
              value={selectedPictogram?.uuid || ""}
            />
            <div className="flex w-full justify-center">
              {selectedPictogram ? (
                <div className="flex flex-col items-center gap-md">
                  <Image
                    src={selectedPictogram?.imageUrl}
                    alt=""
                    width="200"
                    height="200"
                    className="border border-outline-common object-contain rounded-md"
                  />
                  <p className="text-text-on-primary text-center font-bold text-md">
                    {selectedPictogram.description}
                  </p>
                </div>
              ) : (
                <div className="border border-outline-common flex items-center rounded-md w-50 h-50">
                  <p className="text-text-on-primary text-center font-bold text-md">
                    Nenhum pictograma selecionado.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-md">
          <Button type="button" onClick={handleAdd}>
            Adicionar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default BoardDetail;
