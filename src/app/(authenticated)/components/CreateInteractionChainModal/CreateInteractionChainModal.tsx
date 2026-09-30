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

import { MdArrowBack, MdListAlt } from "react-icons/md";

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
  const [step, setStep] = useState<"trigger" | "response">(
    incomingTrigger ? "response" : "trigger",
  );
  const [showInteractions, setShowInteractions] = useState(false);
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
    setStep("trigger");
    setShowInteractions(false);
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
    return data.filter((board) => board.uuid !== triggerBoard?.uuid);
  };

  // A trigger may point at a board only once, so its existing responses are
  // left out of the picker. Matching on each chain's own trigger keeps this
  // right while interactionList still holds all chains or a previous trigger's.
  const handleShownResponseBoards = () => {
    if (!trigger) return handleShownBoards();

    const linked = new Set(
      interactionList
        .filter(
          (ic) =>
            ic.trigger.type === trigger.type &&
            ic.trigger.uuid === trigger.uuid,
        )
        .map((ic) => ic.responseBoardUuid),
    );

    return handleShownBoards().filter((board) => !linked.has(board.uuid));
  };

  const handleSelectTriggerBoard = (board: BoardOutput) => {
    setTriggerBoard(board);
    setTriggerPhrase(null);
    setResponseBoard(null);
    setStep("response");
  };

  const handleSelectTriggerPhrase = (phrase: PhraseOutput) => {
    setTriggerPhrase(phrase);
    setTriggerBoard(null);
    setResponseBoard(null);
    setStep("response");
  };

  const handleChangeTrigger = () => {
    setResponseBoard(null);
    setStep("trigger");
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
      <div className="w-[min(64rem,calc(100vw-3rem))] font-medium text-text-on-primary">
        {showInteractions ? (
          <section aria-label="Lista de interações">
            <div className="mb-md flex items-center justify-between gap-md">
              <div>
                <h2 className="text-heading font-semibold">Interações</h2>
                <p className="text-sm text-gray-500">
                  {trigger ? (
                    <>
                      Origem:{" "}
                      <span className="font-semibold">
                        {getTriggerTitle(trigger)}
                      </span>
                    </>
                  ) : (
                    "Todas as origens"
                  )}
                </p>
              </div>
              <Button
                type="button"
                variant="neutral"
                className="my-0 inline-flex items-center gap-sm"
                onClick={() => setShowInteractions(false)}
              >
                <MdArrowBack aria-hidden="true" /> Voltar
              </Button>
            </div>
            {removeError && (
              <p className="mb-sm text-sm text-red-500">{removeError}</p>
            )}
            <div className="max-h-96 overflow-y-auto">
              {interactionList.length === 0 ? (
                <p className="rounded-md border border-outline-common p-md text-sm text-gray-500">
                  Nenhuma interação encontrada.
                </p>
              ) : (
                <ul className="flex flex-col gap-sm">
                  {interactionList.map((ic) => (
                    <li
                      key={ic.uuid}
                      className="flex items-center justify-between gap-md rounded-md border border-outline-common bg-background px-md py-sm"
                    >
                      <span className="min-w-0 wrap-break-word font-semibold">
                        {ic.label?.trim()
                          ? ic.label
                          : `${getTriggerTitle(ic.trigger)} → ${getBoardTitle(
                              ic.responseBoardUuid,
                            )}`}
                      </span>
                      <RemoveButton
                        active
                        onClick={() => handleRemoveInteraction(ic.uuid)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ) : (
          <>
            <div className="mb-md flex justify-end">
              <Button
                type="button"
                variant="neutral"
                className="my-0 inline-flex shrink-0 items-center gap-sm"
                onClick={() => setShowInteractions(true)}
              >
                <MdListAlt aria-hidden="true" />
                {trigger ? "Interações desta origem" : "Todas as interações"}
              </Button>
            </div>

            {formError && (
              <p className="mb-md text-sm text-red-500">{formError}</p>
            )}

            <div className="flex flex-col gap-lg">
              <aside className="flex flex-col gap-md border-b border-outline-common pb-md">
                <div className="flex items-center justify-center gap-sm" aria-label="Etapas">
                  {["trigger", "response"].map((item, index) => {
                    const active = step === item;
                    const complete = item === "trigger" && !!trigger;
                    return (
                      <div key={item} className="flex items-center gap-sm">
                        {index > 0 && (
                          <span className="h-px w-6 bg-outline-common" />
                        )}
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                            active || complete
                              ? "bg-primary-dark text-white"
                              : "bg-surface-secondary text-gray-500"
                          }`}
                          aria-current={active ? "step" : undefined}
                        >
                          {index + 1}
                        </span>
                        <span
                          className={`text-sm text-gray-600 ${active ? "font-semibold" : ""}`}
                        >
                          {index === 0 ? "Origem" : "Destino"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {step === "trigger" ? (
                  <div>
                    <h2 className="text-heading font-semibold">
                      1. Escolha a {isPhraseTrigger ? "frase" : "prancha"} de
                      origem
                    </h2>
                    <p className="mt-sm text-sm text-gray-500">
                      Esta é a origem que iniciará a interação.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 items-center gap-lg px-xxl">
                      <div className="flex min-w-0 flex-col gap-sm">
                        <div>
                          <h2 className="text-heading font-semibold">
                            2. Escolha a prancha de destino
                          </h2>
                          <p className="mt-sm wrap-break-word text-sm text-gray-500">
                            Origem:{" "}
                            <span className="font-semibold">
                              {trigger ? getTriggerTitle(trigger) : ""}
                            </span>
                          </p>
                          <p className="wrap-break-word text-sm text-gray-500">
                            Destino:{" "}
                            {responseBoard ? (
                              <span className="font-semibold">
                                {responseBoard.title}
                              </span>
                            ) : (
                              <span className="italic">nenhuma selecionada</span>
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="self-start text-sm font-semibold text-primary-dark underline"
                          onClick={handleChangeTrigger}
                        >
                          Alterar origem
                        </button>
                      </div>
                      <div className="min-w-0">
                        <Input
                          id="label"
                          label="Descrição da interação (opcional)"
                          placeholder="Ex.: abrir prancha de alimentação"
                          value={label}
                          onChange={(e) => setLabel(e.target.value)}
                        />
                      </div>
                    </div>
                    {duplicateInteraction && (
                      <p className="rounded-md border border-error-primary bg-red-50 px-sm py-xs text-sm text-error-primary">
                        Já existe uma interação com essa prancha de destino
                        {duplicateInteraction.label
                          ? ` ("${duplicateInteraction.label}")`
                          : ""}
                        .
                      </p>
                    )}
                    <div className="mt-auto flex justify-end gap-sm">
                      <Button
                        type="button"
                        variant="neutral"
                        onClick={handleChangeTrigger}
                      >
                        Voltar
                      </Button>
                      <Button
                        type="button"
                        onClick={handleCreate}
                        disabled={
                          isSubmitting ||
                          !responseBoard ||
                          !!duplicateInteraction
                        }
                      >
                        {isSubmitting ? "Criando..." : "Criar interação"}
                      </Button>
                    </div>
                  </>
                )}
              </aside>

              <div className="min-w-0">
                {step === "trigger" ? (
                  isPhraseTrigger ? (
                    <PhrasePicker
                      phrases={phrases}
                      onSelect={handleSelectTriggerPhrase}
                    />
                  ) : (
                    <BoardPicker
                      boards={handleShownBoards()}
                      onSelect={handleSelectTriggerBoard}
                    />
                  )
                ) : (
                  <BoardPicker
                    boards={handleShownResponseBoards()}
                    onSelect={setResponseBoard}
                    requirePublished
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
