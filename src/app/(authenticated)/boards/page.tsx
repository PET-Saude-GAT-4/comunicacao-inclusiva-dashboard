"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddButton from "@/components/AddButton/AddButton";
import Modal from "@/components/Modal/Modal";
import Table from "@/components/Table/Table";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import { getBoards, createBoard, deleteBoard } from "@/services/boards";
import { BoardOutput } from "@/utils/definitions";
import Image from "next/image";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import { PictogramOutput } from "@/utils/definitions";
import { getPictograms } from "@/services/pictograms";

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
  const [pictograms, setPictograms] = useState<PictogramOutput[]>([]);

  const [title, setTitle] = useState("");

  const [representativeUuid, setRepresentativeUuid] = useState("");
  const [representativeImageUrl, setRepresentativeImageUrl] = useState("");
  const [representativeDescription, setRepresentativeDescription] =
    useState("");

  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const clearForm = () => {
    setTitle("");
    setRepresentativeUuid("");
    setRepresentativeImageUrl("");
  };

  const fetchData = () => getBoards().then((rows) => setData(rows.map(toRow)));

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!title || !representativeUuid) {
      setFormError(
        "Título e Código do pictograma representante são obrigatórios.",
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
          <div
            id="pictograms"
            className="flex flex-col w-full h-96 overflow-y-auto gap-md"
          >
            <p className="text-text-on-primary sticky top-0 bg-surface-primary pt-0 pb-2 z-10">
              Pictogramas Disponíveis:{" "}
            </p>
            <ul className="flex flex-col gap-md  top-10">
              {pictograms.map((pictogram) => (
                <div
                  key={pictogram.uuid}
                  className="flex flex-row items-center gap-md border border-outline-common rounded-md p-sm justify-between cursor-pointer"
                  onClick={() => {
                    setRepresentativeUuid(pictogram.uuid);
                    setRepresentativeImageUrl(pictogram.fileUrl);
                    setRepresentativeDescription(pictogram.description);
                  }}
                >
                  <Image
                    src={pictogram.fileUrl}
                    alt=""
                    width={50}
                    height={50}
                    className="object-contain rounded"
                  />
                  <p className="text-text-on-primary">
                    {pictogram.description}
                  </p>
                  <AddButton
                    onClick={() => {
                      setRepresentativeUuid(pictogram.uuid);
                      setRepresentativeImageUrl(pictogram.fileUrl);
                    }}
                  />
                </div>
              ))}
            </ul>
          </div>
          <div className="flex flex-col w-full gap-lg">
            <Input
              id="title"
              label="Título:"
              type="text"
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
              value={representativeUuid}
              onChange={(e) => setRepresentativeUuid(e.target.value)}
            />
            <div className="flex w-full justify-center">
              {representativeImageUrl ? (
                <div className="flex flex-col items-center gap-md">
                  <Image
                    src={representativeImageUrl}
                    alt=""
                    width="200"
                    height="200"
                    className="border border-outline-common object-contain rounded-md"
                  />
                  <p className="text-text-on-primary text-center font-bold text-md">
                    {representativeDescription}
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
