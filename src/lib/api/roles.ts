import { RoleOutput } from "@/utils/definitions";
import { apiFetch } from "./client";

export async function getRoles(): Promise<RoleOutput[]> {
  const data = await apiFetch<{ roles: RoleOutput[] }>("/roles");
  if (!data) throw new Error("Erro ao buscar cargos.");
  return data.roles;
}

export function createRole(data: { name: string }): Promise<void> {
  return apiFetch("/roles", { method: "POST", body: JSON.stringify(data) });
}

export function deleteRole(id: number): Promise<void> {
  return apiFetch(`/roles/${id}`, { method: "DELETE" });
}
