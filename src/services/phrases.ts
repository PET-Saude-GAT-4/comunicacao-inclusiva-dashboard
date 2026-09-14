"use server";

import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types/common";
import { PhraseOutput } from "@/types/phrase";
import * as api from "@/lib/api/phrases";

export async function getPhrases(): Promise<PhraseOutput[]> {
  return api.getPhrases();
}

export async function getPhrase(uuid: string): Promise<PhraseOutput | null> {
  return api.getPhrase(uuid);
}

export async function createPhrase(data: {
  description: string;
  termUuids: string[];
}): Promise<ActionResult> {
  try {
    await api.createPhrase(data);
    revalidatePath("/phrases");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao criar frase." };
  }
}

export async function updatePhrase(
  uuid: string,
  data: { description?: string; termUuids?: string[] },
): Promise<ActionResult> {
  try {
    await api.updatePhrase(uuid, data);
    revalidatePath("/phrases");
    revalidatePath(`/phrases/${uuid}`);
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao salvar frase." };
  }
}

export async function deletePhrase(uuid: string): Promise<ActionResult> {
  try {
    await api.deletePhrase(uuid);
    revalidatePath("/phrases");
    return { success: true };
  } catch {
    return { success: false, error: `Erro ao remover frase ${uuid}.` };
  }
}

export async function publishPhrase(uuid: string): Promise<ActionResult> {
  try {
    await api.publishPhrase(uuid);
    revalidatePath("/phrases");
    revalidatePath(`/phrases/${uuid}`);
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao publicar frase." };
  }
}

export async function unpublishPhrase(uuid: string): Promise<ActionResult> {
  try {
    await api.unpublishPhrase(uuid);
    revalidatePath("/phrases");
    revalidatePath(`/phrases/${uuid}`);
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao despublicar frase." };
  }
}
