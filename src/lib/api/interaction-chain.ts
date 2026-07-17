import type { InteractionChainOutput } from "@/types/interaction-chain";
import { apiFetch } from "./client";

export async function getInteractionChains(): Promise<
  InteractionChainOutput[]
> {
  const data = await apiFetch<{ interactionChains: InteractionChainOutput[] }>(
    "/interaction-chains",
  );
  if (!data) throw new Error("Erro ao buscar cadeias de interação.");
  return data.interactionChains;
}

export async function getInteractionChain(
  id: number,
): Promise<InteractionChainOutput | null> {
  const data = await apiFetch<{ interactionChain: InteractionChainOutput }>(
    `/interaction-chains/${id}`,
  );
  if (!data) throw new Error("Erro ao buscar cadeia de interação.");
  return data.interactionChain;
}

export function createInteractionChain(data: {
  triggerBoardUuid: string;
  responseBoardUuid: string;
  label?: string;
}): Promise<void> {
  return apiFetch("/interaction-chains", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateInteractionChain(
  id: number,
  data: {
    triggerBoardUuid?: string;
    responseBoardUuid?: string;
    label?: string;
  },
): Promise<void> {
  return apiFetch(`/interaction-chains/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function getInteractionChainByBoardUuid(
  triggerBoardUuid: string,
): Promise<InteractionChainOutput[] | null> {
  const data = await apiFetch<{ interactionChains: InteractionChainOutput[] }>(
    `/interaction-chains/trigger-board/${triggerBoardUuid}`,
  );
  if (!data) return null;
  return data.interactionChains;
}

export function deleteInteractionChain(id: number): Promise<void> {
  return apiFetch(`/interaction-chains/${id}`, { method: "DELETE" });
}
