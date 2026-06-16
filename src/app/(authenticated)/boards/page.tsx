"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddButton from "@/components/AddButton/AddButton";
import Modal from "@/components/Modal/Modal";
import Table from "@/components/Table/Table";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import { getBoards, createBoard, deleteBoard } from "@/services/boards";
import { getSessionUser } from "@/services/auth";
import { BoardOutput } from "@/types/board";
import { SessionUser } from "@/types/session";
import { boardHref } from "@/utils/board";
import Image from "next/image";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import Badge from "@/components/Badge/Badge";
import { PictogramOutput } from "@/types/pictogram";
import { getPictograms } from "@/services/pictograms";
import PictogramPicker, {
  PictogramInput,
} from "@/components/PictogramPicker/PictogramPicker";

function Boards() {
  const router = useRouter();
  const [data, setData] = useState<BoardOutput[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pictograms, setPictograms] = useState<PictogramOutput[]>([]);

  const [title, setTitle] = useState("");

  const [selectedPictogram, setSelectedPictogram] = useState<PictogramInput>();

  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const clearForm = () => {
    setTitle("");
    setSelectedPictogram(undefined);
  };

  const fetchData = () => getBoards().then(setData);

  useEffect(() => {
    fetchData();
    getSessionUser().then(setUser);
  }, []);

  const handleCreate = async () => {
    if (!title || !selectedPictogram?.uuid) {
      setFormError(
        "Título e Código do pictograma representante são obrigatórios.",
      );
      return;
    }
    const result = await createBoard({
      title: title,
      representativeUuid: selectedPictogram.uuid,
    });
    if (result.success) {
      setIsModalOpen(false);
      clearForm();
      fetchData();
    } else {
      setFormError(result.error ?? "Erro ao criar prancha.");
    }
  };

  const handleDelete = async () => {
    await Promise.all(selectedIds.map((id) => deleteBoard(String(id))));
    setData((prev) => prev.filter((item) => !selectedIds.includes(item.uuid)));
  };

  const listPictograms = async () => {
    getPictograms().then((items) => setPictograms(items));
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full bg-surface-primary">
      <div className="text-text-on-primary border-b border-outline-common text-heading px-lg py-md">
        <p>Pranchas</p>
      </div>
      <div className="flex items-center justify-end p-sm text-text-on-primary border-b border-outline-common">
        <div className="flex">
          <AddButton
            onClick={() => {
              listPictograms();
            }}
          />
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
            { key: "uuid", label: "Código de Prancha" },
            { key: "title", label: "Título" },
            ...(user?.role === "super_admin"
              ? [
                  {
                    key: "authorUuid" as const,
                    label: "Autor",
                    render: (value: BoardOutput[keyof BoardOutput]) =>
                      (value as string | null) ?? "—",
                  },
                ]
              : []),
            {
              key: "representativePictogram",
              label: "Pictograma Representante",
              render: (value) => (
                <Image
                  src={(value as PictogramOutput).fileUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="object-contain rounded"
                />
              ),
            },
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
            {
              key: "createdAt",
              label: "Data de Criação",
              render: (value) =>
                new Date(String(value)).toLocaleDateString("pt-BR"),
            },
          ]}
          onRowClick={(row) => router.push(boardHref(row, user))}
          onSelectionChange={setSelectedIds}
        />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormError(null);
          clearForm();
        }}
        title="Nova Prancha"
      >
        {formError && <p className="text-sm text-red-500">{formError}</p>}
        <div className="flex flex-rol justify-between w-200 gap-xxl m-xl mb-xs">
          <PictogramPicker
            pictograms={pictograms}
            onSelect={setSelectedPictogram}
          />
          <div className="flex flex-col w-full gap-lg">
            <Input
              id="title"
              label="Título:"
              placeholder="ex: Rotina matinal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              id="representativeUuid"
              label="Pictograma Representante"
              type="text"
              disabled
              placeholder="ex: 550e8400-e29b-41d4-a716-446655440000"
              value={selectedPictogram?.uuid || ""}
            />
            <div className="flex w-full justify-center">
              {selectedPictogram ? (
                <div className="flex flex-col items-center gap-md">
                  <Image
                    src={selectedPictogram?.imageUrl}
                    alt=""
                    width="200"
                    height="200"
                    className="border border-outline-common object-contain rounded-md"
                  />
                  <p className="text-text-on-primary text-center font-bold text-md">
                    {selectedPictogram.description}
                  </p>
                </div>
              ) : (
                <div className="border border-outline-common flex items-center rounded-md w-50 h-50">
                  <p className="text-text-on-primary text-center font-bold text-md">
                    Nenhum pictograma selecionado.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-md">
          <Button type="button" onClick={handleCreate}>
            Criar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Boards;
