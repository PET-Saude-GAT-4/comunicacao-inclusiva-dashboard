"use server";

import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types/common";
import { PictogramOutput } from "@/types/pictogram";
import * as api from "@/lib/api/pictograms";
import { ApiError } from "@/lib/api/client";

export async function getPictograms(): Promise<PictogramOutput[]> {
  return api.getPictograms();
}

export async function getPictogram(
  uuid: string,
): Promise<PictogramOutput | null> {
  return api.getPictogram(uuid);
}

export async function createPictogram(
  formData: FormData,
): Promise<ActionResult> {
  try {
    await api.createPictogram(formData);
    revalidatePath("/pictograms");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao criar pictograma." };
  }
}

export async function deletePictogram(uuid: string): Promise<ActionResult> {
  try {
    await api.deletePictogram(uuid);
    revalidatePath("/pictograms");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 409) {
        return {
          success: false,
          error:
            "Não é possível excluir este pictograma porque ele está vinculado a um ou mais quadros. Remova o vínculo antes de excluir.",
        };
      }

      return {
        success: false,
        error: `Erro ao remover pictograma ${uuid} (${error.status}): ${error.message}`,
      };
    }

    return {
      success: false,
      error: `Erro ao remover pictograma ${uuid}.`,
    };
  }
}
