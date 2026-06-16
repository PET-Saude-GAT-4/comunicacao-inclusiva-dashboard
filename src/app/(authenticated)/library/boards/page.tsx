"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MdContentPaste } from "react-icons/md";
import TabButton from "@/components/TabButton/TabButton";
import Table from "@/components/Table/Table";
import Image from "next/image";
import { getPublicBoards } from "@/services/boards";
import { getSessionUser } from "@/services/auth";
import { BoardOutput } from "@/types/board";
import { PictogramOutput } from "@/types/pictogram";
import { SessionUser } from "@/types/session";
import { boardHref } from "@/utils/board";

function Library() {
  const router = useRouter();
  const [boards, setBoards] = useState<BoardOutput[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    getPublicBoards().then(setBoards);
    getSessionUser().then(setUser);
  }, []);

  return (
    <div className="min-h-screen w-full bg-surface-primary">
      <div className="text-text-on-primary border-b border-outline-common text-heading px-lg py-md">
        <p>Pranchas</p>
      </div>
      <div className="flex items-center justify-between p-sm text-text-on-primary border-b border-outline-common">
        <nav className="flex justify-between">
          <TabButton icon={MdContentPaste} active={true} />
        </nav>
        <div className="flex w-full justify-around">{/* <SearchBar/> */}</div>
      </div>
      <div className="flex-1">
        <Table
          data={boards}
          columns={[
            { key: "uuid", label: "Código de Prancha" },
            { key: "title", label: "Título" },
            {
              key: "authorUuid",
              label: "Autor",
              render: (value) => (value as string | null) ?? "—",
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
