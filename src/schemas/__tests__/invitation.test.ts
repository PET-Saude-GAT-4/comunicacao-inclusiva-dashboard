import { fieldErrors as errorsOf } from "@test/unit/zod";
import { AcceptInvitationSchema } from "../invitation";

const fieldErrors = (input: unknown) =>
  errorsOf(AcceptInvitationSchema.safeParse(input));

describe("AcceptInvitationSchema", () => {
  it("accepts two matching passwords of 8 characters", () => {
    expect(
      AcceptInvitationSchema.safeParse({
        password: "12345678",
        confirmPassword: "12345678",
      }).success,
    ).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(
      fieldErrors({ password: "1234567", confirmPassword: "1234567" }).password,
    ).toEqual(["A senha deve ter no mínimo 8 caracteres."]);
  });

  it("rejects an empty confirmation", () => {
    expect(
      fieldErrors({ password: "12345678", confirmPassword: "" })
        .confirmPassword,
    ).toContain("A confirmação de senha é obrigatória.");
  });

  it("reports mismatched passwords on the confirmation field", () => {
    expect(
      fieldErrors({ password: "12345678", confirmPassword: "12345679" }),
    ).toEqual({ confirmPassword: ["As senhas não coincidem."] });
  });
});
