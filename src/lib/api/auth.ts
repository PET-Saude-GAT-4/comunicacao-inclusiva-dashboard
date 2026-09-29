import { LoginResponse } from "@/types/auth";
import { apiFetch } from "./client";

export async function loginRequest(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!data) throw new Error("Resposta inesperada do servidor.");
  return data;
}
