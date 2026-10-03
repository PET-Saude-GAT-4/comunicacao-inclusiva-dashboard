import z from "zod";

export const LoginFormSchema = z.object({
  email: z.email({ message: "Insira um email válido." }).trim(),
  password: z.string().min(1, { message: "A senha é obrigatória." }).trim(),
});

export const RequestPasswordResetSchema = z.object({
  email: z.email({ message: "Insira um email válido." }).trim(),
});

export const ConfirmPasswordResetSchema = z
  .object({
    token: z
      .string()
      .trim()
      .min(1, { message: "Token de recuperação inválido ou ausente." }),
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
