import z from "zod";

export const AcceptInvitationSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "A senha deve ter no mínimo 8 caracteres." })
      .trim(),
    confirmPassword: z
      .string()
      .min(1, { message: "A confirmação de senha é obrigatória." })
      .trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });
