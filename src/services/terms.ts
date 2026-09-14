"use server";

import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types/common";
import { TermOutput } from "@/types/term";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/terms";

export async function getTerms(): Promise<TermOutput[]> {
  return api.getTerms();
}

export async function getTerm(uuid: string): Promise<TermOutput | null> {
  return api.getTerm(uuid);
}

export async function createTerm(data: {
  pictogramUuid: string;
  signWritingUuid: string;
  description: string;
}): Promise<ActionResult> {
  try {
    await api.createTerm(data);
    revalidatePath("/terms");
    return { success: true };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 409) {
        return {
          success: false,
          error: "Este pictograma e SignWriting já formam um termo.",
        };
      }
      if (e.status === 404) {
        return {
          success: false,
          error: "Pictograma ou SignWriting não encontrado.",
        };
      }
    }
    return { success: false, error: "Erro ao criar termo." };
  }
}

export async function deleteTerm(uuid: string): Promise<ActionResult> {
  try {
    await api.deleteTerm(uuid);
    revalidatePath("/terms");
    return { success: true };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 404) {
        return { success: false, error: "Termo não encontrado." };
      }
      // The API refuses to remove a term already placed on a board or phrase.
      if (e.status === 400) {
        return {
          success: false,
          error: "Não é possível remover um termo em uso.",
        };
      }
    }
    return { success: false, error: "Erro ao remover termo." };
  }
}
