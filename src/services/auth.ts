"use server";

import { redirect } from "next/navigation";
import { LoginFormSchema, LoginFormState, LoginResponse } from "@/utils/definitions";
import { createSession } from "@/utils/session";

export async function login(
  state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  const response = await fetch(`${process.env.API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    return {
      message: "Email ou senha inválidos.",
    };
  }

  const data: LoginResponse = await response.json();

  await createSession(data.token);

  redirect("/dashboard");
}
