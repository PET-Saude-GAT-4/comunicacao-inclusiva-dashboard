"use server";

import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types/common";
import { SignWritingOutput } from "@/types/sign-writing";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/sign-writings";

export async function getSignWritings(): Promise<SignWritingOutput[]> {
  return api.getSignWritings();
}

export async function getSignWriting(
  uuid: string,
): Promise<SignWritingOutput | null> {
  return api.getSignWriting(uuid);
}

export async function createSignWriting(
  formData: FormData,
): Promise<ActionResult> {
  try {
    await api.createSignWriting(formData);
    revalidatePath("/sign-writings");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao criar SignWriting." };
  }
}

export async function deleteSignWriting(uuid: string): Promise<ActionResult> {
  try {
    await api.deleteSignWriting(uuid);
    revalidatePath("/sign-writings");
    return { success: true };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 404) {
        return { success: false, error: "SignWriting não encontrado." };
      }
      // The API refuses to remove a SignWriting already paired into a term.
      if (e.status === 400 || e.status === 409) {
        return {
          success: false,
          error: "Não é possível remover um SignWriting vinculado a um termo.",
        };
      }
    }
    return { success: false, error: "Erro ao remover SignWriting." };
  }
}
