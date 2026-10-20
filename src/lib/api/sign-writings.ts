import { ListQuery, Paginated } from "@/types/common";
import { SignWritingOutput, SignWritingListItem } from "@/types/sign-writing";
import { apiFetch, listQueryString } from "./client";

export async function getSignWritingPage(
  query: ListQuery,
): Promise<Paginated<"signWritings", SignWritingListItem>> {
  const data = await apiFetch<Paginated<"signWritings", SignWritingListItem>>(
    `/sign-writings${listQueryString(query)}`,
  );
  if (!data) throw new Error("Erro ao buscar SignWritings.");
  return data;
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
