"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AddButton from "@/components/AddButton/AddButton";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import Modal from "@/components/Modal/Modal";
import Table from "@/components/Table/Table";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import Badge from "@/components/Badge/Badge";
import TermPicker from "@/components/TermPicker/TermPicker";
import PhraseSequenceEditor, {
  SequenceEntry,
  entryFromTerm,
} from "@/components/PhraseSequenceEditor/PhraseSequenceEditor";
import { getPhrases, createPhrase, deletePhrase } from "@/services/phrases";
import { getTerms } from "@/services/terms";
import { getSessionUser } from "@/services/auth";
import { PhraseOutput } from "@/types/phrase";
import { TermOutput, TermPlacementOutput } from "@/types/term";
import { SessionUser } from "@/types/session";
import { formatList } from "@/utils/text";

const PREVIEW_LIMIT = 4;

type PhraseRow = {
  uuid: string;
  description: string;
  terms: TermPlacementOutput[];
  authorUuid: string | null;
  itemCount: number;
  publishedAt: string | null;
  createdAt: string;
};

function toRow(p: PhraseOutput): PhraseRow {
  return {
    uuid: p.uuid,
    description: p.description,
    terms: p.terms,
    authorUuid: p.authorUuid,
    itemCount: p.terms.length,
    publishedAt: p.publishedAt,
    createdAt: new Date(p.createdAt).toLocaleDateString("pt-BR"),
  };
}

function Phrases() {
  const router = useRouter();
  const [data, setData] = useState<PhraseRow[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const [description, setDescription] = useState("");
  const [items, setItems] = useState<SequenceEntry[]>([]);
  const [terms, setTerms] = useState<TermOutput[]>([]);

  const fetchData = () => getPhrases().then((rows) => setData(rows.map(toRow)));

  useEffect(() => {
    fetchData();
    getSessionUser().then(setUser);
  }, []);

  const clearForm = () => {
    setDescription("");
    setItems([]);
    setFormError(null);
  };

  const openModal = () => {
    getTerms().then(setTerms);
    setIsModalOpen(true);
  };

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
      fetchData();
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
    // Rows that the API refused to remove stay in the table.
    const removed = results.filter((r) => r.result.success).map((r) => r.uuid);
    const failure = results.find((r) => !r.result.success);
    setData((prev) => prev.filter((item) => !removed.includes(item.uuid)));
    setSelectedIds([]);
    setDeleteError(failure?.result.error ?? null);
  };

  return (
    <div className="min-h-screen w-full bg-surface-primary">
      <div className="text-text-on-primary border-b border-outline-common text-heading px-lg py-md">
        <p>Frases</p>
      </div>
      <div className="flex items-center justify-end p-sm text-text-on-primary border-b border-outline-common">
        <div className="flex">
          <AddButton onClick={openModal} />
          <RemoveButton
            active={selectedIds.length > 0}
            onClick={handleDelete}
          />
        </div>
      </div>
      {deleteError && (
        <p className="text-sm text-red-500 px-lg py-sm border-b border-outline-common">
          {deleteError}
        </p>
      )}
      <div className="flex-1">
        <Table
          data={data}
          columns={[
            { key: "uuid", label: "Código de Frase" },
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
              key: "publishedAt",
              label: "Status",
              render: (value) =>
                value ? (
                  <Badge>Público</Badge>
                ) : (
                  <Badge variant="neutral">Não publicado</Badge>
                ),
            },
            { key: "createdAt", label: "Data de Criação" },
          ]}
          onRowClick={(row) => router.push(`/phrases/${row.uuid}`)}
          onSelectionChange={setSelectedIds}
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
              terms={terms}
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
    </div>
  );
}

export default Phrases;
