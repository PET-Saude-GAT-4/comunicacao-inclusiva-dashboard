import { getSession } from "@/utils/session";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const session = await getSession();
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${process.env.API_URL}${path}`, {
    ...options,
    headers: {
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...(session?.token && { Authorization: `Bearer ${session.token}` }),
      ...options.headers,
    },
  });

  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json() as Promise<T>;
}
