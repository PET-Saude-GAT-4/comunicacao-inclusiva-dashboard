"use client";

import { useEffect, useRef, useState } from "react";
import AddButton from "@/components/AddButton/AddButton";
import Modal from "@/components/Modal/Modal";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import Pagination from "@/components/Pagination/Pagination";
import {
  getPictograms,
  createPictogram,
  deletePictogram,
} from "@/services/pictograms";
import { PictogramOutput } from "@/types/pictogram";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import PictogramCard from "../components/PictogramCard/PictogramCard";

function Pictograms() {
  const [data, setData] = useState<PictogramOutput[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [description, setDescription] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = () =>
    getPictograms().then((pictograms) => setData(pictograms));

  useEffect(() => {
    fetchData();
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
      fetchData();
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
    const deletedIds = results
      .filter(({ result }) => result.success)
      .map(({ id }) => id);
    const failure = results.find(({ result }) => !result.success);

    setData((prev) => prev.filter((item) => !deletedIds.includes(item.uuid)));
    setSelectedIds((prev) =>
      prev.filter((id) => !deletedIds.includes(String(id))),
    );
    setDeleteError(failure?.result.error ?? null);
  };

  const handleDeleteOne = async (uuid: string) => {
    const result = await deletePictogram(uuid);
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
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-end p-sm text-text-on-primary">
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
          {pageData.map((pictogram) => (
            <div key={pictogram.uuid}>
              <PictogramCard
                pictogram={pictogram}
                onSelect={() => toggleSelection(pictogram.uuid)}
                onDelete={() => handleDeleteOne(pictogram.uuid)}
                isSelected={selectedIds.includes(pictogram.uuid)}
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

export default Pictograms;
