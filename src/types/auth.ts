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

export type RequestPasswordResetFormState =
  | {
      errors?: {
        email?: string[];
      };
      message?: string;
      success?: boolean;
      email?: string;
    }
  | undefined;

export type ConfirmPasswordResetFormState =
  | {
      errors?: {
        token?: string[];
        password?: string[];
        confirmPassword?: string[];
      };
      message?: string;
      invalidToken?: boolean;
    }
  | undefined;
