import { LoginResponse } from "@/utils/definitions";
import { apiFetch } from "./client";

export async function loginRequest(
  email: string,
  password: string,
): Promise<LoginResponse> {
  try {
    const data = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!data) throw new Error();
    return data;
  } catch {
    throw new Error("Email ou senha inválidos.");
  }
}

export async function registerRequest(
  email: string,
  password: string,
): Promise<void> {
  try {
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, role: "viewer" }),
    });
  } catch {
    throw new Error("Erro ao solicitar registro.");
  }
}
