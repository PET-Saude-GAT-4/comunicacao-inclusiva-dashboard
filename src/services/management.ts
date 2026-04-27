"use server";

import { getSession } from "@/utils/session";
import {
  ActionResult,
  BoardOutput,
  PictogramOutput,
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

// ─── Pictograms ───────────────────────────────────────────────────────────────

export async function getPictograms(): Promise<PictogramOutput[]> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.API_URL}/pictograms`, {
    headers,
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.pictograms as PictogramOutput[];
}

export async function getPictogram(
  uuid: string,
): Promise<PictogramOutput | null> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.API_URL}/pictograms/${uuid}`, {
    headers,
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.pictogram as PictogramOutput;
}

export async function createPictogram(
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSession();
  const response = await fetch(`${process.env.API_URL}/pictograms`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session?.token ?? ""}` },
    body: formData,
  });
  if (!response.ok) {
    return { success: false, error: "Erro ao criar pictograma." };
  }
  return { success: true };
}

export async function deletePictogram(uuid: string): Promise<ActionResult> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.API_URL}/pictograms/${uuid}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    return { success: false, error: `Erro ao remover pictograma ${uuid}.` };
  }
  return { success: true };
}

// ─── Boards ───────────────────────────────────────────────────────────────────

export async function getBoards(): Promise<BoardOutput[]> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.API_URL}/boards`, { headers });
  if (!response.ok) return [];
  const data = await response.json();
  return data.boards;
}

export async function getBoard(uuid: string): Promise<BoardOutput | null> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.API_URL}/boards/${uuid}`, {
    headers,
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.board;
}

export async function createBoard(data: {
  title: string;
  representativeUuid: string;
}): Promise<ActionResult> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.API_URL}/boards`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: data.title,
      representativeUuid: data.representativeUuid,
    }),
  });
  if (!response.ok) {
    return { success: false, error: "Erro ao criar prancha." };
  }
  return { success: true };
}

export async function deleteBoard(uuid: string): Promise<ActionResult> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.API_URL}/boards/${uuid}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    return { success: false, error: `Erro ao remover prancha ${uuid}.` };
  }
  return { success: true };
}

// ─── Board Pictograms ─────────────────────────────────────────────────────────

export async function getBoardPictograms(
  boardUuid: string,
): Promise<PictogramOutput[]> {
  const headers = await authHeaders();
  const response = await fetch(
    `${process.env.API_URL}/boards/${boardUuid}/pictograms`,
    { headers },
  );
  if (!response.ok) return [];
  const data = await response.json();
  return data.pictograms as PictogramOutput[];
}

export async function addPictogramToBoard(
  boardUuid: string,
  data: { pictogramUuid: string; order?: number },
): Promise<ActionResult> {
  const headers = await authHeaders();
  const body: Record<string, unknown> = { pictogramUuid: data.pictogramUuid };
  if (data.order !== undefined) body.order = data.order;
  const response = await fetch(
    `${process.env.API_URL}/boards/${boardUuid}/pictograms`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
  );
  if (!response.ok) {
    if (response.status === 409) {
      return { success: false, error: "Pictograma já está nesta prancha." };
    }
    return { success: false, error: "Erro ao adicionar pictograma à prancha." };
  }
  return { success: true };
}
