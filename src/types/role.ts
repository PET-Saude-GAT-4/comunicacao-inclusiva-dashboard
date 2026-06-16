export type Role = "super_admin" | "admin" | "viewer";

export type RoleOutput = {
  id: number;
  name: Role;
  createdAt: string;
  updatedAt: string;
};
