"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AddButton from "@/components/AddButton/AddButton";
import Modal from "@/components/Modal/Modal";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import TermPicker from "@/components/TermPicker/TermPicker";
import PhraseSequenceEditor, {
  SequenceEntry,
  entryFromTerm,
  entryFromPlacement,
} from "@/components/PhraseSequenceEditor/PhraseSequenceEditor";
import {
  getPhrase,
  updatePhrase,
  publishPhrase,
  unpublishPhrase,
  setPhraseListedInLibrary,
} from "@/services/phrases";
import { getTerms } from "@/services/terms";
import { PhraseOutput } from "@/types/phrase";
import { TermOutput } from "@/types/term";
import { formatList } from "@/utils/text";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import CreateInteractionChainModal from "@/app/(authenticated)/components/CreateInteractionChainModal/CreateInteractionChainModal";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import { getBoards } from "@/services/boards";
import {
  getInteractionChainsByTrigger,
  deleteInteractionChain,
  updateInteractionChain,
} from "@/services/interaction-chain";
import { BoardOutput } from "@/types/board";
import { InteractionChainOutput } from "@/types/interaction-chain";
import { ActionResult } from "@/types/common";
import PhraseVisibilityBadge from "@/components/PhraseVisibilityBadge/PhraseVisibilityBadge";
import {
  PHRASE_VISIBILITIES,
  PHRASE_VISIBILITY_ORDER,
  PhraseVisibility,
  phraseVisibility,
  phraseVisibilityFields,
  reducesPhraseVisibility,
} from "@/utils/phrase-visibility";

function PhraseDetail() {
  const params = useParams();
  const router = useRouter();
  const uuid = String(params.uuid);

  const [phrase, setPhrase] = useState<PhraseOutput | null>(null);
  const [loading, setLoading] = useState(true);

  const [description, setDescription] = useState("");
  const [items, setItems] = useState<SequenceEntry[]>([]);

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [visibilityLoading, setVisibilityLoading] = useState(false);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);
  const [visibilityChoice, setVisibilityChoice] =
    useState<PhraseVisibility>("draft");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [terms, setTerms] = useState<TermOutput[]>([]);

  const [chains, setChains] = useState<InteractionChainOutput[]>([]);
  const [boards, setBoards] = useState<BoardOutput[]>([]);
  const [chainError, setChainError] = useState<string | null>(null);
  const [chainBusy, setChainBusy] = useState(false);
  const [isChainModalOpen, setIsChainModalOpen] = useState(false);
  const [chainFormError, setChainFormError] = useState<string | null>(null);

  const refresh = useCallback(
    () =>
      getPhrase(uuid).then((data) => {
        setPhrase(data);
        if (data) {
          setDescription(data.description);
          setItems(data.terms.map(entryFromPlacement));
        }
      }),
    [uuid],
  );

  useEffect(() => {
    refresh()
      .catch(() => setPhrase(null))
      .finally(() => setLoading(false));
  }, [refresh]);

  // Interactions are persisted the moment they change, so they are loaded and
  // refreshed on their own rather than through the draft's `refresh`.
  const refreshChains = useCallback(() => {
    return getInteractionChainsByTrigger({ type: "phrase", uuid })
      .then((list) => setChains(list ?? []))
      .catch(() => setChains([]));
  }, [uuid]);

  useEffect(() => {
    refreshChains();
    getBoards().then(setBoards);
  }, [refreshChains]);

  const savedTermUuids = phrase?.terms.map((t) => t.termUuid) ?? [];
  const draftTermUuids = items.map((i) => i.termUuid);

  const dirty =
    phrase !== null &&
    (description !== phrase.description ||
      draftTermUuids.length !== savedTermUuids.length ||
      draftTermUuids.some((u, i) => u !== savedTermUuids[i]));

  // Covers reload, tab close and sidebar navigation alike.
  const { pendingHref, cancel: cancelNavigation } =
    useUnsavedChangesGuard(dirty);

  const missing = [
    !description.trim() && "uma descrição",
    items.length === 0 && "pelo menos um termo",
  ].filter((m): m is string => typeof m === "string");

  const canSave = missing.length === 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaveLoading(true);
    setSaveError(null);
    const result = await updatePhrase(uuid, {
      description,
      termUuids: draftTermUuids,
    });
    if (result.success) {
      await refresh();
    } else {
      setSaveError(result.error ?? "Erro ao salvar frase.");
    }
    setSaveLoading(false);
  };

  const applyVisibility = async (target: PhraseVisibility) => {
    if (!phrase) return;

    const from = phraseVisibilityFields(phraseVisibility(phrase));
    const to = phraseVisibilityFields(target);

    // Publishing and listing are separate endpoints, so one change can take two
    // requests. Whatever removes visibility goes first: if the second request
    // fails, the phrase is left less visible than asked instead of more.
    const steps: (() => Promise<ActionResult>)[] = [];
    if (from.listed && !to.listed) {
      steps.push(() => setPhraseListedInLibrary(uuid, false));
    }
    if (from.published && !to.published)
      steps.push(() => unpublishPhrase(uuid));
    if (!from.published && to.published) steps.push(() => publishPhrase(uuid));
    if (!from.listed && to.listed) {
      steps.push(() => setPhraseListedInLibrary(uuid, true));
    }

    setVisibilityLoading(true);
    setVisibilityError(null);

    let failure: string | null = null;
    for (const step of steps) {
      const result = await step();
      if (!result.success) {
        failure = result.error ?? "Erro ao alterar a visibilidade da frase.";
        break;
      }
    }

    await refresh();
    if (failure) {
      setVisibilityError(failure);
    } else {
      setIsVisibilityOpen(false);
    }
    setVisibilityLoading(false);
  };

  const boardTitle = (boardUuid: string) =>
    boards.find((b) => b.uuid === boardUuid)?.title ?? boardUuid;

  // Rank 0 does not exist: the API keeps ranks contiguous from 1, and moving a
  // row is a single PATCH of its new rank.
  const moveChain = async (chain: InteractionChainOutput, delta: number) => {
    setChainBusy(true);
    setChainError(null);
    const result = await updateInteractionChain(chain.uuid, {
      rank: chain.rank + delta,
    });
    if (result.success) {
      await refreshChains();
    } else {
      setChainError(result.error ?? "Erro ao reordenar interação.");
    }
    setChainBusy(false);
  };

  const removeChain = async (chainUuid: string) => {
    setChainBusy(true);
    setChainError(null);
    const result = await deleteInteractionChain(chainUuid);
    if (result.success) {
      await refreshChains();
    } else {
      setChainError(result.error ?? "Erro ao remover interação.");
    }
    setChainBusy(false);
  };

  const listTerms = () => {
    getTerms().then(setTerms);
    setIsModalOpen(true);
  };

  if (phrase === null) {
    return (
      <div className="w-full bg-surface-secondary">
        <div className="flex items-center justify-between border-b border-outline-common px-lg py-md">
          <p className="text-heading text-text-on-primary">
            {loading ? "Carregando..." : "Frase não encontrada"}
          </p>
        </div>
      </div>
    );
  }

  const visibility = phraseVisibility(phrase);
  const choiceReducesVisibility = reducesPhraseVisibility(
    visibility,
    visibilityChoice,
  );

  // Only losses of reach are announced. Making a phrase more visible is what
  // the author came here to do; taking it off a device is the surprise.
  const visibilityWarning = !choiceReducesVisibility
    ? null
    : visibilityChoice === "draft"
      ? "A frase deixará de ser enviada aos aplicativos. As interações continuam salvas, mas ninguém as verá."
      : "A frase sairá da biblioteca, mas continuará chegando aos aplicativos com suas interações.";

  return (
    <div className="w-full bg-surface-secondary">
      <div className="flex items-center justify-between border-b border-outline-common px-lg py-md">
        <div className="flex items-center gap-md text-text-on-primary">
          <p className="text-heading">{phrase.description}</p>
          <PhraseVisibilityBadge visibility={visibility} />
        </div>
        <div className="flex items-center gap-md">
          <Button
            type="button"
            variant="neutral"
            onClick={() => {
              setVisibilityError(null);
              setVisibilityChoice(visibility);
              setIsVisibilityOpen(true);
            }}
          >
            Alterar visibilidade
          </Button>
          <AddButton onClick={listTerms} />
        </div>
      </div>

      <div className="flex flex-col gap-lg p-lg">
        <Input
          id="description"
          label="Descrição"
          type="text"
          placeholder="ex: Quero beber água"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <PhraseSequenceEditor items={items} onChange={setItems} />

        {saveError && <p className="text-sm text-red-500">{saveError}</p>}

        <div className="flex items-center justify-end gap-md">
          {dirty && canSave && (
            <p className="text-sm text-text-on-primary-variant">
              Alterações não salvas.
            </p>
          )}
          {!canSave && (
            <p className="text-sm text-text-on-primary-variant text-right">
              Falta escolher {formatList(missing)}.
            </p>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={!dirty || !canSave || saveLoading}
            className="disabled:cursor-not-allowed"
          >
            {saveLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="border-t border-outline-common">
        <div className="flex items-center justify-between border-b border-outline-common px-lg py-md">
          <div className="flex flex-col">
            <p className="text-body-emph text-text-on-primary font-semibold">
              Interações
            </p>
            <p className="text-sm text-text-on-primary-variant">
              Pranchas abertas no aplicativo depois desta frase, na ordem.
            </p>
          </div>
          <div className="flex items-center gap-md">
            {visibility === "draft" && (
              <p className="text-sm text-text-on-primary-variant text-right">
                A frase está em rascunho: estas interações só valerão quando ela
                for publicada.
              </p>
            )}
            <Button
              type="button"
              onClick={() => {
                setChainFormError(null);
                setIsChainModalOpen(true);
              }}
            >
              Nova Interação
            </Button>
          </div>
        </div>

        {chainError && (
          <p className="text-sm text-red-500 px-lg pt-md">{chainError}</p>
        )}

        <div className="flex flex-col gap-sm p-lg">
          {chains.length === 0 ? (
            <p className="text-sm text-text-on-primary-variant">
              Esta frase ainda não abre nenhuma prancha.
            </p>
          ) : (
            chains.map((chain, index) => (
              <div
                key={chain.uuid}
                className="flex items-center justify-between border border-outline-common bg-surface-primary rounded-md px-sm py-xs text-text-on-primary"
              >
                <div className="flex items-center gap-md px-sm">
                  <span className="text-text-on-primary-variant text-sm">
                    {chain.rank}
                  </span>
                  <p className="text-body-emph font-semibold">
                    {boardTitle(chain.responseBoardUuid)}
                  </p>
                  {chain.label?.trim() && (
                    <span className="text-sm text-text-on-primary-variant">
                      ({chain.label})
                    </span>
                  )}
                  {index === 0 && (
                    <span className="text-sm text-text-on-primary-variant">
                      abre primeiro
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-xs">
                  <Button
                    type="button"
                    variant="neutral"
                    className="disabled:cursor-not-allowed"
                    disabled={chainBusy || index === 0}
                    onClick={() => moveChain(chain, -1)}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="neutral"
                    className="disabled:cursor-not-allowed"
                    disabled={chainBusy || index === chains.length - 1}
                    onClick={() => moveChain(chain, 1)}
                  >
                    ↓
                  </Button>
                  <RemoveButton
                    active={!chainBusy}
                    onClick={() => {
                      if (chainBusy) return;
                      removeChain(chain.uuid);
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CreateInteractionChainModal
        isModalOpen={isChainModalOpen}
        setIsModalOpen={setIsChainModalOpen}
        formError={chainFormError}
        setFormError={setChainFormError}
        triggerKind="phrase"
        incomingTrigger={{ type: "phrase", uuid }}
        onChanged={refreshChains}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Adicionar Termo"
      >
        <div className="flex flex-row gap-sm w-200 m-xl mb-xs">
          <TermPicker
            terms={terms}
            onSelect={(term) =>
              setItems((prev) => [...prev, entryFromTerm(term)])
            }
          />
        </div>
        <div className="flex justify-end gap-md">
          <Button type="button" onClick={() => setIsModalOpen(false)}>
            Concluir
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={pendingHref !== null}
        onClose={cancelNavigation}
        title="Sair sem salvar?"
      >
        <div className="flex flex-col gap-md w-100">
          <p className="text-text-on-primary text-body">
            Esta frase tem alterações que ainda não foram salvas. Se sair agora,
            elas serão perdidas.
          </p>
          <div className="flex justify-end gap-md">
            <Button type="button" variant="neutral" onClick={cancelNavigation}>
              Continuar editando
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                const href = pendingHref;
                cancelNavigation();
                if (href) router.push(href);
              }}
            >
              Sair sem salvar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isVisibilityOpen}
        onClose={() => {
          if (visibilityLoading) return;
          setIsVisibilityOpen(false);
        }}
        title="Visibilidade da frase"
      >
        <div className="flex flex-col gap-md w-150">
          <div className="flex flex-col gap-sm">
            {PHRASE_VISIBILITY_ORDER.map((value) => (
              <label
                key={value}
                className={`flex items-start gap-sm rounded-md border px-sm py-sm cursor-pointer ${
                  visibilityChoice === value
                    ? "border-primary bg-surface-secondary"
                    : "border-outline-common"
                }`}
              >
                <input
                  type="radio"
                  name="phrase-visibility"
                  className="mt-xs"
                  value={value}
                  checked={visibilityChoice === value}
                  disabled={visibilityLoading}
                  onChange={() => setVisibilityChoice(value)}
                />
                <div className="flex flex-col">
                  <span className="flex items-center gap-sm text-text-on-primary text-body-emph font-semibold">
                    {PHRASE_VISIBILITIES[value].label}
                    {value === visibility && (
                      <span className="text-sm text-text-on-primary-variant font-normal">
                        atual
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-text-on-primary-variant">
                    {PHRASE_VISIBILITIES[value].description}
                  </span>
                </div>
              </label>
            ))}
          </div>
          {visibilityWarning && (
            <p className="text-sm text-text-on-primary-variant">
              {visibilityWarning}
            </p>
          )}
          {dirty && (
            <p className="text-sm text-text-on-primary-variant">
              As alterações não salvas não serão publicadas.
            </p>
          )}
          {visibilityError && (
            <p className="text-sm text-red-500">{visibilityError}</p>
          )}
          <div className="flex justify-end gap-md">
            <Button
              type="button"
              variant="neutral"
              disabled={visibilityLoading}
              onClick={() => setIsVisibilityOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant={choiceReducesVisibility ? "danger" : "primary"}
              className="disabled:cursor-not-allowed"
              disabled={visibilityLoading || visibilityChoice === visibility}
              onClick={() => applyVisibility(visibilityChoice)}
            >
              {visibilityLoading ? "Processando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default PhraseDetail;
