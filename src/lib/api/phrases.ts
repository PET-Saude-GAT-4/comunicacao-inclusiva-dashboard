import { PhraseOutput } from "@/types/phrase";
import { apiFetch } from "./client";

export async function getPhrases(): Promise<PhraseOutput[]> {
  const data = await apiFetch<{ phrases: PhraseOutput[] }>("/phrases");
  if (!data) throw new Error("Erro ao buscar frases.");
  return data.phrases;
}

export async function getPhrase(uuid: string): Promise<PhraseOutput | null> {
  const data = await apiFetch<{ phrase: PhraseOutput }>(`/phrases/${uuid}`);
  if (!data) throw new Error("Erro ao buscar frase.");
  return data.phrase;
}

export function createPhrase(data: {
  description: string;
  termUuids: string[];
}): Promise<void> {
  return apiFetch("/phrases", { method: "POST", body: JSON.stringify(data) });
}

export function updatePhrase(
  uuid: string,
  data: { description?: string; termUuids?: string[] },
): Promise<void> {
  const body: Record<string, unknown> = {};

  if (data.description !== undefined) body.description = data.description;
  if (data.termUuids !== undefined) body.termUuids = data.termUuids;

  return apiFetch(`/phrases/${uuid}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deletePhrase(uuid: string): Promise<void> {
  return apiFetch(`/phrases/${uuid}`, { method: "DELETE" });
}

export function publishPhrase(uuid: string): Promise<void> {
  return apiFetch(`/phrases/${uuid}/publish`, { method: "PATCH" });
}

export function unpublishPhrase(uuid: string): Promise<void> {
  return apiFetch(`/phrases/${uuid}/unpublish`, { method: "PATCH" });
}
