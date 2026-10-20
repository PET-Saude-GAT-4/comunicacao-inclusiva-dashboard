import { ListQuery, Paginated } from "@/types/common";
import { PictogramOutput, PictogramListItem } from "@/types/pictogram";
import { apiFetch, listQueryString } from "./client";

export async function getPictogramPage(
  query: ListQuery,
): Promise<Paginated<"pictograms", PictogramListItem>> {
  const data = await apiFetch<Paginated<"pictograms", PictogramListItem>>(
    `/pictograms${listQueryString(query)}`,
  );
  if (!data) throw new Error("Erro ao buscar pictogramas.");
  return data;
}

export async function getPictogram(
  uuid: string,
): Promise<PictogramOutput | null> {
  const data = await apiFetch<{ pictogram: PictogramOutput }>(
    `/pictograms/${uuid}`,
  );
  if (!data) throw new Error("Erro ao buscar pictograma.");
  return data.pictogram;
}

export function createPictogram(formData: FormData): Promise<void> {
  return apiFetch("/pictograms", { method: "POST", body: formData });
}

export function deletePictogram(uuid: string): Promise<void> {
  return apiFetch(`/pictograms/${uuid}`, { method: "DELETE" });
}
