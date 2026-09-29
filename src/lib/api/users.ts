import { UserOutput } from "@/types/user";
import { apiFetch } from "./client";

export async function getUsers(): Promise<UserOutput[]> {
  const data = await apiFetch<{ users: UserOutput[] }>("/users");
  if (!data) throw new Error("Erro ao buscar usuários.");
  return data.users;
}

export async function getUser(uuid: string): Promise<UserOutput | null> {
  const data = await apiFetch<{ user: UserOutput }>(`/users/${uuid}`);
  if (!data) throw new Error("Erro ao buscar usuário.");
  return data.user;
}

export function createUser(data: {
  email: string;
  password: string;
  role: string;
}): Promise<void> {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteUser(id: number): Promise<void> {
  return apiFetch(`/users/${id}`, { method: "DELETE" });
}
