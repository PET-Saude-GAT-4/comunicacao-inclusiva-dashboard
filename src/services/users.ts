"use server";

import { ActionResult } from "@/types/common";
import { UserOutput } from "@/types/user";
import * as api from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";

export async function getUsers(): Promise<UserOutput[]> {
  return api.getUsers();
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
