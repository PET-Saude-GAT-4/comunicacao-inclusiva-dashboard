"use client";

import Input from "@/components/Input/Input";
import Modal from "@/components/Modal/Modal";
import { BoardOutput } from "@/types/board";
import { PhraseOutput } from "@/types/phrase";
import { useCallback, useEffect, useState } from "react";
import BoardPicker from "@/components/BoardPicker/BoardPicker";
import PhrasePicker from "@/components/PhrasePicker/PhrasePicker";
import { getBoards, getBoard } from "@/services/boards";
import { getPhrases, getPhrase } from "@/services/phrases";

import Image from "next/image";

import { MdClose } from "react-icons/md";

import {
  createInteractionChain,
  getInteractionChainsByTrigger,
  deleteInteractionChain,
  getInteractionChains,
} from "@/services/interaction-chain";

import Button from "@/components/Button/Button";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import {
  ChainTrigger,
  InteractionChainOutput,
} from "@/types/interaction-chain";

interface props {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  formError: string | null;
  setFormError: (value: string | null) => void;
  // Which picker to offer when the page does not fix the trigger itself.
  triggerKind: ChainTrigger["type"];
  incomingTrigger?: ChainTrigger;
  onChanged?: () => void;
}

export default function CreateInteractionChainModal({
  isModalOpen,
  setIsModalOpen,
  formError,
  setFormError,
  triggerKind,
  incomingTrigger,
  onChanged,
}: props) {
  const [triggerBoard, setTriggerBoard] = useState<BoardOutput | null>(null);
  const [triggerPhrase, setTriggerPhrase] = useState<PhraseOutput | null>(null);
  const [responseBoard, setResponseBoard] = useState<BoardOutput | null>(null);
  const [label, setLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const [interactionList, setInteractionList] = useState<
    InteractionChainOutput[]
  >([]);

  const [data, setData] = useState<BoardOutput[]>([]);
  const [phrases, setPhrases] = useState<PhraseOutput[]>([]);

  const isPhraseTrigger = triggerKind === "phrase";

  // The two trigger states are collapsed into the arc the API speaks.
  const trigger: ChainTrigger | null = triggerBoard
    ? { type: "board", uuid: triggerBoard.uuid }
    : triggerPhrase
      ? { type: "phrase", uuid: triggerPhrase.uuid }
      : null;

  const fetchInteractionChain = useCallback((current: ChainTrigger | null) => {
    if (current) {
      getInteractionChainsByTrigger(current).then((list) =>
        setInteractionList(list ?? []),
      );
    } else {
      getInteractionChains().then(setInteractionList);
    }
  }, []);

  // Callers pass incomingTrigger as an object literal, so depending on the
  // object itself would re-run this on every render. The two fields are stable.
  const incomingType = incomingTrigger?.type;
  const incomingUuid = incomingTrigger?.uuid;

  // Load only once the modal is open: fetching on mount spends a request on a
  // list nobody has asked to see.
  useEffect(() => {
    if (!isModalOpen) return;

    getBoards().then(setData);
    getPhrases().then(setPhrases);

    if (!incomingType || !incomingUuid) return;

    if (incomingType === "board") {
      getBoard(incomingUuid).then(setTriggerBoard);
    } else {
      getPhrase(incomingUuid).then(setTriggerPhrase);
    }
  }, [isModalOpen, incomingType, incomingUuid]);

  // Reload whenever the trigger changes, so the list never shows chains that
  // belong to a trigger the user has already moved away from. `trigger` is
  // rebuilt on every render, so the deps are its uuids instead; that is what
  // the lint rule is suppressed for.
  useEffect(() => {
    if (!isModalOpen) return;
    fetchInteractionChain(trigger);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, triggerBoard?.uuid, triggerPhrase?.uuid]);

  const clearForm = () => {
    setTriggerBoard(null);
    setTriggerPhrase(null);
    setResponseBoard(null);
    setLabel("");
    setInteractionList([]);
    setRemoveError(null);
  };

  const duplicateInteraction =
    trigger && responseBoard
      ? interactionList.find(
          (ic) => ic.responseBoardUuid === responseBoard.uuid,
        )
      : null;

  const getBoardTitle = (uuid: string) =>
    data.find((b) => b.uuid === uuid)?.title ?? uuid;

  const getTriggerTitle = (t: ChainTrigger) =>
    t.type === "board"
      ? getBoardTitle(t.uuid)
      : (phrases.find((p) => p.uuid === t.uuid)?.description ?? t.uuid);

  const handleCreate = async () => {
    if (!trigger) {
      setFormError(
        isPhraseTrigger
          ? "Frase de Origem é Obrigatória."
          : "Prancha de Origem é Obrigatória.",
      );
      return;
    }

    if (!responseBoard) {
      setFormError("Prancha de Destino é Obrigatória.");
      return;
    }

    if (duplicateInteraction) {
      setFormError("Já existe uma interação com essa prancha de destino.");
      return;
    }

    setIsSubmitting(true);
    const result = await createInteractionChain({
      trigger,
      responseBoardUuid: responseBoard.uuid,
      label: label.trim() ? label.trim() : undefined,
    });
    setIsSubmitting(false);

    if (result.success) {
      setIsModalOpen(false);
      setFormError(null);
      clearForm();
      onChanged?.();
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

  const handleRemoveInteraction = async (uuid: string) => {
    setRemoveError(null);
    const result = await deleteInteractionChain(uuid);

    if (result.success) {
      fetchInteractionChain(trigger);
      onChanged?.();
    } else {
      setRemoveError(result.error ?? "Erro ao remover interação.");
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
      {removeError && <p className="text-sm text-red-500">{removeError}</p>}

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
                onClick={() => {
                  setTriggerBoard(null);
                  setTriggerPhrase(null);
                }}
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
              ) : triggerPhrase ? (
                <div className="border border-outline-common flex items-center justify-center rounded-md w-50 h-50 bg-surface-primary p-5">
                  <p className="text-text-on-primary text-center font-bold text-md">
                    {triggerPhrase.description}
                  </p>
                </div>
              ) : (
                <div className="border border-outline-common flex items-center rounded-md w-50 h-50 bg-red-50 p-5">
                  <p className="text-error-primary text-center font-bold text-md">
                    {isPhraseTrigger
                      ? "Nenhuma frase origem selecionada."
                      : "Nenhuma prancha origem selecionada."}
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
                Já existe uma interação com essa prancha de destino
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
          {!trigger && (
            <div className="flex flex-col gap-lg text-text-on-primary ">
              <p className="text-gray-500 text-heading font-semibold">
                Escolha a {isPhraseTrigger ? "Frase" : "Prancha"} de{" "}
                <span className="text-green-500">Origem</span>
              </p>
              {isPhraseTrigger ? (
                <PhrasePicker phrases={phrases} onSelect={setTriggerPhrase} />
              ) : (
                <BoardPicker
                  boards={handleShownBoards()}
                  onSelect={setTriggerBoard}
                />
              )}
            </div>
          )}
          {trigger && (
            <div className="flex flex-col gap-lg text-text-on-primary">
              <p className="text-gray-500 text-heading font-semibold">
                Escolha a Prancha de{" "}
                <span className="text-green-500 ">Destino</span>
              </p>
              <BoardPicker
                boards={handleShownBoards()}
                onSelect={setResponseBoard}
                requirePublished
              />
            </div>
          )}
        </div>
        {/* Column 3 */}
        {(!trigger || interactionList.length > 0) && (
          <div id="column-3" className="flex flex-col w-full gap-lg pl-xl">
            <p className="text-gray-500 font-semibold text-heading">
              {trigger
                ? isPhraseTrigger
                  ? "Interações que partem dessa frase:"
                  : "Interações que partem dessa prancha:"
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
                        : `${getTriggerTitle(ic.trigger)} → ${getBoardTitle(
                            ic.responseBoardUuid,
                          )}`}
                      <div>
                        <RemoveButton
                          active
                          onClick={() => handleRemoveInteraction(ic.uuid)}
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
