import { UserOutput } from "./user";

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
export type LoginResponse = {
  token: string;
  user: UserOutput;
};
