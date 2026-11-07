"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Thumbnail from "@/components/Thumbnail/Thumbnail";
import { MdPermMedia } from "react-icons/md";
import { getPublicBoard, getPublicBoardTerms } from "@/services/boards";
import { getSessionUser } from "@/services/auth";
import { BOARD_TYPE_LABELS, PublicBoardOutput } from "@/types/board";
import { BoardTermOutput } from "@/types/term";
import { SessionUser } from "@/types/session";
import Badge from "@/components/Badge/Badge";
import CopyableUuid from "@/components/CopyableUuid/CopyableUuid";
import SearchBar from "@/components/SearchBar/SearchBar";
import AuthorEmail from "../../../components/AuthorEmail/AuthorEmail";

// The board screen from Pranchas, without what edits the board: no
// publishing, adding, removing, reordering, type changes or interactions.
function ReadonlyBoardDetail() {
  const params = useParams();
  const uuid = String(params.uuid);

  const [board, setBoard] = useState<PublicBoardOutput | null>(null);
  const [items, setItems] = useState<BoardTermOutput[]>([]);
  const [filteredItems, setFilteredItems] = useState<BoardTermOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);

  const getTermSearchText = useCallback(
    (item: BoardTermOutput) => item.description,
    [],
  );

  useEffect(() => {
    Promise.all([getPublicBoard(uuid), getPublicBoardTerms(uuid)])
      .then(([boardData, termsData]) => {
        setBoard(boardData);
        setItems(termsData);
        setFilteredItems(termsData);
      })
      .catch(() => setBoard(null))
      .finally(() => setLoading(false));
    getSessionUser().then(setUser);
  }, [uuid]);

  // /public/boards/:uuid never names the author's email, so it is looked up
  // for those who may read users, as in the library's list.
  const canReadUsers = user?.role === "admin" || user?.role === "super_admin";

  if (board === null) {
    return (
      <div className="w-full bg-surface-secondary">
        <div className="flex items-center justify-between border-b border-outline-common px-lg py-md">
          <p className="text-heading text-text-on-primary">
            {loading ? "Carregando..." : "Prancha não encontrada"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg w-full">
      <div className="flex bg-white items-center justify-between border border-gray-200 rounded-lg px-lg py-md">
        <div className="flex items-start gap-md text-body font-semibold text-gray-600">
          <div className="flex flex-col gap-xs">
            <p className="text-heading font-medium text-text-on-primary">
              {board.title}
            </p>
            <div className="flex items-center gap-sm">
              <MdPermMedia className="text-primary" size={16} />
              <p>{items.length} Pictogramas</p>
            </div>
            <AuthorEmail uuid={board.authorUuid} lookup={canReadUsers} />
          </div>
          <Badge>Público</Badge>
          <Badge variant={board.type === "emergency" ? "warning" : "secondary"}>
            {BOARD_TYPE_LABELS[board.type]}
          </Badge>
          <CopyableUuid uuid={board.uuid} />
        </div>
      </div>
      <div className="flex flex-wrap items-center bg-white border border-gray-200 rounded-md gap-lg px-lg py-md font-medium">
        <div className="w-100">
          <SearchBar
            data={items}
            onResults={setFilteredItems}
            getSearchText={getTermSearchText}
            placeholder="Buscar na prancha..."
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-md p-lg">
        {filteredItems.map((item) => (
          <div
            key={item.uuid}
            className="flex flex-col items-center gap-xs bg-white border border-gray-200 rounded-md p-xs"
          >
            <div className="flex items-center gap-xs">
              <Thumbnail
                src={item.pictogram.fileUrl}
                size={80}
                className="rounded"
              />
              <Thumbnail
                src={item.signWriting.fileUrl}
                size={80}
                className="rounded"
              />
            </div>
            <p className="text-text-on-primary text-body font-bold text-center">
              {item.description}
            </p>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-text-on-primary-variant text-body">
            Nenhum termo nesta prancha.
          </p>
        )}
      </div>
    </div>
  );
}

export default ReadonlyBoardDetail;
