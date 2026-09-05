"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getPublicBoard, getPublicBoardTerms } from "@/services/boards";
import { BoardOutput } from "@/types/board";
import { BoardTermOutput } from "@/types/term";

function ReadonlyBoardDetail() {
  const params = useParams();
  const uuid = String(params.uuid);

  const [board, setBoard] = useState<BoardOutput | null>(null);
  const [items, setItems] = useState<BoardTermOutput[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPublicBoard(uuid), getPublicBoardTerms(uuid)])
      .then(([boardData, termsData]) => {
        setBoard(boardData);
        setItems(termsData);
      })
      .catch(() => setBoard(null))
      .finally(() => setLoading(false));
  }, [uuid]);

  if (board === null) {
    return (
      <div className="min-h-screen w-full bg-surface-primary">
        <div className="flex items-center justify-between border-b border-outline-common px-lg py-md">
          <p className="text-heading text-text-on-primary">
            {loading ? "Carregando..." : "Prancha não encontrada"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-surface-primary">
      <div className="flex items-center justify-between border-b border-outline-common px-lg py-md">
        <div className="flex items-center gap-md text-text-on-primary">
          <p className="text-heading">{board.title}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-md p-lg">
        {items.map((item) => (
          <div
            key={item.uuid}
            className="flex flex-col items-center gap-xs bg-surface-secondary rounded-sm p-xs"
          >
            <div className="flex items-center gap-xs">
              <Image
                src={item.pictogram.fileUrl}
                alt=""
                width={80}
                height={80}
                className="object-contain rounded"
              />
              <Image
                src={item.signWriting.fileUrl}
                alt=""
                width={80}
                height={80}
                className="object-contain rounded"
              />
            </div>
            <p className="text-text-on-primary text-body font-bold text-center  ">
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
