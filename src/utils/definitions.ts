import z from "zod";

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

export type UserOutput = {
  id: number;
  uuid: string;
  email: string;
  roleId: number;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  token: string;
  user: UserOutput;
};
