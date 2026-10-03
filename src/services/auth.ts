"use server";

import { redirect } from "next/navigation";
import { flattenError } from "zod";
import {
  ConfirmPasswordResetSchema,
  LoginFormSchema,
  RequestPasswordResetSchema,
} from "@/schemas/auth";
import {
  ConfirmPasswordResetFormState,
  LoginFormState,
  RequestPasswordResetFormState,
} from "@/types/auth";
import { SessionUser } from "@/types/session";
import { createSession, deleteSession, getSession } from "@/utils/session";
import {
  confirmPasswordResetRequest,
  loginRequest,
  requestPasswordResetRequest,
} from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

const SERVER_ERROR_MESSAGE =
  "Ocorreu um erro no servidor. Tente novamente mais tarde.";
const INVALID_RESET_TOKEN_MESSAGE =
  "Link de recuperação inválido ou expirado. Solicite uma nova recuperação.";

function extractApiMessage(error: ApiError): string | undefined {
  try {
    const body = JSON.parse(error.message) as {
      message?: string;
      error?: string;
    };
    return body.message || body.error;
  } catch {
    return error.message || undefined;
  }
}

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
    if (e instanceof ApiError) {
      if (e.status === 403) {
        return { message: "ACCOUNT_NOT_CONFIRMED" };
      }
      if (e.status === 401) {
        return { message: "E-mail ou senha incorretos." };
      }
      if (e.status === 500) {
        return {
          message: "Ocorreu um erro no servidor. Tente novamente mais tarde.",
        };
      }
    }
    return { message: "E-mail ou senha incorretos." };
  }

  redirect("/dashboard");
}

export async function requestPasswordReset(
  state: RequestPasswordResetFormState,
  formData: FormData,
): Promise<RequestPasswordResetFormState> {
  const validated = RequestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return { errors: flattenError(validated.error).fieldErrors };
  }

  try {
    await requestPasswordResetRequest(validated.data.email);
  } catch (e) {
    if (!(e instanceof ApiError) || e.status >= 500) {
      return { message: SERVER_ERROR_MESSAGE };
    }
    // Qualquer outra resposta é tratada como sucesso para não revelar
    // quais e-mails possuem conta.
  }

  return { success: true, email: validated.data.email };
}

export async function confirmPasswordReset(
  state: ConfirmPasswordResetFormState,
  formData: FormData,
): Promise<ConfirmPasswordResetFormState> {
  const validated = ConfirmPasswordResetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validated.success) {
    return { errors: flattenError(validated.error).fieldErrors };
  }

  try {
    await confirmPasswordResetRequest(
      validated.data.token,
      validated.data.password,
    );
  } catch (e) {
    if (!(e instanceof ApiError) || e.status >= 500) {
      return { message: SERVER_ERROR_MESSAGE };
    }

    if (extractApiMessage(e) === "The password must be 8 long") {
      return {
        errors: { password: ["A senha deve ter no mínimo 8 caracteres."] },
      };
    }

    // Token errado, expirado, já usado ou conta inválida:
    return { message: INVALID_RESET_TOKEN_MESSAGE, invalidToken: true };
  }

  redirect("/login?reset=success");
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
