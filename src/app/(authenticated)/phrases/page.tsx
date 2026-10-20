"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AddButton from "@/components/AddButton/AddButton";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import Modal from "@/components/Modal/Modal";
import Table from "@/components/Table/Table";
import SearchBar from "@/components/SearchBar/SearchBar";
import ListToolbar from "@/components/ListToolbar/ListToolbar";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import PhraseVisibilityBadge from "@/components/PhraseVisibilityBadge/PhraseVisibilityBadge";
import TermPicker from "@/components/TermPicker/TermPicker";
import PhraseSequenceEditor, {
  SequenceEntry,
  entryFromTerm,
} from "@/components/PhraseSequenceEditor/PhraseSequenceEditor";
import { getPhrasePage, createPhrase, deletePhrase } from "@/services/phrases";
import { getSessionUser } from "@/services/auth";
import { PhraseOutput } from "@/types/phrase";
import { TermPlacementOutput } from "@/types/term";
import { SessionUser } from "@/types/session";
import { formatList } from "@/utils/text";
import CreateInteractionChainModal from "@/app/(authenticated)/components/CreateInteractionChainModal/CreateInteractionChainModal";
import { PhraseVisibility, phraseVisibility } from "@/utils/phrase-visibility";

const PREVIEW_LIMIT = 4;

type PhraseRow = {
  uuid: string;
  description: string;
  terms: TermPlacementOutput[];
  authorUuid: string | null;
  itemCount: number;
  visibility: PhraseVisibility;
  createdAt: string;
};

function toRow(p: PhraseOutput): PhraseRow {
  return {
    uuid: p.uuid,
    description: p.description,
    terms: p.terms,
    authorUuid: p.authorUuid,
    itemCount: p.terms.length,
    visibility: phraseVisibility(p),
    createdAt: new Date(p.createdAt).toLocaleDateString("pt-BR"),
  };
}

function Phrases() {
  const router = useRouter();
  const list = usePaginatedList("phrases", getPhrasePage, { pageSize: 10 });
  const { selectedIds } = list;
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isChainModalOpen, setIsChainModalOpen] = useState(false);
  const [chainFormError, setChainFormError] = useState<string | null>(null);

  const [description, setDescription] = useState("");
  const [items, setItems] = useState<SequenceEntry[]>([]);

  useEffect(() => {
    getSessionUser().then(setUser);
  }, []);

  const clearForm = () => {
    setDescription("");
    setItems([]);
    setFormError(null);
  };

  const openModal = () => setIsModalOpen(true);

  const missing = [
    !description.trim() && "uma descrição",
    items.length === 0 && "pelo menos um termo",
  ].filter((m): m is string => typeof m === "string");

  const canSave = missing.length === 0;

  const handleCreate = async () => {
    if (!canSave) return;
    const result = await createPhrase({
      description,
      termUuids: items.map((i) => i.termUuid),
    });
    if (result.success) {
      setIsModalOpen(false);
      clearForm();
      list.refresh();
    } else {
      setFormError(result.error ?? "Erro ao criar frase.");
    }
  };

  const handleDelete = async () => {
    const results = await Promise.all(
      selectedIds.map(async (id) => ({
        uuid: String(id),
        result: await deletePhrase(String(id)),
      })),
    );
    const failure = results.find((r) => !r.result.success);
    list.refresh();
    list.setSelectedIds([]);
    setDeleteError(failure?.result.error ?? null);
  };

  return (
    <div className="flex w-full flex-col gap-lg">
      <ListToolbar
        start={
          <Button
            className="my-0 bg-surface-primary outline-1 outline-outline-common "
            onClick={() => {
              setChainFormError(null);
              setIsChainModalOpen(true);
            }}
          >
            <p className="text-gray-600 w-full h-full hover:text-text-on-primary-dark">
              Criar Interação a Partir de Frase
            </p>
          </Button>
        }
        search={
          <SearchBar
            value={list.search}
            onChange={list.setSearch}
            placeholder="Buscar frases"
          />
        }
        end={
          <>
            <AddButton label="Adicionar frase" onClick={openModal} />
            <RemoveButton
              active={selectedIds.length > 0}
              onClick={handleDelete}
            />
          </>
        }
      />
      {deleteError && (
        <p className="text-sm text-red-500 px-lg py-sm border-b border-outline-common">
          {deleteError}
        </p>
      )}
      <div>
        <Table
          selected={list.selectedIds}
          loading={!list.loaded}
          error={list.error}
          data={list.items.map(toRow)}
          page={list.page}
          pageCount={list.pageCount}
          onPageChange={list.setPage}
          columns={[
            { key: "description", label: "Descrição" },
            {
              key: "terms",
              label: "Frase",
              // Capped so a long phrase cannot blow out the row height.
              render: (value) => {
                const placements = value as TermPlacementOutput[];
                const extra = placements.length - PREVIEW_LIMIT;
                return (
                  <div className="flex items-center gap-xs">
                    {placements.slice(0, PREVIEW_LIMIT).map((placement) => (
                      <Image
                        key={placement.uuid}
                        src={placement.pictogram.fileUrl}
                        alt=""
                        width={32}
                        height={32}
                        className="object-contain rounded"
                      />
                    ))}
                    {extra > 0 && (
                      <span className="text-text-on-primary-variant text-body">
                        +{extra}
                      </span>
                    )}
                  </div>
                );
              },
            },
            ...(user?.role === "super_admin"
              ? [
                  {
                    key: "authorUuid" as const,
                    label: "Autor",
                    render: (value: PhraseRow[keyof PhraseRow]) =>
                      (value as string | null) ?? "—",
                  },
                ]
              : []),
            { key: "itemCount", label: "Itens" },
            {
              key: "visibility",
              label: "Status",
              render: (value) => (
                <PhraseVisibilityBadge visibility={value as PhraseVisibility} />
              ),
            },
            { key: "createdAt", label: "Data de Criação" },
          ]}
          onRowClick={(row) => router.push(`/phrases/${row.uuid}`)}
          onSelectionChange={list.setSelectedIds}
        />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          clearForm();
        }}
        title="Nova Frase"
      >
        <div className="flex flex-col gap-md w-250 m-xl mb-xs">
          <Input
            id="description"
            label="Descrição"
            type="text"
            placeholder="ex: Quero beber água"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex flex-row gap-xxl">
            <TermPicker
              onSelect={(term) =>
                setItems((prev) => [...prev, entryFromTerm(term)])
              }
            />
            <PhraseSequenceEditor items={items} onChange={setItems} />
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex items-center justify-end gap-md">
            {!canSave && (
              <p className="text-sm text-text-on-primary-variant text-right">
                Falta escolher {formatList(missing)}.
              </p>
            )}
            <Button
              type="button"
              onClick={handleCreate}
              disabled={!canSave}
              className="disabled:cursor-not-allowed"
            >
              Criar
            </Button>
          </div>
        </div>
      </Modal>

      <CreateInteractionChainModal
        isModalOpen={isChainModalOpen}
        setIsModalOpen={setIsChainModalOpen}
        formError={chainFormError}
        setFormError={setChainFormError}
        triggerKind="phrase"
      />
    </div>
  );
}

export default function PhrasesPage() {
  return (
    <Suspense>
      <Phrases />
    </Suspense>
  );
}
