import { Role } from "./role";

export type SessionPayload = {
  token: string;
  uuid: string;
  email: string;
  role: Role;
};

export type SessionUser = {
  uuid: string;
  email: string;
  role: Role;
};
