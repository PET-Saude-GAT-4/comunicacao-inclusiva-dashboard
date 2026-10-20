import { BoardOutput } from "@/types/board";
import { SessionUser } from "@/types/session";

export function canEditBoard(
  board: Pick<BoardOutput, "authorUuid">,
  user: SessionUser | null,
): boolean {
  if (!user) return false;
  return user.role === "super_admin" || board.authorUuid === user.uuid;
}

export function boardHref(
  board: Pick<BoardOutput, "uuid" | "authorUuid">,
  user: SessionUser | null,
): string {
  return canEditBoard(board, user)
    ? `/boards/${board.uuid}`
    : `/library/boards/${board.uuid}`;
}
