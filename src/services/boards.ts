"use server";

import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types/common";
import { BoardOutput } from "@/types/board";
import { BoardTermOutput } from "@/types/term";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/boards";

export async function getBoards(): Promise<BoardOutput[]> {
  return api.getBoards();
}

export async function getBoard(uuid: string): Promise<BoardOutput | null> {
  return api.getBoard(uuid);
}

export async function getPublicBoards(): Promise<BoardOutput[]> {
  return api.getPublicBoards();
}

export async function getPublicBoard(
  uuid: string,
): Promise<BoardOutput | null> {
  return api.getPublicBoard(uuid);
}

export async function getPublicBoardTerms(
  boardUuid: string,
): Promise<BoardTermOutput[]> {
  return api.getPublicBoardTerms(boardUuid);
}

export async function createBoard(data: {
  title: string;
  representativeUuid: string;
}): Promise<ActionResult> {
  try {
    await api.createBoard(data);
    revalidatePath("/boards");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao criar prancha." };
  }
}

export async function deleteBoard(uuid: string): Promise<ActionResult> {
  try {
    await api.deleteBoard(uuid);
    revalidatePath("/boards");
    return { success: true };
  } catch {
    return { success: false, error: `Erro ao remover prancha ${uuid}.` };
  }
}

export async function publishBoard(uuid: string): Promise<ActionResult> {
  try {
    await api.publishBoard(uuid);
    revalidatePath("/boards");
    revalidatePath(`/boards/${uuid}`);
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao publicar prancha." };
  }
}

export async function unpublishBoard(uuid: string): Promise<ActionResult> {
  try {
    await api.unpublishBoard(uuid);
    revalidatePath("/boards");
    revalidatePath(`/boards/${uuid}`);
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao despublicar prancha." };
  }
}

export async function getBoardTerms(
  boardUuid: string,
): Promise<BoardTermOutput[]> {
  return api.getBoardTerms(boardUuid);
}

export async function addTermToBoard(
  boardUuid: string,
  data: { termUuid: string; next?: string | null },
): Promise<ActionResult> {
  try {
    await api.addTermToBoard(boardUuid, data);
    return { success: true };
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) {
      return { success: false, error: "Termo já está nesta prancha." };
    }
    return { success: false, error: "Erro ao adicionar termo à prancha." };
  }
}

export async function removeTermFromBoard(
  boardUuid: string,
  boardTermUuid: string,
): Promise<ActionResult> {
  try {
    await api.deleteBoardTerm(boardUuid, boardTermUuid);
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao remover termo da prancha." };
  }
}

export async function reorderBoardTerm(
  boardUuid: string,
  boardTermUuid: string,
  data: { next: string | null },
): Promise<ActionResult> {
  try {
    await api.reorderBoardTerm(boardUuid, boardTermUuid, data);
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao mover termo." };
  }
}
