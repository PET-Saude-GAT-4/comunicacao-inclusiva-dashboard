"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddButton from "@/components/AddButton/AddButton";
import Modal from "@/components/Modal/Modal";
import Table from "@/components/Table/Table";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import { getBoards, createBoard, deleteBoard } from "@/services/management";
import { BoardOutput } from "@/utils/definitions";
import Image from "next/image";
import RemoveButton from "@/components/RemoveButton/RemoveButton";

type BoardRow = {
  uuid: string;
  title: string;
  representativeImageUrl: string;
  createdAt: string;
};

function toRow(b: BoardOutput): BoardRow {
  return {
    uuid: b.uuid,
    title: b.title,
    representativeImageUrl: b.representativePictogram.fileUrl,
    createdAt: new Date(b.createdAt).toLocaleDateString("pt-BR"),
  };
}

function Boards() {
  const router = useRouter();
  const [data, setData] = useState<BoardRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [representativeUuid, setRepresentativeUuid] = useState("");
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const fetchData = () => getBoards().then((rows) => setData(rows.map(toRow)));

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!title || !representativeUuid) {
      setFormError(
        "Título e UUID do pictograma representante são obrigatórios.",
      );
      return;
    }
    const result = await createBoard({ title, representativeUuid });
    if (result.success) {
      setIsModalOpen(false);
      setFormError(null);
      setTitle("");
      setRepresentativeUuid("");
      fetchData();
    } else {
      setFormError(result.error ?? "Erro ao criar prancha.");
    }
  };

  const handleDelete = async () => {
    await Promise.all(selectedIds.map((id) => deleteBoard(String(id))));
    setData((prev) => prev.filter((item) => !selectedIds.includes(item.uuid)));
  };

  return (
    <div className="min-h-screen w-full bg-surface-primary">
      <div className="text-text-on-primary border-b border-outline-common text-heading px-lg py-md">
        <p>Pranchas</p>
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
            { key: "uuid", label: "UUID" },
            { key: "title", label: "Título" },
            {
              key: "representativeImageUrl",
              label: "Pictograma Representante",
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
            { key: "createdAt", label: "Data de Criação" },
          ]}
          onRowClick={(row) => router.push(`/boards/${row.uuid}`)}
        />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Prancha"
      >
        <div className="flex flex-col gap-sm">
          <Input
            id="title"
            label="Título"
            type="text"
            placeholder="ex: Rotina matinal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            id="representativeUuid"
            label="UUID do Pictograma Representante"
            type="text"
            placeholder="ex: 550e8400-e29b-41d4-a716-446655440000"
            value={representativeUuid}
            onChange={(e) => setRepresentativeUuid(e.target.value)}
          />
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <Button type="button" onClick={handleCreate}>
            Criar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Boards;
