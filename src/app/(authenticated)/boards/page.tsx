"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddButton from "@/components/AddButton/AddButton";
import Modal from "@/components/Modal/Modal";
import Table from "@/components/Table/Table";
import SearchBar from "@/components/SearchBar/SearchBar";
import ListToolbar from "@/components/ListToolbar/ListToolbar";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import Dropdown from "@/components/Dropdown/Dropdown";
import { getBoardPage, createBoard, deleteBoard } from "@/services/boards";
import { getSessionUser } from "@/services/auth";
import {
  BOARD_TYPE_LABELS,
  BOARD_TYPES,
  BoardOutput,
  BoardType,
} from "@/types/board";
import { SessionUser } from "@/types/session";
import { ListQuery } from "@/types/common";
import { boardHref } from "@/utils/board";
import Image from "next/image";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import Badge from "@/components/Badge/Badge";
import { PictogramOutput } from "@/types/pictogram";
import { getPictogramPage } from "@/services/pictograms";
import AssetPicker, { Asset } from "@/components/AssetPicker/AssetPicker";
import CreateInteractionChainModal from "../components/CreateInteractionChainModal/CreateInteractionChainModal";
import AuthorEmail from "../components/AuthorEmail/AuthorEmail";

// The type comes from the URL, so anything other than a known type is dropped
// instead of reaching the API as a 400.
function fetchBoardPage(
  query: ListQuery,
  filters: Record<string, string | undefined>,
) {
  return getBoardPage(query, {
    type: BOARD_TYPES.find((type) => type === filters.type),
  });
}

function Boards() {
  const router = useRouter();
  const list = usePaginatedList("boards", fetchBoardPage, {
    pageSize: 10,
    filterKeys: ["type"],
  });
  const { selectedIds } = list;
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);

  const [
    isCreateInteractionChainModalOpen,
    setIsCreateInteractionChainModalOpen,
  ] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [boardType, setBoardType] = useState<BoardType>("common");

  const [selectedPictogram, setSelectedPictogram] = useState<Asset>();

  const typeFilter: BoardType | "all" =
    BOARD_TYPES.find((type) => type === list.filters.type) ?? "all";

  const changeTypeFilter = (value: BoardType | "all") =>
    list.setFilter("type", value === "all" ? undefined : value);

  const clearForm = () => {
    setTitle("");
    setBoardType("common");
    setSelectedPictogram(undefined);
  };

  useEffect(() => {
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
      type: boardType,
      representativeUuid: selectedPictogram.uuid,
    });
    if (result.success) {
      setIsCreateBoardModalOpen(false);
      clearForm();
      list.refresh();
    } else {
      setFormError(result.error ?? "Erro ao criar prancha.");
    }
  };

  const handleDelete = async () => {
    setDeleteError(null);
    const results = await Promise.all(
      selectedIds.map((id) => deleteBoard(String(id))),
    );

    // A board the API refused to delete, like one at a triage level, stays
    // in the refetched page and the error says why.
    list.refresh();
    list.setSelectedIds([]);

    const failure = results.find((result) => !result.success);
    if (failure) {
      setDeleteError(failure.error ?? "Erro ao remover pranchas.");
    }
  };

  return (
    <div className="flex w-full flex-col gap-lg">
      <ListToolbar
        start={
          // Button sets my-md, and a plain my-0 loses to it in the generated CSS.
          <Button
            className="my-0! bg-surface-primary outline-1 outline-outline-common "
            onClick={() => setIsCreateInteractionChainModalOpen(true)}
          >
            <p className="text-gray-600 w-full h-full hover:text-text-on-primary-dark">
              Criar Interação Entre Pranchas
            </p>
          </Button>
        }
        search={
          <SearchBar
            value={list.search}
            onChange={list.setSearch}
            placeholder="Buscar pranchas"
          />
        }
        end={
          <>
            <div className="mr-md w-48">
              <Dropdown<BoardType | "all">
                id="typeFilter"
                value={typeFilter}
                onChange={changeTypeFilter}
                options={[
                  { value: "all", label: "Todos os tipos" },
                  ...BOARD_TYPES.map((type) => ({
                    value: type,
                    label: BOARD_TYPE_LABELS[type],
                  })),
                ]}
              />
            </div>
            <AddButton
              label="Adicionar prancha"
              onClick={() => setIsCreateBoardModalOpen(true)}
            />
            <RemoveButton
              active={selectedIds.length > 0}
              onClick={handleDelete}
            />
          </>
        }
      />
      {deleteError && (
        <p className="text-sm text-red-500 px-lg py-sm">{deleteError}</p>
      )}
      <div>
        <Table
          selected={list.selectedIds}
          loading={!list.loaded}
          error={list.error}
          data={list.items}
          page={list.page}
          pageCount={list.pageCount}
          onPageChange={list.setPage}
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
                    ) => <AuthorEmail uuid={row.authorUuid} />,
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
          onSelectionChange={list.setSelectedIds}
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
          <AssetPicker
            listKey="pictograms"
            fetchPage={getPictogramPage}
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
            <Dropdown<BoardType>
              id="boardType"
              label="Tipo:"
              value={boardType}
              onChange={setBoardType}
              options={BOARD_TYPES.map((type) => ({
                value: type,
                label: BOARD_TYPE_LABELS[type],
              }))}
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

export default function BoardsPage() {
  return (
    <Suspense>
      <Boards />
    </Suspense>
  );
}
