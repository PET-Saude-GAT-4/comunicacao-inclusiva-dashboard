import { TermOutput } from "@/types/term";
import { apiFetch } from "./client";

export async function getTerms(): Promise<TermOutput[]> {
  const data = await apiFetch<{ terms: TermOutput[] }>("/terms");
  if (!data) throw new Error("Erro ao buscar termos.");
  return data.terms;
}

export async function getTerm(uuid: string): Promise<TermOutput | null> {
  const data = await apiFetch<{ term: TermOutput }>(`/terms/${uuid}`);
  if (!data) throw new Error("Erro ao buscar termo.");
  return data.term;
}

export function createTerm(data: {
  pictogramUuid: string;
  signWritingUuid: string;
  description: string;
}): Promise<void> {
  return apiFetch("/terms", { method: "POST", body: JSON.stringify(data) });
}

export function deleteTerm(uuid: string): Promise<void> {
  return apiFetch(`/terms/${uuid}`, { method: "DELETE" });
}
