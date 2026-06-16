import { PictogramOutput } from "@/types/pictogram";
import { apiFetch } from "./client";

export async function getPictograms(): Promise<PictogramOutput[]> {
  const data = await apiFetch<{ pictograms: PictogramOutput[] }>("/pictograms");
  if (!data) throw new Error("Erro ao buscar pictogramas.");
  return data.pictograms;
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
