"use server";

import { getSession } from "@/utils/session";
import {
  ActionResult,
  ProfessionOutput,
  RoleOutput,
  SpecialityOutput,
  UserOutput,
} from "@/utils/definitions";

async function authHeaders(): Promise<Record<string, string>> {
  const session = await getSession();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.token ?? ""}`,
  };
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<UserOutput[]> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.API_URL}/users`, { headers });
  if (!response.ok) return [];
  const data = await response.json();
  return data.users;
}

export async function createUser(data: {
  email: string;
  password: string;
  role: string;
}): Promise<ActionResult> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.API_URL}/auth/register`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    return { success: false, error: "Erro ao criar usuário." };
  }
  return { success: true };
}

export async function deleteUser(id: number): Promise<ActionResult> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.API_URL}/users/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    return { success: false, error: `Erro ao remover usuário ${id}.` };
  }
  return { success: true };
}

// ─── Professions ──────────────────────────────────────────────────────────────

export async function getProfessions(): Promise<ProfessionOutput[]> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.API_URL}/professions`, {
    headers,
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.professions;
}

export async function createProfession(data: {
  name: string;
  code: string;
}): Promise<ActionResult> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.API_URL}/professions`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    return { success: false, error: "Erro ao criar profissão." };
  }
  return { success: true };
}

export async function deleteProfession(id: number): Promise<ActionResult> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.API_URL}/professions/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    return { success: false, error: `Erro ao remover profissão ${id}.` };
  }
  return { success: true };
}

// ─── Specialities ─────────────────────────────────────────────────────────────

export async function getSpecialities(): Promise<SpecialityOutput[]> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.API_URL}/specialities`, {
    headers,
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.specialities;
}

export async function createSpeciality(data: {
  name: string;
  code: string;
  professionCode: string;
}): Promise<ActionResult> {
  const headers = await authHeaders();
  const response = await fetch(
    `${process.env.API_URL}/professions/${data.professionCode}/specialities`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    return { success: false, error: "Erro ao criar especialidade." };
  }
  return { success: true };
}

export async function deleteSpeciality(id: number): Promise<ActionResult> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.API_URL}/specialities/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    return { success: false, error: `Erro ao remover especialidade ${id}.` };
  }
  return { success: true };
}

// ─── Roles ────────────────────────────────────────────────────────────────────

export async function getRoles(): Promise<RoleOutput[]> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.API_URL}/roles`, { headers });
  if (!response.ok) return [];
  const data = await response.json();
  return data.roles;
}

export async function createRole(data: {
  name: string;
}): Promise<ActionResult> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.API_URL}/roles`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    return { success: false, error: "Erro ao criar permissão." };
  }
  return { success: true };
}

export async function deleteRole(id: number): Promise<ActionResult> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.API_URL}/roles/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    return { success: false, error: `Erro ao remover permissão ${id}.` };
  }
  return { success: true };
}
