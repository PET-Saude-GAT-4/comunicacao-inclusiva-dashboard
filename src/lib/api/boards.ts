import { BoardOutput } from "@/types/board";
import { BoardTermOutput } from "@/types/term";
import { apiFetch } from "./client";

export async function getBoards(): Promise<BoardOutput[]> {
  const data = await apiFetch<{ boards: BoardOutput[] }>("/boards");
  if (!data) throw new Error("Erro ao buscar pranchas.");
  return data.boards;
}

export async function getBoard(uuid: string): Promise<BoardOutput | null> {
  const data = await apiFetch<{ board: BoardOutput }>(`/boards/${uuid}`);
  if (!data) throw new Error("Erro ao buscar prancha.");
  return data.board;
}

export async function getPublicBoards(): Promise<BoardOutput[]> {
  const data = await apiFetch<{ boards: BoardOutput[] }>("/public/boards");
  if (!data) throw new Error("Erro ao buscar pranchas.");
  return data.boards;
}

export async function getPublicBoard(
  uuid: string,
): Promise<BoardOutput | null> {
  const data = await apiFetch<{ board: BoardOutput }>(`/public/boards/${uuid}`);
  if (!data) throw new Error("Erro ao buscar prancha.");
  return data.board;
}

export async function getPublicBoardTerms(
  boardUuid: string,
): Promise<BoardTermOutput[]> {
  const data = await apiFetch<{ terms: BoardTermOutput[] }>(
    `/public/boards/${boardUuid}/terms`,
  );
  if (!data) throw new Error("Erro ao buscar termos da prancha.");
  return data.terms;
}

export function createBoard(data: {
  title: string;
  representativeUuid: string;
}): Promise<void> {
  return apiFetch("/boards", { method: "POST", body: JSON.stringify(data) });
}

export function deleteBoard(uuid: string): Promise<void> {
  return apiFetch(`/boards/${uuid}`, { method: "DELETE" });
}

export async function getBoardTerms(
  boardUuid: string,
): Promise<BoardTermOutput[]> {
  const data = await apiFetch<{ terms: BoardTermOutput[] }>(
    `/boards/${boardUuid}/terms`,
  );
  if (!data) throw new Error("Erro ao buscar termos da prancha.");
  return data.terms;
}

export function addTermToBoard(
  boardUuid: string,
  data: { termUuid: string; next?: string | null },
): Promise<void> {
  const body: Record<string, unknown> = { termUuid: data.termUuid };

  if (data.next !== undefined) body.next = data.next;

  return apiFetch(`/boards/${boardUuid}/terms`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function deleteBoardTerm(
  boardUuid: string,
  boardTermUuid: string,
): Promise<void> {
  return apiFetch(`/boards/${boardUuid}/terms/${boardTermUuid}`, {
    method: "DELETE",
  });
}

export function publishBoard(uuid: string): Promise<void> {
  return apiFetch(`/boards/${uuid}/publish`, { method: "PATCH" });
}

export function unpublishBoard(uuid: string): Promise<void> {
  return apiFetch(`/boards/${uuid}/unpublish`, { method: "PATCH" });
}

export function reorderBoardTerm(
  boardUuid: string,
  boardTermUuid: string,
  data: { next: string | null },
): Promise<void> {
  const body: Record<string, unknown> = { next: data.next };

  return apiFetch(`/boards/${boardUuid}/terms/${boardTermUuid}/order`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
