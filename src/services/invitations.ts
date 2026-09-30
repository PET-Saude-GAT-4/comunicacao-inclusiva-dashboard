"use server";

import { flattenError } from "zod";
import { AcceptInvitationSchema } from "@/schemas/invitation";
import { AcceptInvitationFormState } from "@/types/invitation";
import * as api from "@/lib/api/invitations";
import { ApiError } from "@/lib/api/client";

function translateInvitationError(status: number, rawMessage?: string): string {
  if (!rawMessage) return "Erro ao confirmar conta.";

  if (status === 400) {
    switch (rawMessage) {
      case "Token and password are required.":
        return "Token de convite ou senha não informados.";
      case "Invalid invitation token":
        return "Link de convite inválido ou inexistente.";
      case "This invitation has already been used":
        return "Este convite já foi utilizado. Faça login com sua senha.";
      case "This invitation has expired. Please request a new one":
        return "Este convite expirou. Solicite o reenvio de um novo convite na tela de login.";
      case "The password must be 8 long":
        return "A senha deve ter no mínimo 8 caracteres.";
    }
  }

  if (status === 500) {
    return "Ocorreu um erro no servidor. Tente novamente mais tarde.";
  }

  return "Erro ao confirmar conta. Verifique os dados informados.";
}

export async function acceptInvitation(
  token: string,
  state: AcceptInvitationFormState,
  formData: FormData,
): Promise<AcceptInvitationFormState> {
  const validated = AcceptInvitationSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!validated.success) {
    return { errors: flattenError(validated.error).fieldErrors };
  }
  try {
    await api.acceptInvitation(token, validated.data.password);
    return { success: true, message: "Conta ativada com sucesso!" };
  } catch (e) {
    if (e instanceof ApiError) {
      try {
        const body = JSON.parse(e.message) as {
          message?: string;
          error?: string;
        };
        const rawMessage = body.message || body.error;
        return { message: translateInvitationError(e.status, rawMessage) };
      } catch {
        return { message: translateInvitationError(e.status, e.message) };
      }
    }
    return { message: "Erro ao confirmar conta." };
  }
}

export async function resendInvitation(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await api.resendInvitation(email);
    return { success: true };
  } catch (e) {
    if (e instanceof ApiError && e.status === 500) {
      return {
        success: false,
        error: "Ocorreu um erro no servidor. Tente novamente mais tarde.",
      };
    }
    // Silencioso por segurança para outros erros (ex: 400 ou vazamento de existência)
    return { success: true };
  }
}
