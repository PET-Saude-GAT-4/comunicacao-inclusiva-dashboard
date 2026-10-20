"use server";

import { ActionResult, ListQuery, Paginated } from "@/types/common";
import { UserOutput } from "@/types/user";
import * as api from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { unstable_rethrow } from "next/navigation";

export async function getUserPage(
  query: ListQuery,
): Promise<Paginated<"users", UserOutput>> {
  return api.getUserPage(query);
}

function translateUserError(status: number, rawMessage?: string): string {
  if (!rawMessage) return "Erro ao convidar usuário.";

  if (status === 400 && rawMessage === "Email and role ID are required") {
    return "E-mail e permissão são obrigatórios.";
  }

  if (status === 409 && rawMessage === "Email already in use") {
    return "Este e-mail já está cadastrado no sistema.";
  }

  if (status === 404 && rawMessage === "Role not found") {
    return "O perfil selecionado não foi encontrado.";
  }

  if (
    status === 403 &&
    rawMessage === "You do not have permission to assign this role."
  ) {
    return "Você não tem permissão para atribuir este perfil.";
  }

  if (status === 500) {
    return "Não foi possível enviar o convite. Verifique as configurações de e-mail.";
  }

  return "Erro ao convidar usuário. Verifique os dados.";
}

// The emails of the given users, by uuid; one that cannot be read, because it
// is gone or the caller may not see it, is left out. The client runs Server
// Functions one at a time, so the authors on screen are asked for together
// and looked up in parallel here.
export async function getUserEmails(
  uuids: string[],
): Promise<Record<string, string>> {
  const results = await Promise.allSettled(uuids.map((uuid) => api.getUser(uuid)));
  // An expired session makes apiFetch redirect to /login by throwing; that
  // must still reach Next instead of reading as one user left out.
  for (const result of results) {
    if (result.status === "rejected") unstable_rethrow(result.reason);
  }
  return Object.fromEntries(
    results.flatMap((result, index) =>
      result.status === "fulfilled" && result.value
        ? [[uuids[index], result.value.email]]
        : [],
    ),
  );
}

export async function createUser(data: {
  email: string;
  roleId: number;
}): Promise<ActionResult> {
  try {
    await api.createUser(data);
    return { success: true };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 409) {
        return {
          success: false,
          error: "Este e-mail já está cadastrado no sistema.",
        };
      }
      try {
        const body = JSON.parse(e.message) as {
          message?: string;
          error?: string;
        };
        const rawMessage = body.message || body.error;
        return {
          success: false,
          error: translateUserError(e.status, rawMessage),
        };
      } catch {
        return {
          success: false,
          error: translateUserError(e.status, e.message),
        };
      }
    }
    return { success: false, error: "Erro ao convidar usuário." };
  }
}

export async function deleteUser(id: number): Promise<ActionResult> {
  try {
    await api.deleteUser(id);
    return { success: true };
  } catch {
    return { success: false, error: `Erro ao remover usuário ${id}.` };
  }
}
