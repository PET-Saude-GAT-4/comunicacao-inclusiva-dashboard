"use server";

import { redirect } from "next/navigation";
import { flattenError } from "zod";
import { LoginFormSchema } from "@/schemas/auth";
import { LoginFormState } from "@/types/auth";
import { SessionUser } from "@/types/session";
import { createSession, deleteSession, getSession } from "@/utils/session";
import { loginRequest } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

export async function login(
  state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const validated = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: flattenError(validated.error).fieldErrors };
  }

  try {
    const data = await loginRequest(
      validated.data.email,
      validated.data.password,
    );
    await createSession({
      token: data.token,
      uuid: data.user.uuid,
      email: data.user.email,
      role: data.user.role.name,
    });
  } catch (e) {
    if (e instanceof ApiError && e.status === 403) {
      return { message: "ACCOUNT_NOT_CONFIRMED" };
    }
    return { message: "Email ou senha inválidos." };
  }

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session
    ? { uuid: session.uuid, email: session.email, role: session.role }
    : null;
}
