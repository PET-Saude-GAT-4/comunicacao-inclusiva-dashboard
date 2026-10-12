"use client";

import { useEffect, useRef, useState } from "react";
import AddButton from "@/components/AddButton/AddButton";
import PillTabs from "@/components/PillTabs/PillTabs";
import { TERM_SECTIONS } from "@/config/navigation";
import Modal from "@/components/Modal/Modal";
import Pagination from "@/components/Pagination/Pagination";
import AssetCard from "../components/AssetCard/AssetCard";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import {
  getSignWritings,
  createSignWriting,
  deleteSignWriting,
} from "@/services/sign-writings";
import { SignWritingOutput } from "@/types/sign-writing";
import { getTerms } from "@/services/terms";
import { termBadge, termNamesByPart } from "@/utils/term";
import RemoveButton from "@/components/RemoveButton/RemoveButton";

function SignWritings() {
  const [data, setData] = useState<SignWritingOutput[]>([]);
  // Null until the terms load, so no card claims "Sem termo" too early.
  const [termNames, setTermNames] = useState<Record<string, string[]> | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [description, setDescription] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = () => getSignWritings().then(setData);

  useEffect(() => {
    fetchData();
    getTerms()
      .then((terms) => setTermNames(termNamesByPart(terms, "signWriting")))
      .catch(() => {});
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
    const result = await createSignWriting(formData);
    if (result.success) {
      setIsModalOpen(false);
      setFormError(null);
      setDescription("");
      if (fileRef.current) fileRef.current.value = "";
      fetchData();
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
    // Rows that the API refused to remove stay in the table.
    const removed = results.filter((r) => r.result.success).map((r) => r.uuid);
    const failure = results.find((r) => !r.result.success);
    setData((prev) => prev.filter((item) => !removed.includes(item.uuid)));
    setSelectedIds([]);
    setDeleteError(failure?.result.error ?? null);
  };

  const handleDeleteOne = async (uuid: string) => {
    const result = await deleteSignWriting(uuid);
    if (result.success) {
      setData((prev) => prev.filter((item) => item.uuid !== uuid));
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

  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const pageData = data.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="flex w-full flex-col gap-lg">
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-lg py-md text-text-on-primary">
        <PillTabs label="Termos" pages={TERM_SECTIONS} />
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
          {pageData.map((signWriting) => (
            <div key={signWriting.uuid}>
              {/* SignWritings record no author. */}
              <AssetCard
                title={signWriting.description}
                uuid={signWriting.uuid}
                createdAt={signWriting.createdAt}
                images={[{ src: signWriting.fileUrl, label: "SignWriting" }]}
                badge={
                  termNames ? termBadge(termNames[signWriting.uuid]) : undefined
                }
                authorEmail={null}
                onSelect={() => toggleSelection(signWriting.uuid)}
                onDelete={() => handleDeleteOne(signWriting.uuid)}
                isSelected={selectedIds.includes(signWriting.uuid)}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center py-4 rounded-md outline-1 outline-outline-common bg-white">
          <Pagination
            page={page}
            pageCount={pageCount}
            onPageChange={(nextPage) =>
              setPage(Math.min(Math.max(1, nextPage), pageCount))
            }
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

export default SignWritings;
