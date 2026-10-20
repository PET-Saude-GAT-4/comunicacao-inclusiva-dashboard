"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MdContentPaste } from "react-icons/md";
import TabButton from "@/components/TabButton/TabButton";
import Table from "@/components/Table/Table";
import SearchBar from "@/components/SearchBar/SearchBar";
import ListToolbar from "@/components/ListToolbar/ListToolbar";
import Image from "next/image";
import { getPublicBoards } from "@/services/boards";
import { getSessionUser } from "@/services/auth";
import { BoardOutput } from "@/types/board";
import { PictogramOutput } from "@/types/pictogram";
import { SessionUser } from "@/types/session";
import { boardHref } from "@/utils/board";
import AuthorEmail from "../../components/AuthorEmail/AuthorEmail";

// Defined once so SearchBar, which filters whenever it changes, filters only
// when the list or the query does.
const boardSearchText = (board: BoardOutput) => board.title;

function Library() {
  const router = useRouter();
  const [boards, setBoards] = useState<BoardOutput[]>([]);
  // GET /public/boards is not paginated by design, so this page searches the
  // list it already has instead of asking the API.
  const [filteredBoards, setFilteredBoards] = useState<BoardOutput[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    getPublicBoards().then(setBoards);
    getSessionUser().then(setUser);
  }, []);

  const canReadUsers = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="flex w-full flex-col gap-lg">
      <ListToolbar
        start={
          <nav>
            <TabButton icon={MdContentPaste} active={true} />
          </nav>
        }
        search={
          <SearchBar
            data={boards}
            onResults={setFilteredBoards}
            getSearchText={boardSearchText}
            placeholder="Buscar pranchas"
          />
        }
      />
      <div>
        <Table
          data={filteredBoards}
          columns={[
            { key: "title", label: "Título" },
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
              key: "createdAt",
              label: "Data de Criação",
              render: (value) =>
                new Date(String(value)).toLocaleDateString("pt-BR"),
            },
          ]}
          onRowClick={(board) => router.push(boardHref(board, user))}
        />
      </div>
    </div>
  );
}

export default Library;
