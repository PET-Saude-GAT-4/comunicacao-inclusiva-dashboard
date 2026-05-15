import { PictogramOutput } from "@/utils/definitions";
import { apiFetch } from "./client";

export async function getPictograms(): Promise<PictogramOutput[]> {
  const data = await apiFetch<{ pictograms: PictogramOutput[] }>("/pictograms");
  return data.pictograms;
}

export async function getPictogram(
  uuid: string,
): Promise<PictogramOutput | null> {
  const data = await apiFetch<{ pictogram: PictogramOutput }>(
    `/pictograms/${uuid}`,
  );
  return data.pictogram;
}

export function createPictogram(formData: FormData): Promise<void> {
  return apiFetch("/pictograms", { method: "POST", body: formData });
}

export function deletePictogram(uuid: string): Promise<void> {
  return apiFetch(`/pictograms/${uuid}`, { method: "DELETE" });
}
