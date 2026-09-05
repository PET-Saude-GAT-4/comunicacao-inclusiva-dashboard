"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getBoard,
  getBoardTerms,
  addTermToBoard,
  removeTermFromBoard,
  publishBoard,
  unpublishBoard,
} from "@/services/boards";
import { BoardOutput } from "@/types/board";
import { BoardTermOutput, TermOutput } from "@/types/term";
import AddButton from "@/components/AddButton/AddButton";
import Modal from "@/components/Modal/Modal";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import Image from "next/image";
import { useDragReorder } from "@/hooks/useDragReorder";
import { getTerms } from "@/services/terms";
import TermPicker from "@/components/TermPicker/TermPicker";

function BoardDetail() {
  const params = useParams();
  const uuid = String(params.uuid);

  const [board, setBoard] = useState<BoardOutput | null>(null);
  const [items, setItems] = useState<BoardTermOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const [publishLoading, setPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [selectedTerm, setSelectedTerm] = useState<TermOutput>();

  const [terms, setTerms] = useState<TermOutput[]>([]);

  const clearForm = () => {
    setFormError("");
    setSelectedTerm(undefined);
  };
  const fetchItems = () => getBoardTerms(uuid).then((data) => setItems(data));

  const refresh = useCallback(
    () =>
      Promise.all([getBoard(uuid), getBoardTerms(uuid)]).then(
        ([boardData, termsData]) => {
          setBoard(boardData);
          setItems(termsData);
        },
      ),
    [uuid],
  );

  useEffect(() => {
    refresh()
      .catch(() => setBoard(null))
      .finally(() => setLoading(false));
  }, [refresh]);

  const handleTogglePublish = async () => {
    if (!board) return;
    setPublishLoading(true);
    setPublishError(null);
    const result =
      board.publishedAt === null
        ? await publishBoard(uuid)
        : await unpublishBoard(uuid);
    if (result.success) {
      await refresh();
      setIsConfirmOpen(false);
    } else {
      setPublishError(result.error ?? "Erro ao atualizar publicação.");
    }
    setPublishLoading(false);
  };

  const handleAdd = async () => {
    if (!selectedTerm?.uuid) {
      setFormError("Selecionar termo é obrigatório.");
      return;
    }
    const result = await addTermToBoard(uuid, { termUuid: selectedTerm.uuid });
    if (result.success) {
      setIsModalOpen(false);
      clearForm();
      refresh();
    } else {
      setFormError(result.error ?? "Erro ao adicionar termo.");
    }
  };

  const handleRemove = async (boardTermUuid: string) => {
    setRemoveError(null);
    const result = await removeTermFromBoard(uuid, boardTermUuid);
    if (result.success) {
      refresh();
    } else {
      setRemoveError(result.error ?? "Erro ao remover termo.");
    }
  };

  const listTerms = async () => {
    getTerms().then((items) => setTerms(items));
    setIsModalOpen(true);
  };

  // Destructuring the handlers from the custom hook
  const { handleDragStart, handleDragOver, handleDrop, handleDropAtEnd } =
    useDragReorder({
      boardUuid: uuid,
      onReorderSuccess: fetchItems,
    });

  if (board === null) {
    return (
      <div className="min-h-screen w-full bg-surface-primary">
        <div className="flex items-center justify-between border-b border-outline-common px-lg py-md">
          <p className="text-heading text-text-on-primary">
            {loading ? "Carregando..." : "Prancha não encontrada"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-surface-primary">
      <div className="flex items-center justify-between border-b border-outline-common px-lg py-md">
        <div className="flex items-center gap-md text-text-on-primary">
          <p className="text-heading">{board.title}</p>
        </div>
        <div className="flex items-center gap-md">
          <Button
            type="button"
            variant={board.publishedAt === null ? "primary" : "danger"}
            onClick={() => {
              setPublishError(null);
              setIsConfirmOpen(true);
            }}
          >
            {board.publishedAt === null
              ? "Publicar na biblioteca"
              : "Despublicar"}
          </Button>
          <AddButton onClick={listTerms} />
        </div>
      </div>
      {removeError && (
        <p className="text-sm text-red-500 px-lg py-sm border-b border-outline-common">
          {removeError}
        </p>
      )}
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
            className="group relative flex flex-col items-center gap-xs bg-surface-secondary rounded-sm p-xs"
          >
            <button
              type="button"
              aria-label={`Remover ${item.description}`}
              onClick={() => handleRemove(item.uuid)}
              className="absolute top-0 right-0 hidden group-hover:block px-xs text-text-on-primary-variant hover:text-text-on-primary hover:cursor-pointer"
            >
              ×
            </button>
            <div className="flex items-center gap-xs">
              <Image
                src={item.pictogram.fileUrl}
                alt=""
                draggable={false}
                width={80}
                height={80}
                className="object-contain rounded"
              />
              <Image
                src={item.signWriting.fileUrl}
                alt=""
                draggable={false}
                width={80}
                height={80}
                className="object-contain rounded"
              />
            </div>
            <p className="text-text-on-primary text-body font-bold text-center  ">
              {item.description}
            </p>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-text-on-primary-variant text-body">
            Nenhum termo nesta prancha.
          </p>
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          clearForm();
        }}
        title="Adicionar Termo"
      >
        {formError && <p className="text-sm text-red-500">{formError}</p>}
        <div className="flex flex-row gap-sm w-200 m-xl mb-xs">
          <TermPicker terms={terms} onSelect={setSelectedTerm} />
          <div className="flex flex-col w-full gap-md ">
            <Input
              id="termUuid"
              label="Código do Termo"
              type="text"
              disabled
              placeholder="ex: 550e8400-e29b-41d4-a716-446655440000"
              value={selectedTerm?.uuid || ""}
            />
            <div className="flex w-full justify-center">
              {selectedTerm ? (
                <div className="flex flex-col items-center gap-md">
                  <div className="flex items-center gap-md">
                    <Image
                      src={selectedTerm.pictogram.fileUrl}
                      alt=""
                      width="150"
                      height="150"
                      className="border border-outline-common object-contain rounded-md"
                    />
                    <Image
                      src={selectedTerm.signWriting.fileUrl}
                      alt=""
                      width="150"
                      height="150"
                      className="border border-outline-common object-contain rounded-md"
                    />
                  </div>
                  <p className="text-text-on-primary text-center font-bold text-md">
                    {selectedTerm.description}
                  </p>
                </div>
              ) : (
                <div className="border border-outline-common flex items-center rounded-md w-50 h-50">
                  <p className="text-text-on-primary text-center font-bold text-md">
                    Nenhum termo selecionado.
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
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => {
          if (publishLoading) return;
          setIsConfirmOpen(false);
        }}
        title={
          board.publishedAt === null
            ? "Publicar prancha"
            : "Despublicar prancha"
        }
      >
        <div className="flex flex-col gap-md w-100">
          <p className="text-text-on-primary text-body">
            {board.publishedAt === null
              ? "Esta prancha ficará visível na biblioteca pública. Deseja continuar?"
              : "Esta prancha deixará de aparecer na biblioteca pública. Deseja continuar?"}
          </p>
          {publishError && (
            <p className="text-sm text-red-500">{publishError}</p>
          )}
          <div className="flex justify-end gap-md">
            <Button
              type="button"
              variant="neutral"
              disabled={publishLoading}
              onClick={() => setIsConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant={board.publishedAt === null ? "primary" : "danger"}
              disabled={publishLoading}
              onClick={handleTogglePublish}
            >
              {publishLoading
                ? "Processando..."
                : board.publishedAt === null
                  ? "Publicar"
                  : "Despublicar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default BoardDetail;
