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
} from "@/services/phrases";
import { getTerms } from "@/services/terms";
import { PhraseOutput } from "@/types/phrase";
import { TermOutput } from "@/types/term";
import { formatList } from "@/utils/text";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";

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

  const [publishLoading, setPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [terms, setTerms] = useState<TermOutput[]>([]);

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

  const handleTogglePublish = async () => {
    if (!phrase) return;
    setPublishLoading(true);
    setPublishError(null);
    const result =
      phrase.publishedAt === null
        ? await publishPhrase(uuid)
        : await unpublishPhrase(uuid);
    if (result.success) {
      await refresh();
      setIsConfirmOpen(false);
    } else {
      setPublishError(result.error ?? "Erro ao atualizar publicação.");
    }
    setPublishLoading(false);
  };

  const listTerms = () => {
    getTerms().then(setTerms);
    setIsModalOpen(true);
  };

  if (phrase === null) {
    return (
      <div className="min-h-screen w-full bg-surface-primary">
        <div className="flex items-center justify-between border-b border-outline-common px-lg py-md">
          <p className="text-heading text-text-on-primary">
            {loading ? "Carregando..." : "Frase não encontrada"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-surface-primary">
      <div className="flex items-center justify-between border-b border-outline-common px-lg py-md">
        <div className="flex items-center gap-md text-text-on-primary">
          <p className="text-heading">{phrase.description}</p>
        </div>
        <div className="flex items-center gap-md">
          <Button
            type="button"
            variant={phrase.publishedAt === null ? "primary" : "danger"}
            onClick={() => {
              setPublishError(null);
              setIsConfirmOpen(true);
            }}
          >
            {phrase.publishedAt === null
              ? "Publicar na biblioteca"
              : "Despublicar"}
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
        isOpen={isConfirmOpen}
        onClose={() => {
          if (publishLoading) return;
          setIsConfirmOpen(false);
        }}
        title={
          phrase.publishedAt === null ? "Publicar frase" : "Despublicar frase"
        }
      >
        <div className="flex flex-col gap-md w-100">
          <p className="text-text-on-primary text-body">
            {phrase.publishedAt === null
              ? "Esta frase ficará visível na biblioteca pública. Deseja continuar?"
              : "Esta frase deixará de aparecer na biblioteca pública. Deseja continuar?"}
          </p>
          {dirty && (
            <p className="text-sm text-text-on-primary-variant">
              As alterações não salvas não serão publicadas.
            </p>
          )}
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
              variant={phrase.publishedAt === null ? "primary" : "danger"}
              disabled={publishLoading}
              onClick={handleTogglePublish}
            >
              {publishLoading
                ? "Processando..."
                : phrase.publishedAt === null
                  ? "Publicar"
                  : "Despublicar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default PhraseDetail;
