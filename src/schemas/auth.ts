import z from "zod";

export const LoginFormSchema = z.object({
  email: z.email({ message: "Insira um email válido." }).trim(),
  password: z.string().min(1, { message: "A senha é obrigatória." }).trim(),
});

export const RegisterFormSchema = z
  .object({
    email: z.email({ message: "Insira um email válido." }).trim(),
    password: z.string().min(1, { message: "A senha é obrigatória." }).trim(),
    confirmPassword: z
      .string()
      .min(1, { message: "A confirmação de senha é obrigatória." })
      .trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });
