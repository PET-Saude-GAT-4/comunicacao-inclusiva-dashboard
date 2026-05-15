"use server";

import { revalidatePath } from "next/cache";
import {
  ActionResult,
  ProfessionOutput,
  SpecialityOutput,
} from "@/utils/definitions";
import * as api from "@/lib/api/professions";

export async function getProfessions(): Promise<ProfessionOutput[]> {
  return api.getProfessions();
}

export async function createProfession(data: {
  name: string;
  code: string;
}): Promise<ActionResult> {
  try {
    await api.createProfession(data);
    revalidatePath("/management/professions");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao criar profissão." };
  }
}

export async function deleteProfession(id: number): Promise<ActionResult> {
  try {
    await api.deleteProfession(id);
    revalidatePath("/management/professions");
    return { success: true };
  } catch {
    return { success: false, error: `Erro ao remover profissão ${id}.` };
  }
}

export async function getSpecialities(): Promise<SpecialityOutput[]> {
  return api.getSpecialities();
}

export async function createSpeciality(data: {
  name: string;
  code: string;
  professionCode: string;
}): Promise<ActionResult> {
  try {
    await api.createSpeciality(data);
    revalidatePath("/management/specialities");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao criar especialidade." };
  }
}

export async function deleteSpeciality(id: number): Promise<ActionResult> {
  try {
    await api.deleteSpeciality(id);
    revalidatePath("/management/specialities");
    return { success: true };
  } catch {
    return { success: false, error: `Erro ao remover especialidade ${id}.` };
  }
}
