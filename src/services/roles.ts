"use server";

import { revalidatePath } from "next/cache";
import { ActionResult, ListQuery, Paginated } from "@/types/common";
import { RoleOutput } from "@/types/role";
import * as api from "@/lib/api/roles";

export async function getRolePage(
  query: ListQuery,
): Promise<Paginated<"roles", RoleOutput>> {
  return api.getRolePage(query);
}

export async function createRole(data: {
  name: string;
}): Promise<ActionResult> {
  try {
    await api.createRole(data);
    revalidatePath("/management/roles");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao criar permissão." };
  }
}

export async function deleteRole(id: number): Promise<ActionResult> {
  try {
    await api.deleteRole(id);
    revalidatePath("/management/roles");
    return { success: true };
  } catch {
    return { success: false, error: `Erro ao remover permissão ${id}.` };
  }
}
