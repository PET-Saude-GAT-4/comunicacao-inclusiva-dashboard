import { RoleOutput } from "./role";

export type UserOutput = {
  id: number;
  uuid: string;
  email: string;
  role: RoleOutput;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
