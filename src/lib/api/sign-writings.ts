import { SignWritingOutput } from "@/types/sign-writing";
import { apiFetch } from "./client";

export async function getSignWritings(): Promise<SignWritingOutput[]> {
  const data = await apiFetch<{ signWritings: SignWritingOutput[] }>(
    "/sign-writings",
  );
  if (!data) throw new Error("Erro ao buscar SignWritings.");
  return data.signWritings;
}

export async function getSignWriting(
  uuid: string,
): Promise<SignWritingOutput | null> {
  const data = await apiFetch<{ signWriting: SignWritingOutput }>(
    `/sign-writings/${uuid}`,
  );
  if (!data) throw new Error("Erro ao buscar SignWriting.");
  return data.signWriting;
}

export function createSignWriting(formData: FormData): Promise<void> {
  return apiFetch("/sign-writings", { method: "POST", body: formData });
}

export function deleteSignWriting(uuid: string): Promise<void> {
  return apiFetch(`/sign-writings/${uuid}`, { method: "DELETE" });
}
