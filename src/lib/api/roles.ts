import { ListQuery, Paginated } from "@/types/common";
import { RoleOutput } from "@/types/role";
import { apiFetch, listQueryString } from "./client";

export async function getRolePage(
  query: ListQuery,
): Promise<Paginated<"roles", RoleOutput>> {
  const data = await apiFetch<Paginated<"roles", RoleOutput>>(
    `/roles${listQueryString(query)}`,
  );
  if (!data) throw new Error("Erro ao buscar cargos.");
  return data;
}

export function createRole(data: { name: string }): Promise<void> {
  return apiFetch("/roles", { method: "POST", body: JSON.stringify(data) });
}

export function deleteRole(id: number): Promise<void> {
  return apiFetch(`/roles/${id}`, { method: "DELETE" });
}
