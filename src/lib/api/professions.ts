import { ListQuery, Paginated } from "@/types/common";
import { ProfessionOutput, SpecialityOutput } from "@/types/profession";
import { apiFetch, listQueryString } from "./client";

export async function getProfessionPage(
  query: ListQuery,
): Promise<Paginated<"professions", ProfessionOutput>> {
  const data = await apiFetch<Paginated<"professions", ProfessionOutput>>(
    `/professions${listQueryString(query)}`,
  );
  if (!data) throw new Error("Erro ao buscar profissões.");
  return data;
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

export async function getSpecialityPage(
  query: ListQuery,
): Promise<Paginated<"specialities", SpecialityOutput>> {
  const data = await apiFetch<Paginated<"specialities", SpecialityOutput>>(
    `/specialities${listQueryString(query)}`,
  );
  if (!data) throw new Error("Erro ao buscar especialidades.");
  return data;
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
