"use server";

import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types/common";
import { PictogramOutput } from "@/types/pictogram";
import * as api from "@/lib/api/pictograms";

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
  } catch {
    return { success: false, error: `Erro ao remover pictograma ${uuid}.` };
  }
}
