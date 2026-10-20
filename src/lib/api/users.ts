import { ListQuery, Paginated } from "@/types/common";
import { UserOutput } from "@/types/user";
import { apiFetch, listQueryString } from "./client";

export async function getUsers(): Promise<UserOutput[]> {
  const data = await apiFetch<{ users: UserOutput[] }>("/users");
  if (!data) throw new Error("Erro ao buscar usuários.");
  return data.users;
}

export async function getUserPage(
  query: ListQuery,
): Promise<Paginated<"users", UserOutput>> {
  const data = await apiFetch<Paginated<"users", UserOutput>>(
    `/users${listQueryString(query)}`,
  );
  if (!data) throw new Error("Erro ao buscar usuários.");
  return data;
}

export async function getUser(uuid: string): Promise<UserOutput | null> {
  const data = await apiFetch<{ user: UserOutput }>(`/users/uuid/${uuid}`);
  if (!data) throw new Error("Erro ao buscar usuário.");
  return data.user;
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
