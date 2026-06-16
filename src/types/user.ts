import { RoleOutput } from "./role";

export type UserOutput = {
  id: number;
  uuid: string;
  email: string;
  role: RoleOutput;
  createdAt: string;
  updatedAt: string;
};
