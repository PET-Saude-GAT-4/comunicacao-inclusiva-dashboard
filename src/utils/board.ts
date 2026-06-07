import { BoardOutput, SessionUser } from "@/utils/definitions";

export function canEditBoard(
  board: BoardOutput,
  user: SessionUser | null,
): boolean {
  if (!user) return false;
  return user.role === "super_admin" || board.authorUuid === user.uuid;
}

export function boardHref(
  board: BoardOutput,
  user: SessionUser | null,
): string {
  return canEditBoard(board, user)
    ? `/boards/${board.uuid}`
    : `/library/boards/${board.uuid}`;
}
