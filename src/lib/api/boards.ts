import { BoardOutput, PictogramOutput } from "@/utils/definitions";
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

export function createBoard(data: {
  title: string;
  representativeUuid: string;
}): Promise<void> {
  return apiFetch("/boards", { method: "POST", body: JSON.stringify(data) });
}

export function deleteBoard(uuid: string): Promise<void> {
  return apiFetch(`/boards/${uuid}`, { method: "DELETE" });
}

export async function getBoardPictograms(
  boardUuid: string,
): Promise<PictogramOutput[]> {
  const data = await apiFetch<{ pictograms: PictogramOutput[] }>(
    `/boards/${boardUuid}/pictograms`,
  );
  if (!data) throw new Error("Erro ao buscar pictogramas da prancha.");
  return data.pictograms;
}

export function addPictogramToBoard(
  boardUuid: string,
  data: { pictogramUuid: string; order?: number },
): Promise<void> {
  const body: Record<string, unknown> = { pictogramUuid: data.pictogramUuid };

  if (data.order !== undefined) body.order = data.order;

  return apiFetch(`/boards/${boardUuid}/pictograms`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
