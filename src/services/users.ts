"use server";

import { ActionResult, UserOutput } from "@/utils/definitions";
import * as api from "@/lib/api/users";

export async function getUsers(): Promise<UserOutput[]> {
  return api.getUsers();
}

export async function createUser(data: {
  email: string;
  password: string;
  role: string;
}): Promise<ActionResult> {
  try {
    await api.createUser(data);
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao criar usuário." };
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
