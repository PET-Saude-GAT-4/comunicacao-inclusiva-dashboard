import { apiFetch } from "./client";

export async function acceptInvitation(
  token: string,
  password: string,
): Promise<{ message: string }> {
  const data = await apiFetch<{ message: string }>("/invitations/accept", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
  if (!data) throw new Error("Erro ao confirmar conta.");
  return data;
}

export async function resendInvitation(
  email: string,
): Promise<{ message: string }> {
  const data = await apiFetch<{ message: string }>("/invitations/resend", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  if (!data) throw new Error("Erro ao reenviar convite.");
  return data;
}
