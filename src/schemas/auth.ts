import z from "zod";

export const LoginFormSchema = z.object({
  email: z.email({ message: "Insira um email válido." }).trim(),
  password: z.string().min(1, { message: "A senha é obrigatória." }).trim(),
});
