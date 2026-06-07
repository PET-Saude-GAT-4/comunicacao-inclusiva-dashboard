"use server";

import { redirect } from "next/navigation";
import {
  LoginFormSchema,
  LoginFormState,
  RegisterFormSchema,
  RegisterFormState,
  SessionUser,
} from "@/utils/definitions";
import { createSession, deleteSession, getSession } from "@/utils/session";
import { loginRequest, registerRequest } from "@/lib/api/auth";

export async function login(
  state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const validated = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
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
    return { message: e instanceof Error ? e.message : String(e) };
  }

  redirect("/dashboard");
}

export async function register(
  state: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const validated = RegisterFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  try {
    await registerRequest(validated.data.email, validated.data.password);
  } catch (e) {
    return { message: e instanceof Error ? e.message : String(e) };
  }

  redirect("/login");
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
