"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import AddButton from "@/components/AddButton/AddButton";
import Modal from "@/components/Modal/Modal";
import Table from "@/components/Table/Table";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import { getPictograms, createPictogram, deletePictogram } from "@/services/pictograms";
import { PictogramOutput } from "@/utils/definitions";
import Image from "next/image";
import RemoveButton from "@/components/RemoveButton/RemoveButton";

type PictogramRow = {
  uuid: string;
  imageUrl: string;
  description: string;
  createdAt: string;
};

function toRow(p: PictogramOutput): PictogramRow {
  return {
    uuid: p.uuid,
    imageUrl: p.fileUrl,
    description: p.description,
    createdAt: new Date(p.createdAt).toLocaleDateString("pt-BR"),
  };
}

function Pictograms() {
  const [data, setData] = useState<PictogramRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const [description, setDescription] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = () =>
    getPictograms().then((rows) => setData(rows.map(toRow)));

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

  return (
    <div className="min-h-screen w-full bg-surface-primary">
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
      <div className="flex-1">
        <Table
          data={data}
          columns={[
            { key: "uuid", label: "Código de Pictograma" },
            {
              key: "imageUrl",
              label: "Imagem",
              render: (value) => (
                <Image
                  src={String(value)}
                  alt=""
                  width={40}
                  height={40}
                  className="object-contain rounded"
                />
              ),
            },
            { key: "description", label: "Descrição" },
            { key: "createdAt", label: "Data de Criação" },
          ]}
          onSelectionChange={setSelectedIds}
        />
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
