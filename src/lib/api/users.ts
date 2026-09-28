import { UserOutput } from "@/types/user";
import { apiFetch } from "./client";

export async function getUsers(): Promise<UserOutput[]> {
  const data = await apiFetch<{ users: UserOutput[] }>("/users");
  if (!data) throw new Error("Erro ao buscar usuários.");
  return data.users;
}

export function createUser(data: {
  email: string;
  roleId: number;
}): Promise<void> {
  return apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteUser(id: number): Promise<void> {
  return apiFetch(`/users/${id}`, { method: "DELETE" });
}
