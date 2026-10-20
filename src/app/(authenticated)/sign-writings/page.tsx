"use client";

import { Suspense, useRef, useState } from "react";
import AddButton from "@/components/AddButton/AddButton";
import PillTabs from "@/components/PillTabs/PillTabs";
import { TERM_SECTIONS } from "@/config/navigation";
import Modal from "@/components/Modal/Modal";
import Pagination from "@/components/Pagination/Pagination";
import SearchBar from "@/components/SearchBar/SearchBar";
import ListToolbar from "@/components/ListToolbar/ListToolbar";
import ListStatus from "@/components/ListStatus/ListStatus";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import AssetCard from "../components/AssetCard/AssetCard";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import {
  getSignWritingPage,
  createSignWriting,
  deleteSignWriting,
} from "@/services/sign-writings";
import { termBadge } from "@/utils/term";
import RemoveButton from "@/components/RemoveButton/RemoveButton";

function SignWritings() {
  const list = usePaginatedList("signWritings", getSignWritingPage, {
    pageSize: 12,
  });
  const { selectedIds, setSelectedIds } = list;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [description, setDescription] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    const file = fileRef.current?.files?.[0];
    if (!description || !file) {
      setFormError("Descrição e imagem são obrigatórias.");
      return;
    }
    const formData = new FormData();
    formData.append("description", description);
    formData.append("image", file);
    const result = await createSignWriting(formData);
    if (result.success) {
      setIsModalOpen(false);
      setFormError(null);
      setDescription("");
      if (fileRef.current) fileRef.current.value = "";
      list.refresh();
    } else {
      setFormError(result.error ?? "Erro ao criar SignWriting.");
    }
  };

  const handleDelete = async () => {
    const results = await Promise.all(
      selectedIds.map(async (id) => ({
        uuid: String(id),
        result: await deleteSignWriting(String(id)),
      })),
    );
    const failure = results.find((r) => !r.result.success);
    list.refresh();
    setSelectedIds([]);
    setDeleteError(failure?.result.error ?? null);
  };

  const handleDeleteOne = async (uuid: string) => {
    const result = await deleteSignWriting(uuid);
    if (result.success) {
      list.refresh();
      setSelectedIds((prev) =>
        prev.filter((selectedId) => selectedId !== uuid),
      );
    }
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
      <ListToolbar
        start={<PillTabs label="Termos" pages={TERM_SECTIONS} />}
        search={
          <SearchBar
            value={list.search}
            onChange={list.setSearch}
            placeholder="Buscar SignWritings"
          />
        }
        end={
          <>
            <AddButton
              label="Adicionar SignWriting"
              onClick={() => setIsModalOpen(true)}
            />
            <RemoveButton
              active={selectedIds.length > 0}
              onClick={handleDelete}
            />
          </>
        }
      />
      {deleteError && (
        <p className="px-4 text-sm text-red-500">{deleteError}</p>
      )}
      <div className="flex flex-col">
        <div className="grid grid-cols-6 gap-4 p-4">
          {list.items.map((signWriting) => (
            <div key={signWriting.uuid}>
              {/* SignWritings record no author. */}
              <AssetCard
                title={signWriting.description}
                uuid={signWriting.uuid}
                createdAt={signWriting.createdAt}
                images={[{ src: signWriting.fileUrl, label: "SignWriting" }]}
                badge={termBadge(signWriting.terms)}
                authorEmail={null}
                onSelect={() => toggleSelection(signWriting.uuid)}
                onDelete={() => handleDeleteOne(signWriting.uuid)}
                isSelected={selectedIds.includes(signWriting.uuid)}
              />
            </div>
          ))}
        </div>
        <ListStatus
          loaded={list.loaded}
          error={list.error}
          isEmpty={list.items.length === 0}
        />
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
        title="Novo SignWriting"
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

export default function SignWritingsPage() {
  return (
    <Suspense>
      <SignWritings />
    </Suspense>
  );
}
