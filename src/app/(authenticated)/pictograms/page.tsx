"use client";

import { useEffect, useRef, useState } from "react";
import AddButton from "@/components/AddButton/AddButton";
import Modal from "@/components/Modal/Modal";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import {
  getPictograms,
  createPictogram,
  deletePictogram,
} from "@/services/pictograms";
import { PictogramOutput } from "@/types/pictogram";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import PictogramCard from "../components/PictogramCard/PictogramCard";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

function Pictograms() {
  const [data, setData] = useState<PictogramOutput[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
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
    await Promise.all(selectedIds.map((id) => deletePictogram(String(id))));
    setData((prev) => prev.filter((item) => !selectedIds.includes(item.uuid)));
    setSelectedIds([]);
  };

  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const pageData = data.slice((page - 1) * pageSize, page * pageSize);
  const goToPage = (n: number) => setPage(Math.min(Math.max(1, n), pageCount));

  return (
    <div className="h-full w-full bg-surface-primary flex flex-col">
      <div className="text-text-on-primary border-b border-outline-common text-heading px-lg py-md">
        <p>Pictogramas</p>
      </div>
      <div className="flex items-center justify-end p-sm text-text-on-primary border-b border-outline-common">
        <div className="flex">
          <AddButton onClick={() => setIsModalOpen(true)} />
          <RemoveButton
            active={selectedIds.length > 0}
            onClick={handleDelete}
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="grid grid-cols-3 grid-rows-4 gap-4 p-4 h-fit">
          {pageData.map((pictogram) => (
            <div key={pictogram.uuid}>
              <PictogramCard pictogram={pictogram} />
            </div>
          ))}
        </div>

        {pageCount > 1 && (
          <div className="flex items-center justify-center gap-1 border-t border-outline-common py-sm text-body-emph bg-surface-primary">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              aria-label="Página anterior"
              className="grid h-8 w-8 place-items-center rounded-sm text-text-on-primary-variant hover:bg-surface-secondary disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <MdChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-0.5">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => goToPage(n)}
                  aria-current={n === page ? "page" : undefined}
                  className={[
                    "grid h-8 min-w-8 place-items-center rounded-sm px-2 text-body transition-colors",
                    n === page
                      ? "font-bold text-primary-dark"
                      : "font-regular text-text-on-primary-variant hover:bg-surface-secondary",
                  ].join(" ")}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page === pageCount}
              aria-label="Próxima página"
              className="grid h-8 w-8 place-items-center rounded-sm text-text-on-primary-variant hover:bg-surface-secondary disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <MdChevronRight size={20} />
            </button>
          </div>
        )}
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
