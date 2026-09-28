"use server";

import { flattenError } from "zod";
import { AcceptInvitationSchema } from "@/schemas/invitation";
import { AcceptInvitationFormState } from "@/types/invitation";
import * as api from "@/lib/api/invitations";
import { ApiError } from "@/lib/api/client";

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
        const body = JSON.parse(e.message) as { message?: string };
        return { message: body.message ?? "Erro ao confirmar conta." };
      } catch {
        return { message: e.message || "Erro ao confirmar conta." };
      }
    }
    return { message: "Erro ao confirmar conta." };
  }
}

export async function resendInvitation(email: string): Promise<void> {
  try {
    await api.resendInvitation(email);
  } catch {
    // Silencioso por segurança — API sempre retorna resposta genérica
  }
}
