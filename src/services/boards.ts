"use server";

import { revalidatePath } from "next/cache";
import {
  ActionResult,
  BoardOutput,
  PictogramOutput,
} from "@/utils/definitions";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/boards";

export async function getBoards(): Promise<BoardOutput[]> {
  return api.getBoards();
}

export async function getBoard(uuid: string): Promise<BoardOutput | null> {
  return api.getBoard(uuid);
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

export async function getBoardPictograms(
  boardUuid: string,
): Promise<PictogramOutput[]> {
  return api.getBoardPictograms(boardUuid);
}

export async function addPictogramToBoard(
  boardUuid: string,
  data: { pictogramUuid: string; order?: number },
): Promise<ActionResult> {
  try {
    await api.addPictogramToBoard(boardUuid, data);
    return { success: true };
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) {
      return { success: false, error: "Pictograma já está nesta prancha." };
    }
    return { success: false, error: "Erro ao adicionar pictograma à prancha." };
  }
}

export async function reorderPictogram(
  boardUuid: string,
  pictogramUuid: string,
  data: { next: string | null },
): Promise<ActionResult> {
  try {
    await api.reorderPictogram(boardUuid, pictogramUuid, data);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Erro ao mover pictograma" };
  }
}
