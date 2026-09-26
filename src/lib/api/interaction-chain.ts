import type {
  ChainTrigger,
  InteractionChainOutput,
} from "@/types/interaction-chain";
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
  uuid: string,
): Promise<InteractionChainOutput | null> {
  const data = await apiFetch<{ interactionChain: InteractionChainOutput }>(
    `/interaction-chains/${uuid}`,
  );
  if (!data) throw new Error("Erro ao buscar cadeia de interação.");
  return data.interactionChain;
}

export function createInteractionChain(data: {
  trigger: ChainTrigger;
  responseBoardUuid: string;
  rank?: number;
  label?: string;
}): Promise<void> {
  return apiFetch("/interaction-chains", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateInteractionChain(
  uuid: string,
  data: {
    trigger?: ChainTrigger;
    responseBoardUuid?: string;
    rank?: number;
    label?: string;
  },
): Promise<void> {
  return apiFetch(`/interaction-chains/${uuid}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// One path per trigger kind, mirroring the API's routes.
export async function getInteractionChainsByTrigger(
  trigger: ChainTrigger,
): Promise<InteractionChainOutput[] | null> {
  const path =
    trigger.type === "board"
      ? `/interaction-chains/trigger-board/${trigger.uuid}`
      : `/interaction-chains/trigger-phrase/${trigger.uuid}`;

  const data = await apiFetch<{ interactionChains: InteractionChainOutput[] }>(
    path,
  );
  if (!data) return null;
  return data.interactionChains;
}

export function deleteInteractionChain(uuid: string): Promise<void> {
  return apiFetch(`/interaction-chains/${uuid}`, { method: "DELETE" });
}
