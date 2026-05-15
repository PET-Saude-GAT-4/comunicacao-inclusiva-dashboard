import { ProfessionOutput, SpecialityOutput } from "@/utils/definitions";
import { apiFetch } from "./client";

export async function getProfessions(): Promise<ProfessionOutput[]> {
  const data = await apiFetch<{ professions: ProfessionOutput[] }>(
    "/professions",
  );
  return data.professions;
}

export function createProfession(data: {
  name: string;
  code: string;
}): Promise<void> {
  return apiFetch("/professions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteProfession(id: number): Promise<void> {
  return apiFetch(`/professions/${id}`, { method: "DELETE" });
}

export async function getSpecialities(): Promise<SpecialityOutput[]> {
  const data = await apiFetch<{ specialities: SpecialityOutput[] }>(
    "/specialities",
  );
  return data.specialities;
}

export function createSpeciality(data: {
  name: string;
  code: string;
  professionCode: string;
}): Promise<void> {
  return apiFetch(`/professions/${data.professionCode}/specialities`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteSpeciality(id: number): Promise<void> {
  return apiFetch(`/specialities/${id}`, { method: "DELETE" });
}
