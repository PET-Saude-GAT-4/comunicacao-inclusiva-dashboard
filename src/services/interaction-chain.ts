"use server";

import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types/common";
import { InteractionChainOutput } from "@/types/interaction-chain";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/interaction-chain";

export async function getInteractionChains(): Promise<
  InteractionChainOutput[]
> {
  return api.getInteractionChains();
}

export async function getInteractionChainByBoardUuid(
  triggerBoardUuid: string,
): Promise<InteractionChainOutput[] | null> {
  return api.getInteractionChainByBoardUuid(triggerBoardUuid);
}

export async function getInteractionChain(
  id: number,
): Promise<InteractionChainOutput | null> {
  return api.getInteractionChain(id);
}

export async function createInteractionChain(data: {
  triggerBoardUuid: string;
  responseBoardUuid: string;
  label?: string;
}): Promise<ActionResult> {
  try {
    await api.createInteractionChain(data);
    revalidatePath("/interaction-chains");
    return { success: true };
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) {
      return {
        success: false,
        error: "Já existe uma cadeia de interação com essas pranchas.",
      };
    }
    return { success: false, error: "Erro ao criar cadeia de interação." };
  }
}

export async function updateInteractionChain(
  id: number,
  data: {
    triggerBoardUuid?: string;
    responseBoardUuid?: string;
    label?: string;
  },
): Promise<ActionResult> {
  try {
    await api.updateInteractionChain(id, data);
    revalidatePath("/interaction-chains");
    revalidatePath(`/interaction-chains/${id}`);
    return { success: true };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return { success: false, error: "Cadeia de interação não encontrada." };
    }
    if (e instanceof ApiError && e.status === 409) {
      return {
        success: false,
        error: "Já existe uma cadeia de interação com essas pranchas.",
      };
    }
    return { success: false, error: "Erro ao atualizar cadeia de interação." };
  }
}

export async function deleteInteractionChain(
  id: number,
): Promise<ActionResult> {
  try {
    await api.deleteInteractionChain(id);
    revalidatePath("/interaction-chains");
    return { success: true };
  } catch {
    return {
      success: false,
      error: `Erro ao remover cadeia de interação ${id}.`,
    };
  }
}
