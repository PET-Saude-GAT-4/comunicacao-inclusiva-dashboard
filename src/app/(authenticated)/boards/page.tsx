"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddButton from "@/components/AddButton/AddButton";
import Modal from "@/components/Modal/Modal";
import Table from "@/components/Table/Table";
import Input from "@/components/Input/Input"; 
import Button from "@/components/Button/Button";
import { getBoards, createBoard, deleteBoard } from "@/services/boards";
import { getUsers } from "@/services/users";
import { getSessionUser } from "@/services/auth";
import {
  BOARD_TYPE_LABELS,
  BOARD_TYPES,
  BoardOutput,
  BoardType,
} from "@/types/board";
import { SessionUser } from "@/types/session";
import { boardHref } from "@/utils/board";
import Image from "next/image";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import Badge from "@/components/Badge/Badge";
import { PictogramOutput } from "@/types/pictogram";
import { getPictograms } from "@/services/pictograms";
import AssetPicker, { Asset } from "@/components/AssetPicker/AssetPicker";
import CreateInteractionChainModal from "../components/CreateInteractionChainModal/CreateInteractionChainModal";
import { MdPerson } from "react-icons/md";

function Boards() {
  const router = useRouter();
  const [data, setData] = useState<BoardOutput[]>([]);
  const [authorEmails, setAuthorEmails] = useState<Record<string, string>>({});
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);

  const [
    isCreateInteractionChainModalOpen,
    setIsCreateInteractionChainModalOpen,
  ] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [pictograms, setPictograms] = useState<PictogramOutput[]>([]);

  const [title, setTitle] = useState("");
  const [boardType, setBoardType] = useState<BoardType>("common");

  const [selectedPictogram, setSelectedPictogram] = useState<Asset>();

  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const [typeFilter, setTypeFilter] = useState<BoardType | "all">("all");
  const visibleBoards =
    typeFilter === "all"
      ? data
      : data.filter((board) => board.type === typeFilter);

  // Remounting the table (keyed on the filter below) resets its page and
  // selection, so a delete never reaches rows the filter is hiding.
  const changeTypeFilter = (value: BoardType | "all") => {
    setTypeFilter(value);
    setSelectedIds([]);
  };

  const clearForm = () => {
    setTitle("");
    setBoardType("common");
    setSelectedPictogram(undefined);
  };

  const fetchData = () => getBoards().then(setData);

  useEffect(() => {
    fetchData();
    getSessionUser().then((sessionUser) => {
      setUser(sessionUser);
      if (sessionUser?.role === "super_admin") {
        getUsers()
          .catch(() => [])
          .then((users) =>
            setAuthorEmails(
              Object.fromEntries(
                users.map((author) => [author.uuid, author.email]),
              ),
            ),
          );
      }
    });
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
      type: boardType,
      representativeUuid: selectedPictogram.uuid,
    });
    if (result.success) {
      setIsCreateBoardModalOpen(false);
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
    setIsCreateBoardModalOpen(true);
  };

  return (
    <div className="flex w-full flex-col gap-lg">
      <div className="flex items-center justify-end rounded-lg border border-gray-200 bg-white px-lg py-md text-text-on-primary">
        <div className="flex justify-between w-full">
          <Button
            className="bg-surface-primary outline-1 outline-outline-common "
            onClick={() => setIsCreateInteractionChainModalOpen(true)}
          >
            <p className="text-gray-600 w-full h-full hover:text-text-on-primary-dark">
              Criar Interação Entre Pranchas
            </p>
          </Button>
          <div className=" flex items-center justify-center ">
            <label className="sr-only" htmlFor="typeFilter">
              Filtrar por tipo
            </label>
            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(e) =>
                changeTypeFilter(e.target.value as BoardType | "all")
              }
              className="mr-md focus:outline-none focus:ring-1 focus:ring-primary-dark text-text-on-primary p-sm px-lg bg-gray-100 outline-1 outline-gray-200 rounded-md"
            >
              <option value="all">Todos os tipos</option>
              {BOARD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {BOARD_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
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
      </div>
      <div>
        <Table
          key={typeFilter}
          data={visibleBoards}
          columns={[
            { key: "title", label: "Título" },
            {
              key: "type",
              label: "Tipo",
              render: (value) => (
                <Badge
                  variant={value === "emergency" ? "warning" : "secondary"}
                >
                  {BOARD_TYPE_LABELS[value as BoardType]}
                </Badge>
              ),
            },
            ...(user?.role === "super_admin"
              ? [
                  {
                    key: "authorUuid" as const,
                    label: "Autor",
                    render: (
                      _value: BoardOutput[keyof BoardOutput],
                      row: BoardOutput,
                    ) => (
                      <div className="flex items-center gap-sm">
                        <MdPerson className="text-gray-400" size={18} />
                        <p>
                          {authorEmails[row.authorUuid ?? ""] ?? "Desconhecido"}
                        </p>
                      </div>
                    ),
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
        isOpen={isCreateBoardModalOpen}
        onClose={() => {
          setIsCreateBoardModalOpen(false);
          setFormError(null);
          clearForm();
        }}
        title="Nova Prancha"
      >
        {formError && <p className="text-sm text-red-500">{formError}</p>}
        <div className="flex flex-rol justify-between w-200 gap-xxl m-xl mb-xs">
          <AssetPicker items={pictograms} onSelect={setSelectedPictogram} />
          <div className="flex flex-col w-full gap-lg">
            <Input
              id="title"
              label="Título:"
              placeholder="ex: Rotina matinal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex flex-col">
              <label className="text-text-on-primary" htmlFor="boardType">
                Tipo:
              </label>
              <select
                id="boardType"
                value={boardType}
                onChange={(e) => setBoardType(e.target.value as BoardType)}
                className="focus:outline-none focus:ring-1 focus:ring-primary-dark text-text-on-primary p-sm px-lg bg-gray-100 outline-1 outline-gray-200 rounded-md"
              >
                {BOARD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {BOARD_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
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
                    src={selectedPictogram?.fileUrl}
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
      <CreateInteractionChainModal
        isModalOpen={isCreateInteractionChainModalOpen}
        setIsModalOpen={setIsCreateInteractionChainModalOpen}
        triggerKind="board"
        formError={formError}
        setFormError={setFormError}
      ></CreateInteractionChainModal>
    </div>
  );
}

export default Boards;
