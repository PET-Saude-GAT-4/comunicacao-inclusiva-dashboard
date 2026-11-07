"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Table from "@/components/Table/Table";
import SearchBar from "@/components/SearchBar/SearchBar";
import ListToolbar from "@/components/ListToolbar/ListToolbar";
import Dropdown from "@/components/Dropdown/Dropdown";
import Badge from "@/components/Badge/Badge";
import Thumbnail from "@/components/Thumbnail/Thumbnail";
import { getPublicBoards } from "@/services/boards";
import { getSessionUser } from "@/services/auth";
import {
  BOARD_TYPE_LABELS,
  BOARD_TYPES,
  BoardType,
  PublicBoardOutput,
} from "@/types/board";
import { PictogramOutput } from "@/types/pictogram";
import { SessionUser } from "@/types/session";
import AuthorEmail from "../../components/AuthorEmail/AuthorEmail";

// Defined once so SearchBar, which filters whenever it changes, filters only
// when the list or the query does.
const boardSearchText = (board: PublicBoardOutput) => board.title;

function Library() {
  const router = useRouter();
  const [boards, setBoards] = useState<PublicBoardOutput[]>([]);
  // GET /public/boards is not paginated by design, so this page loads every
  // type once and filters and searches that list instead of asking the API.
  const [filteredBoards, setFilteredBoards] = useState<PublicBoardOutput[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [typeFilter, setTypeFilter] = useState<BoardType | "all">("all");

  // Memoized so SearchBar gets a new list only when the boards or the type
  // change, and keeps the query applied on top of the type.
  const boardsOfType = useMemo(
    () =>
      typeFilter === "all"
        ? boards
        : boards.filter((board) => board.type === typeFilter),
    [boards, typeFilter],
  );

  useEffect(() => {
    getPublicBoards().then(setBoards);
    getSessionUser().then(setUser);
  }, []);

  const canReadUsers = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="flex w-full flex-col gap-lg">
      <ListToolbar
        search={
          <SearchBar
            data={boardsOfType}
            onResults={setFilteredBoards}
            getSearchText={boardSearchText}
            placeholder="Buscar pranchas"
          />
        }
        end={
          <div className="w-48">
            <Dropdown<BoardType | "all">
              id="typeFilter"
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: "all", label: "Todos os tipos" },
                ...BOARD_TYPES.map((type) => ({
                  value: type,
                  label: BOARD_TYPE_LABELS[type],
                })),
              ]}
            />
          </div>
        }
      />
      <div>
        <Table
          data={filteredBoards}
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
            {
              key: "authorUuid",
              label: "Autor",
              render: (_value, board) => (
                <AuthorEmail uuid={board.authorUuid} lookup={canReadUsers} />
              ),
            },
            {
              key: "representativePictogram",
              label: "Pictograma Representante",
              render: (value) => (
                <Thumbnail
                  src={(value as PictogramOutput).fileUrl}
                  size={40}
                  className="rounded"
                />
              ),
            },
            {
              key: "createdAt",
              label: "Data de Criação",
              render: (value) =>
                new Date(String(value)).toLocaleDateString("pt-BR"),
            },
          ]}
          // Always the read-only view, even for a board the user may edit, so
          // the library stays open in the side panel; editing is in Pranchas.
          onRowClick={(board) => router.push(`/library/boards/${board.uuid}`)}
        />
      </div>
    </div>
  );
}

export default Library;
