"use server";

import { ActionResult } from "@/types/common";
import { UserOutput } from "@/types/user";
import * as api from "@/lib/api/users";

export async function getUsers(): Promise<UserOutput[]> {
  return api.getUsers();
}

export async function createUser(data: {
  email: string;
  roleId: number;
}): Promise<ActionResult> {
  try {
    await api.createUser(data);
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao convidar usuário." };
  }
}

export async function deleteUser(id: number): Promise<ActionResult> {
  try {
    await api.deleteUser(id);
    return { success: true };
  } catch {
    return { success: false, error: `Erro ao remover usuário ${id}.` };
  }
}
