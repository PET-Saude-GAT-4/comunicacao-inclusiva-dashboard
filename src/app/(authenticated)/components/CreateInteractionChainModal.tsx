"use client";

import Input from "@/components/Input/Input";
import Modal from "@/components/Modal/Modal";
import { BoardOutput } from "@/types/board";
import { useEffect, useState } from "react";
import BoardPicker from "@/components/BoardPicker/BoardPicker";
import { getBoards } from "@/services/boards";

import Image from "next/image";

import { MdClose } from "react-icons/md";
import { getBoard } from "@/services/boards";

import { createInteractionChain } from "@/services/interaction-chain";

import Button from "@/components/Button/Button";

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

  const [data, setData] = useState<BoardOutput[]>([]);

  const fetchData = () => getBoards().then(setData);

  const fetchBoard = () =>
    getBoard(incomingTriggerBoardUuid!).then((data) => setTriggerBoard(data));

  const clearForm = () => {
    setTriggerBoard(null);
    setResponseBoard(null);
  };

  useEffect(() => {
    fetchBoard();
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!triggerBoard) {
      setFormError("Prancha de Origem é Obrigatória.");
      return;
    }

    if (!responseBoard) {
      setFormError("Prancha de Destino é Obrigatória.");
      return;
    }

    const result = await createInteractionChain({
      triggerBoardUuid: triggerBoard!.uuid,
      responseBoardUuid: responseBoard!.uuid,
    });
    if (result.success) {
      setIsModalOpen(false);
      setFormError(null);
      clearForm();
    } else {
      setFormError(result.error ?? "Erro ao criar interação.");
    }
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
      <div className="flex flex-row justify-center gap-36 w-250 m-xl mb-xs">
        <div className="flex flex-col w-full gap-xxl">
          <Input
            id="label"
            label="Nome da Interação (Opcional):"
            placeholder="ex: fluxo_prancha1_prancha2"
          />
          <select name="" id="">
            <option value=""></option>
          </select>
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
        </div>
        <div className="w-full">
          {!triggerBoard && (
            <div className="flex flex-col gap-lg text-text-on-primary">
              <p className="text-gray-500 text-heading font-semibold">
                Escolha a Prancha de{" "}
                <span className="text-green-500">Origem</span>
              </p>
              <BoardPicker
                boards={data}
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
                boards={data}
                onSelect={(board) => {
                  setResponseBoard(board);
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-md mt-md">
        <Button type="button" onClick={handleCreate}>
          Criar Interação
        </Button>
      </div>
    </Modal>
  );
}
