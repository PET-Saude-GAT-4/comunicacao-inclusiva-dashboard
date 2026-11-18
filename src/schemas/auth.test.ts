import { flattenError } from "zod";
import {
  ConfirmPasswordResetSchema,
  LoginFormSchema,
  RequestPasswordResetSchema,
} from "./auth";

function fieldErrors(result: { success: boolean; error?: unknown }) {
  if (result.success) return {};
  return flattenError(result.error as never).fieldErrors as Record<
    string,
    string[] | undefined
  >;
}

describe("LoginFormSchema", () => {
  it("accepts an email and a password, trimming the password", () => {
    const result = LoginFormSchema.safeParse({
      email: "ana@example.com",
      password: " secret ",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      email: "ana@example.com",
      password: "secret",
    });
  });

  it("rejects a malformed email", () => {
    const result = LoginFormSchema.safeParse({
      email: "not-an-email",
      password: "secret",
    });

    expect(fieldErrors(result).email).toEqual(["Insira um email válido."]);
  });

  it("rejects an empty password", () => {
    const result = LoginFormSchema.safeParse({
      email: "ana@example.com",
      password: "",
    });

    expect(fieldErrors(result).password).toEqual(["A senha é obrigatória."]);
  });

  it("rejects missing fields, as FormData.get returns null for them", () => {
    const result = LoginFormSchema.safeParse({ email: null, password: null });

    expect(Object.keys(fieldErrors(result)).sort()).toEqual([
      "email",
      "password",
    ]);
  });
});

describe("RequestPasswordResetSchema", () => {
  it("accepts a valid email", () => {
    expect(
      RequestPasswordResetSchema.safeParse({ email: "ana@example.com" })
        .success,
    ).toBe(true);
  });

  it("rejects a malformed email", () => {
    const result = RequestPasswordResetSchema.safeParse({ email: "ana@" });

    expect(fieldErrors(result).email).toEqual(["Insira um email válido."]);
  });
});

describe("ConfirmPasswordResetSchema", () => {
  const valid = {
    token: "reset-token",
    password: "12345678",
    confirmPassword: "12345678",
  };

  it("accepts a token and two matching passwords of 8 characters", () => {
    expect(ConfirmPasswordResetSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a blank token", () => {
    const result = ConfirmPasswordResetSchema.safeParse({
      ...valid,
      token: "   ",
    });

    expect(fieldErrors(result).token).toEqual([
      "Token de recuperação inválido ou ausente.",
    ]);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = ConfirmPasswordResetSchema.safeParse({
      ...valid,
      password: "1234567",
      confirmPassword: "1234567",
    });

    expect(fieldErrors(result).password).toEqual([
      "A senha deve ter no mínimo 8 caracteres.",
    ]);
  });

  it("rejects an empty confirmation", () => {
    const result = ConfirmPasswordResetSchema.safeParse({
      ...valid,
      confirmPassword: "",
    });

    expect(fieldErrors(result).confirmPassword).toContain(
      "A confirmação de senha é obrigatória.",
    );
  });

  it("reports mismatched passwords on the confirmation field", () => {
    const result = ConfirmPasswordResetSchema.safeParse({
      ...valid,
      confirmPassword: "87654321",
    });

    expect(fieldErrors(result)).toEqual({
      confirmPassword: ["As senhas não coincidem."],
    });
  });
});
