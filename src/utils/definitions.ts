import z from "zod";

export type Role = "super_admin" | "admin" | "viewer";

export const LoginFormSchema = z.object({
  email: z.email({ message: "Insira um email válido." }).trim(),
  password: z.string().min(1, { message: "A senha é obrigatória." }).trim(),
});

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type RoleOutput = {
  id: number;
  name: Role;
  createdAt: string;
  updatedAt: string;
};

export type ProfessionOutput = {
  id: number;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

export type SpecialityOutput = {
  id: number;
  name: string;
  code: string;
  professionCode: string;
  createdAt: string;
  updatedAt: string;
};

export type ActionResult = { success: boolean; error?: string };

export type UserOutput = {
  id: number;
  uuid: string;
  email: string;
  role: RoleOutput;
  createdAt: string;
  updatedAt: string;
};

export type SessionPayload = {
  token: string;
  email: string;
  role: Role;
};

export type LoginResponse = {
  token: string;
  user: UserOutput;
};

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

export type RegisterFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
      };
      message?: string;
    }
  | undefined;
