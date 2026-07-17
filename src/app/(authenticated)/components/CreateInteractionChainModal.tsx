"use client";

import Input from "@/components/Input/Input";
import Modal from "@/components/Modal/Modal";
import { BoardOutput } from "@/types/board";
import { useEffect, useState } from "react";
import BoardPicker from "@/components/BoardPicker/BoardPicker";
import { getBoards, getBoard } from "@/services/boards";

import Image from "next/image";

import { MdClose } from "react-icons/md";

import {
  createInteractionChain,
  getInteractionChainByBoardUuid,
  deleteInteractionChain,
  getInteractionChains,
} from "@/services/interaction-chain";

import Button from "@/components/Button/Button";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import { InteractionChainOutput } from "@/types/interaction-chain";

interface props {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  formError: string | null;
  setFormError: (value: string | null) => void;
  incomingTriggerBoardUuid?: string;
}

export default function CreateInteractionChainModal({
  isModalOpen,
  setIsModalOpen,
  formError,
  setFormError,
  incomingTriggerBoardUuid,
}: props) {
  const [triggerBoard, setTriggerBoard] = useState<BoardOutput | null>(null);
  const [responseBoard, setResponseBoard] = useState<BoardOutput | null>(null);
  const [label, setLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [interactionList, setInteractionList] = useState<
    InteractionChainOutput[]
  >([]);

  const [data, setData] = useState<BoardOutput[]>([]);

  const fetchData = () => getBoards().then(setData);

  const fetchBoard = () => {
    if (!incomingTriggerBoardUuid) return;
    getBoard(incomingTriggerBoardUuid).then((data) => setTriggerBoard(data));
  };

  const fetchInteractionChain = (triggerBoardUuid?: string) => {
    if (triggerBoardUuid) {
      getInteractionChainByBoardUuid(triggerBoardUuid).then((data) => {
        setInteractionList(data ?? []);
      });
    } else {
      getInteractionChains().then((data) => setInteractionList(data));
    }
  };

  const clearForm = () => {
    setTriggerBoard(null);
    setResponseBoard(null);
    setLabel("");
    setInteractionList([]);
  };

  const clearTriggerBoard = () => {
    setTriggerBoard(null);
    setInteractionList([]);
  };

  useEffect(() => {
    fetchBoard();
    fetchData();
  }, []);

  // Refaz a listagem sempre que a prancha de origem mudar, pra não
  // comparar/exibir dados de uma origem que o usuário já trocou.
  useEffect(() => {
    fetchInteractionChain(triggerBoard?.uuid);
  }, [triggerBoard]);

  const duplicateInteraction =
    triggerBoard && responseBoard
      ? interactionList.find(
          (ic: { responseBoardUuid: string }) =>
            ic.responseBoardUuid === responseBoard.uuid,
        )
      : null;

  const getBoardTitle = (uuid: string) =>
    data.find((b) => b.uuid === uuid)?.title ?? uuid;

  const handleCreate = async () => {
    if (!triggerBoard) {
      setFormError("Prancha de Origem é Obrigatória.");
      return;
    }

    if (!responseBoard) {
      setFormError("Prancha de Destino é Obrigatória.");
      return;
    }

    if (duplicateInteraction) {
      setFormError("Já existe uma interação entre essas duas pranchas.");
      return;
    }

    setIsSubmitting(true);
    const result = await createInteractionChain({
      triggerBoardUuid: triggerBoard.uuid,
      responseBoardUuid: responseBoard.uuid,
      label: label.trim() ? label.trim() : undefined,
    });
    setIsSubmitting(false);

    if (result.success) {
      setIsModalOpen(false);
      setFormError(null);
      clearForm();
    } else {
      setFormError(result.error ?? "Erro ao criar interação.");
    }
  };

  const handleShownBoards = () => {
    let filtered = [...data];

    if (triggerBoard) {
      filtered = filtered.filter((p) => p.uuid !== triggerBoard.uuid);
    }
    if (responseBoard) {
      filtered = filtered.filter((p) => p.uuid !== responseBoard.uuid);
    }

    return filtered;
  };

  const handleRemoveInteraction = (id: number) => {
    deleteInteractionChain(id).then(() => {
      fetchInteractionChain(triggerBoard?.uuid ?? "");
    });
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        setFormError(null);
        clearForm();
      }}
      title="Nova Interação"
    >
      {formError && <p className="text-sm text-red-500">{formError}</p>}

      <div
        id="parent-container"
        className="flex flex-row justify-center w-fit m-xl mb-xs text-text-on-primary divide-x divide-outline-common"
      >
        {/* Column 1 */}
        <div id="column-1" className="flex flex-col w-full gap-lg pr-xl">
          <p className="text-gray-500 text-heading font-semibold">
            Crie uma Nova Interação
          </p>
          <Input
            id="label"
            label="Nome da Interação (Opcional):"
            placeholder="ex: fluxo_prancha1_prancha2"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <div className="flex flex-row gap-xl">
            <div className="flex flex-col items-center gap-md text-text-on-primary">
              <button
                className="flex flex-row items-center gap-md bg-gray-200 rounded-md px-sm py-xs "
                onClick={() => setTriggerBoard(null)}
              >
                <div className="text-gray-500 hover:text-text-on-primary-dark rounded-4xl hover:bg-red-400 hover:cursor-pointer transition-colors">
                  <MdClose />
                </div>
                <p className=" font-bold text-gray-500">Origem</p>
              </button>
              {triggerBoard ? (
                <div className="flex flex-col items-center gap-md">
                  <Image
                    src={triggerBoard.representativePictogram.fileUrl}
                    alt=""
                    width="200"
                    height="200"
                    className="border border-outline-common object-contain rounded-md"
                  />
                  <p className="text-text-on-primary text-center font-bold text-md">
                    {triggerBoard.title}
                  </p>
                </div>
              ) : (
                <div className="border border-outline-common flex items-center rounded-md w-50 h-50 bg-red-50 p-5">
                  <p className="text-error-primary text-center font-bold text-md">
                    Nenhuma prancha origem selecionada.
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-md text-text-on-primary">
              <button
                className="flex flex-row items-center gap-md bg-gray-200 rounded-md px-sm py-xs "
                onClick={() => setResponseBoard(null)}
              >
                <div className="text-gray-500 hover:text-text-on-primary-dark rounded-4xl hover:bg-red-400 hover:cursor-pointer transition-colors">
                  <MdClose />
                </div>
                <p className=" font-bold text-gray-500">Destino</p>
              </button>
              {responseBoard ? (
                <div className="flex flex-col items-center gap-md">
                  <Image
                    src={responseBoard.representativePictogram.fileUrl}
                    alt=""
                    width="200"
                    height="200"
                    className="border border-outline-common object-contain rounded-md"
                  />
                  <p className="text-text-on-primary text-center font-bold text-md">
                    {responseBoard.title}
                  </p>
                </div>
              ) : (
                <div className="border border-outline-common flex items-center rounded-md w-50 h-50 bg-red-50 p-5">
                  <p className="text-error-primary text-center font-bold text-md">
                    Nenhuma prancha destino selecionada.
                  </p>
                </div>
              )}
            </div>
          </div>

          {duplicateInteraction && (
            <div className="border border-error-primary bg-red-50 rounded-md px-sm py-xs">
              <p className="text-error-primary text-sm font-semibold">
                Já existe uma interação entre essas pranchas
                {duplicateInteraction.label
                  ? ` ("${duplicateInteraction.label}")`
                  : ""}
                .
              </p>
            </div>
          )}
        </div>
        {/* Column 2 */}
        <div id="column-2" className="w-full px-xl">
          {!triggerBoard && (
            <div className="flex flex-col gap-lg text-text-on-primary ">
              <p className="text-gray-500 text-heading font-semibold">
                Escolha a Prancha de{" "}
                <span className="text-green-500">Origem</span>
              </p>
              <BoardPicker
                boards={handleShownBoards()}
                onSelect={(board) => {
                  setTriggerBoard(board);
                }}
              />
            </div>
          )}
          {triggerBoard && (
            <div className="flex flex-col gap-lg text-text-on-primary">
              <p className="text-gray-500 text-heading font-semibold">
                Escolha a Prancha de{" "}
                <span className="text-green-500 ">Destino</span>
              </p>
              <BoardPicker
                boards={handleShownBoards()}
                onSelect={(board) => {
                  setResponseBoard(board);
                }}
              />
            </div>
          )}
        </div>
        {/* Column 3 */}
        {(!triggerBoard || interactionList.length > 0) && (
          <div id="column-3" className="flex flex-col w-full gap-lg pl-xl">
            <p className="text-gray-500 font-semibold text-heading">
              {triggerBoard
                ? "Interações que partem dessa prancha:"
                : "Todas as Interações:"}
            </p>
            <div className="flex flex-col rounded-sm gap-sm">
              {interactionList.length === 0 ? (
                <p className="text-gray-400 text-sm px-sm py-sm">
                  Nenhuma interação encontrada.
                </p>
              ) : (
                interactionList.map((ic) => (
                  <div
                    key={ic.uuid}
                    className="flex items-center justify-between border border-outline-common bg-background rounded-md px-sm py-sm text-sm text-text-on-primary"
                  >
                    <span className="flex items-center justify-between w-full px-5 font-semibold text-body-emph">
                      {ic.label?.trim()
                        ? ic.label
                        : `${getBoardTitle(ic.triggerBoardUuid)} → ${getBoardTitle(
                            ic.responseBoardUuid,
                          )}`}
                      <div>
                        <RemoveButton
                          active
                          onClick={() => handleRemoveInteraction(ic.id)}
                        />
                      </div>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-md">
        <Button
          type="button"
          onClick={handleCreate}
          disabled={isSubmitting || !!duplicateInteraction}
        >
          {isSubmitting ? "Criando..." : "Criar Interação"}
        </Button>
      </div>
    </Modal>
  );
}
