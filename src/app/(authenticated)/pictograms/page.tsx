"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import AddButton from "@/components/AddButton/AddButton";
import PillTabs from "@/components/PillTabs/PillTabs";
import { TERM_SECTIONS } from "@/config/navigation";
import Modal from "@/components/Modal/Modal";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import Pagination from "@/components/Pagination/Pagination";
import SearchBar from "@/components/SearchBar/SearchBar";
import {
  getPictogramPage,
  createPictogram,
  deletePictogram,
} from "@/services/pictograms";
import { getUsers } from "@/services/users";
import { getTerms } from "@/services/terms";
import { termBadge, termNamesByPart } from "@/utils/term";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import AssetCard from "../components/AssetCard/AssetCard";
import { usePaginatedList } from "@/hooks/usePaginatedList";

function Pictograms() {
  const list = usePaginatedList("pictograms", getPictogramPage, {
    pageSize: 12,
  });
  const { selectedIds, setSelectedIds } = list;
  const [authorEmails, setAuthorEmails] = useState<Record<string, string>>({});
  // Null until the terms load, so no card claims "Sem termo" too early.
  const [termNames, setTermNames] = useState<Record<string, string[]> | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [description, setDescription] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getTerms()
      .then((terms) => setTermNames(termNamesByPart(terms, "pictogram")))
      .catch(() => {});
    getUsers()
      .catch(() => [])
      .then((users) =>
        setAuthorEmails(
          Object.fromEntries(
            users.map((author) => [author.uuid, author.email]),
          ),
        ),
      );
  }, []);

  const handleCreate = async () => {
    const file = fileRef.current?.files?.[0];
    if (!description || !file) {
      setFormError("Descrição e imagem são obrigatórias.");
      return;
    }
    const formData = new FormData();
    formData.append("description", description);
    formData.append("image", file);
    const result = await createPictogram(formData);
    if (result.success) {
      setIsModalOpen(false);
      setFormError(null);
      setDescription("");
      if (fileRef.current) fileRef.current.value = "";
      list.refresh();
    } else {
      setFormError(result.error ?? "Erro ao criar pictograma.");
    }
  };

  const handleDelete = async () => {
    const results = await Promise.all(
      selectedIds.map(async (id) => ({
        id: String(id),
        result: await deletePictogram(String(id)),
      })),
    );
    const failure = results.find(({ result }) => !result.success);

    list.refresh();
    setDeleteError(failure?.result.error ?? null);
  };

  const handleDeleteOne = async (uuid: string) => {
    const result = await deletePictogram(uuid);
    if (result.success) list.refresh();
    setDeleteError(result.success ? null : (result.error ?? null));
  };

  const toggleSelection = (uuid: string) => {
    setSelectedIds((prev) =>
      prev.includes(uuid)
        ? prev.filter((selectedId) => selectedId !== uuid)
        : [...prev, uuid],
    );
  };

  return (
    <div className="flex w-full flex-col gap-lg">
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-lg py-md text-text-on-primary">
        <PillTabs label="Termos" pages={TERM_SECTIONS} />
        <div className="mx-lg w-100">
          <SearchBar
            value={list.search}
            onChange={list.setSearch}
            placeholder="Buscar pictogramas"
          />
        </div>
        <div className="flex">
          <AddButton onClick={() => setIsModalOpen(true)} />
          <RemoveButton
            active={selectedIds.length > 0}
            onClick={handleDelete}
          />
        </div>
      </div>
      {deleteError && (
        <p className="px-4 text-sm text-red-500">{deleteError}</p>
      )}
      <div className="flex flex-col">
        <div className="grid grid-cols-6 gap-4 p-4">
          {list.items.map((pictogram) => (
            <div key={pictogram.uuid}>
              <AssetCard
                title={pictogram.description}
                uuid={pictogram.uuid}
                createdAt={pictogram.createdAt}
                images={[{ src: pictogram.fileUrl, label: "Pictograma" }]}
                badge={
                  termNames ? termBadge(termNames[pictogram.uuid]) : undefined
                }
                authorEmail={authorEmails[pictogram.authorUuid ?? ""] ?? null}
                onSelect={() => toggleSelection(pictogram.uuid)}
                onDelete={() => handleDeleteOne(pictogram.uuid)}
                isSelected={selectedIds.includes(pictogram.uuid)}
              />
            </div>
          ))}
        </div>
        {list.loaded && list.items.length === 0 && (
          <p className="py-lg text-center text-text-secondary">
            Nenhum item encontrado
          </p>
        )}
        <div className="flex items-center justify-center py-4 rounded-md outline-1 outline-outline-common bg-white">
          <Pagination
            page={list.page}
            pageCount={list.pageCount}
            onPageChange={list.setPage}
          />
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Pictograma"
      >
        <div className="flex flex-col gap-sm">
          <Input
            id="description"
            label="Descrição"
            type="text"
            placeholder="ex: Cachorro"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex flex-col">
            <label className="text-text-on-primary" htmlFor="file">
              Imagem
            </label>
            <input
              id="file"
              type="file"
              accept="image/*"
              ref={fileRef}
              className="focus:outline-none focus:ring-1 focus:ring-primary-dark text-text-on-primary p-sm px-lg my-xs bg-surface-secondary rounded-lg"
            />
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <Button type="button" onClick={handleCreate}>
            Criar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function PictogramsPage() {
  return (
    <Suspense>
      <Pictograms />
    </Suspense>
  );
}
