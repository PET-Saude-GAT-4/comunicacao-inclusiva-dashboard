import type { SessionUser } from "@/types/session";
import { boardHref, canEditBoard } from "./board";

const board = { uuid: "board-1", authorUuid: "author-1" };

const user = (uuid: string, role: SessionUser["role"]): SessionUser => ({
  uuid,
  email: `${uuid}@example.com`,
  role,
});

describe("canEditBoard", () => {
  it("denies a visitor with no session", () => {
    expect(canEditBoard(board, null)).toBe(false);
  });

  it("lets a super admin edit any board", () => {
    expect(canEditBoard(board, user("someone", "super_admin"))).toBe(true);
  });

  it("lets the author edit their own board", () => {
    expect(canEditBoard(board, user("author-1", "admin"))).toBe(true);
  });

  it("denies an admin who is not the author", () => {
    expect(canEditBoard(board, user("other", "admin"))).toBe(false);
  });
});

describe("boardHref", () => {
  it("opens the editor for whoever can edit the board", () => {
    expect(boardHref(board, user("author-1", "admin"))).toBe(
      "/boards/board-1",
    );
  });

  it("opens the library's read-only view for everyone else", () => {
    expect(boardHref(board, user("other", "viewer"))).toBe(
      "/library/boards/board-1",
    );
    expect(boardHref(board, null)).toBe("/library/boards/board-1");
  });
});
